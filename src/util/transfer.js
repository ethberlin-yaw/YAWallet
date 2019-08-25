import ERC20 from '../../build/contracts/ERC20.json'
import config from '../config'
import {Wallet, Contract, providers, utils} from 'ethers'
import {swap} from './swap'

export async function transferDAI(to, amount, wallet) {
    wallet = new Wallet(wallet.privateKey, new providers.JsonRpcProvider(config.INFURA.RINKEBY))
    let dai = new Contract(config.DAI.RINKEBY, ERC20.abi, wallet)
    await swap(wallet, wallet.address)
    console.log("swap complete")
    await dai.transfer(to, utils.parseEther(amount))
}