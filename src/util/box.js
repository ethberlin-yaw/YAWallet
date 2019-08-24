
  const Web3 = require('web3')
import config from '../config'
const web3 = new Web3(config.INFURA.RINKEBY)
import {providers, Wallet} from 'ethers'


export async function open3Box(wallet) {
    let wall = new Wallet(wallet.privateKey, new providers.Web3Provider(web3.currentProvider))
    console.log(wall)
    let box = await Box.openBox(wallet.address, wall.provider)
    return box
}