const wallet = require('../build/contracts/Wallet.json')

function link(bytecode, libName, libAddress) {
    let symbol = "__" + libName + "_".repeat(40 - libName.length - 2);
    return bytecode.split(symbol).join(libAddress.toLowerCase().substr(2))
  }

console.log(wallet.bytecode)


wallet.bytecode = link(wallet.bytecode, "ECTools", "0xfadeab7b31966083ecc19ae8a720218b45f50547")

console.log(wallet.bytecode)