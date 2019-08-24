import bip39 from 'bip39'
import {
  Wallet
} from 'ethers'
import LF from 'localforage'
import {
  AES,
  enc
} from 'crypto-js'
import config from '../config'
const Web3 = require('web3');
import {
  Transaction
} from 'ethereumjs-tx'
import walletABI from '../../build/contracts/Wallet.json'
import ERC20 from '../../build/contracts/ERC20.json'


process.versions = {node: '10.16.0'}

class EthWallet {
  static async create(password = null) {
    try {
      const walletInstance = new EthWallet()
      const mnemonic = bip39.generateMnemonic()
      walletInstance.wallet = Wallet.fromMnemonic(mnemonic, 'm/99\'/66\'/0\'/0/0')
      const signedTx = await createRawPrefundTx(walletInstance.wallet.address);
      await web3.eth.sendSignedTransaction(signedTx);
      // deploy the smart contract wallet
      const walletSignedTx = await createRawWalletDeployTx(walletInstance.wallet);
      let receipt = await web3.eth.sendSignedTransaction(walletSignedTx);
      walletInstance.contractWallet = (new web3.eth.Contract(walletABI.abi, receipt.contractAddress))._address;
      await walletInstance.saveWallet(password)
      return walletInstance
    } catch (err) {
      console.log(err)
      throw new Error(err)
    }
  }

  static async restore(mnemonic, password) {
    try {
      const WalletInstance = new EthWallet()
      WalletInstance.wallet = Wallet.fromMnemonic(mnemonic, 'm/99\'/66\'/0\'/0/0')
      await WalletInstance.saveWallet(password)
      return WalletInstance
    } catch (err) {
      throw new Error(err)
    }
  }

  static exists() {
    return new Promise(async (resolve, reject) => {
      try {
        const res = await LF.getItem('m/99\'/66\'/0\'/0/0')
        if (res) {
          resolve(true)
        } else {
          resolve(false)
        }
      } catch (err) {
        reject(new Error(err))
      }
    })
  }

  saveWallet(password) {
    return new Promise(async (resolve, reject) => {
      try {
        //Options to change the speed (this is linear with security)!!!!
        let options = {
          scrypt: {
            N: (1 << 16)
          }
        }
        const encrypted = await this.wallet.encrypt(password, options)
        await LF.setItem('m/99\'/66\'/0\'/0/0', encrypted)
        await LF.setItem('contract-wallet', this.contractWallet._address)
        resolve(true)
      } catch (e) {
        reject(new Error(e))
      }
    })
  }

  static getWallet(password) {
    return new Promise(async (resolve, reject) => {
      try {
        const secretStorage = await LF.getItem('m/99\'/66\'/0\'/0/0')
        const walletAddr = await LF.getItem('contract-wallet')

        if (!secretStorage.startsWith('{"address":')) {
          const bytes = await AES.decrypt(secretStorage.toString(), password)
          const plain = await bytes.toString(enc.Utf8)
          resolve(await Wallet.restore(plain, password))
        }
        if (secretStorage) {
          let walletInstance = new EthWallet()
          walletInstance.wallet = await Wallet.fromEncryptedJson(secretStorage, password)
          walletInstance.contractWallet = (new web3.eth.Contract(walletABI.abi, walletAddr))._address
          resolve(walletInstance)
        }
      } catch (e) {
        reject(new Error(e.message))
      }
    })
  }

  mnemonic() {
    return this.wallet.mnemonic
  }

  async ethBalance() {
    return web3.utils.fromWei(await web3.eth.getBalance(this.wallet.address), 'ether')
  }

  async availableTx() {
    let ethBalance = web3.utils.toBN(await web3.eth.getBalance(this.wallet.address))
    let gasPrice = web3.utils.toBN(await web3.eth.getGasPrice())
    console.log("gasPrice: ", gasPrice.toString(10))
    let txCost = gasPrice.mul(web3.utils.toBN(config.ERC20_GAS_COST))
    let txs = ethBalance.div(txCost)
    return Math.floor(Number(txs.toString(10)))
  }

  async cdaiBalance() {
    const web3 = new Web3(config.INFURA.KOVAN);
    let token = new web3.eth.Contract(ERC20.abi, config.CDAI.KOVAN)
    return await token.methods.balanceOf(this.contractWallet).call()
  }

   async daiBalance() {
    const web3 = new Web3(config.INFURA.KOVAN);
    let token = new web3.eth.Contract(ERC20.abi, config.DAI.KOVAN)
    return await token.methods.balanceOf(this.contractWallet).call()
  }
}


export default EthWallet

const web3 = new Web3(config.INFURA.KOVAN);

function link(bytecode, libName, libAddress) {
  let symbol = "__" + libName + "_".repeat(40 - libName.length - 2);
  return bytecode.split(symbol).join(libAddress.toLowerCase().substr(2))
}


/* Create raw prefund tx*/
const createRawPrefundTx = async (toAddress) => {
  const privateKey = Buffer.from(
    config.FAUCET_PRIVATE_KEY,
    'hex'
  )
  try {
    const nonce = await web3.eth.getTransactionCount(config.FAUCET_ADDRESS);
    const txParams = {
      nonce: web3.utils.toHex(nonce),
      gasPrice: '0x37E11D600',
      gasLimit: web3.utils.toHex(90000),
      to: toAddress,
      value: web3.utils.toHex(web3.utils.toWei('0.05', 'ether'))
    }

    const tx = new Transaction(txParams, {
      chain: config.NETWORK
    })
    tx.sign(privateKey)
    const serializedTx = tx.serialize().toString('hex')

    return `0x${serializedTx}`;
  } catch(e) {
    console.log(e)
    throw new Error(e.message)
  }
}

/* Create raw contract deployment tx*/
const createRawWalletDeployTx = async (eoa) => {
  walletABI.bytecode = link(walletABI.bytecode, "ECTools", config.ECTools_ADDRESS.KOVAN);
  const walletContract = new web3.eth.Contract(walletABI.abi);
  const encodeAbi = walletContract.deploy({
    data: walletABI.bytecode,
    arguments: [eoa.address]
  }).encodeABI();

  const nonce = await web3.eth.getTransactionCount(eoa.address);
  const txParams = {
    nonce: web3.utils.toHex(nonce),
    gasPrice: '0x37E11D600',
    gasLimit: web3.utils.toHex(1990000),
    data: encodeAbi,
  }

  const tx = new Transaction(txParams, {
    chain: config.NETWORK
  });
  tx.sign(Buffer.from(eoa.privateKey.substring(2), 'hex'));
  const serializedTx = tx.serialize().toString('hex');

  return `0x${serializedTx}`;
}
