const config =  require('../config');
const Transaction = require('ethereumjs-tx').Transaction;
const Web3 = require('web3');
const cdaiABI = require('./abi/cdai.json');
const daiABI = require('./abi/dai.json');
const exchangeABI = require('./abi/uniswap_exchange.json');

const web3 = new Web3(config.INFURA.RINKEBY);

// TODO: token.approve, exchange.addLiquidity
const liquidateExchange = async (senderWallet) => {
  const DEADLINE =  1739591241;
  const ETH_ADDED = web3.utils.toHex(1*10**17) // 0.1 ETH
  const TOKEN_ADDED = web3.utils.toHex(15*10**18) // 15  tokens

  const exchange = new web3.eth.Contract(exchangeABI, config.UNISWAP_EXCHANGE.RINKEBY);
  const encodeAbi = exchange.methods.addLiquidity(10, 1500000000, DEADLINE).encodeABI();

  const nonce = await web3.eth.getTransactionCount(senderWallet.address);
  const txParams = {
    nonce: web3.utils.toHex(nonce),
    gasPrice: '0x37E11D600',
    gasLimit: web3.utils.toHex(1990000),
    to: config.UNISWAP_EXCHANGE.RINKEBY,
    data: encodeAbi,
    value: ETH_ADDED,
  }

  const tx = new Transaction(txParams, {
    chain: config.NETWORK
  });
  tx.sign(Buffer.from(senderWallet.privateKey.substring(2), 'hex'));
  const serializedTx = tx.serialize().toString('hex');

  const exchangeReceipt = await web3.eth.sendSignedTransaction(`0x${serializedTx}`);
  console.log('exchange liquidity receipt: ', exchangeReceipt);

  return exchangeReceipt;
};

const approve = async (senderWallet) => {
  const cDai = new web3.eth.Contract(cdaiABI, config.CDAI.RINKEBY);
  const encodeAbi = cDai.methods.approve(config.UNISWAP_EXCHANGE.RINKEBY, '100000000000').encodeABI();

  const nonce = await web3.eth.getTransactionCount(senderWallet.address);
  const txParams = {
    nonce: web3.utils.toHex(nonce),
    gasPrice: '0x37E11D600',
    gasLimit: web3.utils.toHex(1990000),
    to: config.CDAI.RINKEBY,
    data: encodeAbi,
  }

  const tx = new Transaction(txParams, {
    chain: config.NETWORK
  });
  tx.sign(Buffer.from(senderWallet.privateKey.substring(2), 'hex'));
  const serializedTx = tx.serialize().toString('hex');

  const compoundReceipt = await web3.eth.sendSignedTransaction(`0x${serializedTx}`);

  console.log('approve receipt:', compoundReceipt);
};

// Swap cDai for ETH
const swap = async (senderWallet, eoaAddress) => {
  await approve(senderWallet);

  const DEADLINE =  9742680400;
  const exchange = new web3.eth.Contract(exchangeABI, config.UNISWAP_EXCHANGE.RINKEBY);
  const encodeAbi = exchange.methods.tokenToEthTransferInput(100000000, '10000', DEADLINE, eoaAddress).encodeABI();

  const nonce = await web3.eth.getTransactionCount(senderWallet.address);
  const txParams = {
    nonce: web3.utils.toHex(nonce),
    gasPrice: '0x37E11D600',
    gasLimit: web3.utils.toHex(1990000),
    to: config.UNISWAP_EXCHANGE.RINKEBY,
    data: encodeAbi,
  }

  const tx = new Transaction(txParams, {
    chain: config.NETWORK
  });
  tx.sign(Buffer.from(senderWallet.privateKey.substring(2), 'hex'));
  const serializedTx = tx.serialize().toString('hex');

  const swapReceipt = await web3.eth.sendSignedTransaction(`0x${serializedTx}`);
  console.log('exchange liquidity receipt: ', swapReceipt);

  return swapReceipt;
};

const getPrice = async () => {
  const exchange = new web3.eth.Contract(exchangeABI, config.UNISWAP_EXCHANGE.RINKEBY);
  const price = (await exchange.methods.getTokenToEthInputPrice(100000000).call()) / 1e18;

  console.log('price: ', price);
}

const redeem = async (senderWallet, eoaAddress) => {
  const cDai = new web3.eth.Contract(cdaiABI, config.CDAI.RINKEBY);
  const encodeAbi = cDai.methods.redeem(100000000).encodeABI();

  const nonce = await web3.eth.getTransactionCount(senderWallet.address);
  const txParams = {
    nonce: web3.utils.toHex(nonce),
    gasPrice: '0x37E11D600',
    gasLimit: web3.utils.toHex(1990000),
    to: config.CDAI.RINKEBY,
    data: encodeAbi,
  }

  const tx = new Transaction(txParams, {
    chain: config.NETWORK
  });
  tx.sign(Buffer.from(senderWallet.privateKey.substring(2), 'hex'));
  const serializedTx = tx.serialize().toString('hex');

  const compoundReceipt = await web3.eth.sendSignedTransaction(`0x${serializedTx}`);

  console.log('compound receipt:', compoundReceipt);
};

module.exports = { liquidateExchange, swap, redeem };

/*******************************************************************************/
// test
const sender = {
  address: '0x86005Cda50E5F22bD55d6B454b3765A499991e27',
  privateKey: '0xa0297f95a9565856b13f76feb4b2d09fea5514cd8e9ac7901165984463d7dedd',
};

// getPrice();
// liquidateExchange(sender);
swap(sender, '0x5409ED021D9299bf6814279A6A1411A7e866A631');
// redeem(sender, '0x5409ED021D9299bf6814279A6A1411A7e866A631');
