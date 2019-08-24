const config =  require('../config');
const Transaction = require('ethereumjs-tx').Transaction;
const Web3 = require('web3');
const cdaiABI = require('./abi/cdai.json');
const daiABI = require('./abi/dai.json');

const web3 = new Web3(config.INFURA.KOVAN);

// approve transfer_from in dai contract
const approveByDai = async (senderWallet) => {
  const dai = new web3.eth.Contract(daiABI, config.DAI.KOVAN);
  const encodeAbi = dai.methods.approve(config.CDAI.KOVAN, '115792089237316195423570985008687907853269984665640564039457584007913129639935').encodeABI();

  const nonce = await web3.eth.getTransactionCount(senderWallet.address);
  const txParams = {
    nonce: web3.utils.toHex(nonce),
    gasPrice: '0x37E11D600',
    gasLimit: web3.utils.toHex(1990000),
    to: config.DAI.KOVAN,
    data: encodeAbi,
  }

  const tx = new Transaction(txParams, {
    chain: config.NETWORK
  });
  tx.sign(Buffer.from(senderWallet.privateKey.substring(2), 'hex'));
  const serializedTx = tx.serialize().toString('hex');

  const daiReceipt = await web3.eth.sendSignedTransaction(`0x${serializedTx}`);
};

// mint cdai by cdai contract
const mintByCdai = async (senderWallet, amount) => {
  // mint
  const cDai = new web3.eth.Contract(cdaiABI, config.CDAI.KOVAN);
  const encodeAbi = cDai.methods.mint(amount).encodeABI();

  const nonce = await web3.eth.getTransactionCount(senderWallet.address);
  const txParams = {
    nonce: web3.utils.toHex(nonce),
    gasPrice: '0x37E11D600',
    gasLimit: web3.utils.toHex(1990000),
    to: config.CDAI.KOVAN,
    data: encodeAbi,
  }

  const tx = new Transaction(txParams, {
    chain: config.NETWORK
  });
  tx.sign(Buffer.from(senderWallet.privateKey.substring(2), 'hex'));
  const serializedTx = tx.serialize().toString('hex');

  const compoundReceipt = await web3.eth.sendSignedTransaction(`0x${serializedTx}`);

  return compoundReceipt;
};


const supplyToCompound = async (senderWallet, amount) => {
  // approve transfer_from by dai
  await approveByDai(senderWallet);

  // mint cdai
  const receipt = await mintByCdai(senderWallet, amount);
  console.log('receipt', receipt);
  return receipt;
};

const mintByDai = async (senderWallet) => {
  const dai = new web3.eth.Contract(daiABI, config.DAI.KOVAN);
  const encodeAbi = dai.methods.allocateTo(senderWallet.address, '100000000000000000000').encodeABI();

  const nonce = await web3.eth.getTransactionCount(senderWallet.address);
  const txParams = {
    nonce: web3.utils.toHex(nonce),
    gasPrice: '0x37E11D600',
    gasLimit: web3.utils.toHex(1990000),
    to: config.DAI.KOVAN,
    data: encodeAbi,
  }

  const tx = new Transaction(txParams, {
    chain: config.NETWORK
  });
  tx.sign(Buffer.from(senderWallet.privateKey.substring(2), 'hex'));
  const serializedTx = tx.serialize().toString('hex');

  const daiReceipt = await web3.eth.sendSignedTransaction(`0x${serializedTx}`);
  console.log('dai mint receipt: ', daiReceipt);

  return daiReceipt;
};

// currentDaiBalance - amount of DAIs supplied to compounnd
const currentRewardsinDollar = async (currentDaiBalance, senderWallet) => {
  const cDai = new web3.eth.Contract(cdaiABI, config.CDAI.KOVAN);
  const balanceWithInterest = (await cDai.methods.balanceOfUnderlying(senderWallet.address).call()) / 1e18;

  console.log('currentRewardsinDollar: ',  balanceWithInterest - currentDaiBalance);
};

module.exports = { supplyToCompound, mintByDai, currentRewardsinDollar };

// TESTING
/*
const sender = {
  address: '0x86005Cda50E5F22bD55d6B454b3765A499991e27',
  privateKey: '0xa0297f95a9565856b13f76feb4b2d09fea5514cd8e9ac7901165984463d7dedd',
};

currentRewardsinDollar(6, sender);
mintByDai(sender);
supplyToCompound(sender, '1000000000000000000');
*/
