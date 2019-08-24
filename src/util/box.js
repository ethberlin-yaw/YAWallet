

 
const ethProvider = wallet => {
    return {
        sendAsync: (data, callback) => {
            wallet.signMessage(data.params[0]).then(result => {
              callback(null, { result })
            })
          }
    }
  }

export async function open3Box(wallet) {
    let box = await Box.openBox(wallet.address, ethProvider(wallet))
    console.log(box)
    return box
}