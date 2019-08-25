import { getContractAddress } from "ethers/utils";


 
const ethProvider = wallet => {
    return {
        sendAsync: (data, callback) => {
            wallet.signMessage(data.params[0]).then(result => {
              callback(null, { result })
            })
          }
    }
  }

  let box 
export async function open3Box(wallet) {
    box = await Box.openBox(wallet.address, ethProvider(wallet))
    console.log(box)
    return box
}

export async function newContact(address, name) {
   let contacts = await box.openSpace("contacts")
    await contacts.private.set(address, name)
    console.log(await contacts.private.all())
}

export async function getContacts() {
    let contacts = await box.openSpace("contacts")
    return await contacts.private.all()
}