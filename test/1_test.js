const Wallet = artifacts.require('Wallet')
const ECTools = artifacts.require('ECTools')
const Token = artifacts.require('Token')
const utils = require('ethers').utils

const assertRevert = async promise => {
    try {
      await promise
      assert.fail('Expected error not received')
    } catch (error) {
      const rev = error.message.search('revert') >= 0
      assert(rev, `Expected "revert", got ${error.message} instead`)
    }
  }

contract('Wallet.sol ETH hold/send/receive', (accounts) => {
    let wallet, ecTools;
    before(async () => {
        ecTools = await ECTools.new()
        await Wallet.link('ECTools', ecTools.address)
        wallet = await Wallet.new(accounts[0]) 
    })

    it('Wallet can receive $ETH', async () => {
        await wallet.sendTransaction({value: "100"})
        assert.equal("100", (await web3.eth.getBalance(wallet.address)).toString(10))
    })

    it('$ETH can be withdrawn from wallet', async () => {
        // encode & sign a transaction with no data and master as target 
        const transferHash = utils.solidityKeccak256(['address', 'uint256', 'bytes'], [accounts[0], 100, '0x0'])
        const transferSignature = await web3.eth.sign(transferHash, accounts[0])
        // Execute the meta transaction , this will make the contract send ether 
        await wallet.execute([accounts[0]], [100], ['0x0'], [transferSignature])
        // await wallet.withdrawETH('100')
        assert.equal("0", (await web3.eth.getBalance(wallet.address)).toString(10))
    })

    it('Only master can withdraw $ETH', async () => {
        // Do the same but this time sign with an account that does not have permissions
        await wallet.sendTransaction({value: "100"})
        const transferHash = utils.solidityKeccak256(['address', 'uint256', 'bytes'], [accounts[1], 100, '0x0'])
        const transferSignature = await web3.eth.sign(transferHash, accounts[1])
        await assertRevert(wallet.execute([accounts[1]], [100], ['0x0'], [transferSignature], {from: accounts[1]}))
        // await assertRevert(wallet.withdrawETH('100', {from: accounts[1]}))
    })
})

contract('Wallet.sol ERC20 hold/send/receive', (accounts) => {
    let wallet, token, ecTools;
    before(async () => {
        ecTools = await ECTools.new()
        await Wallet.link('ECTools', ecTools.address)
        wallet = await Wallet.new(accounts[0])
        token = await Token.new("TestToken", "TEST", 18)
        // give master some tokens 
        let tx = await token.mint(accounts[0], "1000")
    })

    it('Wallet can receive ERC20', async () => {
        // transfer tokens to wallet contract
        await token.transfer(wallet.address, "1000")
        assert.equal((await token.balanceOf(wallet.address)).toString(10), "1000")
    })

    it('ERC20 can be withdrawn from wallet', async () => {
        // Encode & sign a transaction that calls ERC20.transfer()
        const transferData = token.contract.methods.transfer(accounts[0], "1000").encodeABI()
        const transferHash = utils.solidityKeccak256(['address', 'uint256', 'bytes'], [token.address, 0, utils.arrayify(transferData)])
        const transferSignature = await web3.eth.sign(transferHash, accounts[0])
        // Execute the meta transaction on behalf of the wallet contract, making it send ERC20 tokens to master
        await wallet.execute([token.address], [0], [transferData], [transferSignature])
        // await wallet.withdrawERC20(token.address, "1000")
        assert.equal((await token.balanceOf(accounts[0])).toString(10), "1000")
        assert.equal((await token.balanceOf(wallet.address)).toString(10), "0")
    })

    it('Only master can withdraw ERC20', async () => {
        // Same thing but sign with an account that does not have permissions
        await token.transfer(wallet.address, "10")
        const transferData = token.contract.methods.transfer(accounts[1], "10").encodeABI()
        const transferHash = utils.solidityKeccak256(['address', 'uint256', 'bytes'], [token.address, 0, utils.arrayify(transferData)])
        const transferSignature = await web3.eth.sign(transferHash, accounts[1])
        await assertRevert(wallet.execute([token.address], [0], [transferData], [transferSignature]))
        // await assertRevert(wallet.withdrawERC20(token.address, "10", {from: accounts[1]}))
    })
})
