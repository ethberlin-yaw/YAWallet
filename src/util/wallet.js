import bip39 from 'bip39'
import {
  Wallet
} from 'ethers'
import LF from 'localforage'
import {AES, enc} from 'crypto-js'
import { cpus } from 'os';

class EthWallet {
  static async create(password = null) {
    try {
      const walletInstance = new EthWallet()
      const mnemonic = bip39.generateMnemonic()
      walletInstance.wallet = Wallet.fromMnemonic(mnemonic, 'm/99\'/66\'/0\'/0/0')
      await walletInstance.saveWallet(password)
      return walletInstance
    } catch (err) {
      throw new Error(err)
    }
  }

  static async restore (mnemonic, password) {
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
        if (!secretStorage.startsWith('{"address":')) {
          const bytes = await AES.decrypt(secretStorage.toString(), password)
          const plain = await bytes.toString(enc.Utf8)
          resolve(await Wallet.restore(plain, password))
        }
        if (secretStorage ) {
          resolve(await Wallet.fromEncryptedJson(secretStorage, password))
        }
      } catch (e) {
        reject(new Error(e.message))
      }
    })
  }

  mnemonic() {
    return this.wallet.mnemonic
  }
}


export default EthWallet