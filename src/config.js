const config = {};

config.FAUCET_PRIVATE_KEY = 'a0297f95a9565856b13f76feb4b2d09fea5514cd8e9ac7901165984463d7dedd';
config.FAUCET_ADDRESS = '0x86005Cda50E5F22bD55d6B454b3765A499991e27';

config.INFURA = {
  ROPSTEN: 'https://ropsten.infura.io/v3/d7ef95bbf433420a96fa91c4a35b200b',
  KOVAN: 'https://kovan.infura.io/v3/d7ef95bbf433420a96fa91c4a35b200b',
  RINKEBY: 'https://rinkeby.infura.io/v3/d7ef95bbf433420a96fa91c4a35b200b',
  GORLI: 'https://goerli.infura.io/v3/d7ef95bbf433420a96fa91c4a35b200b',
}

config.ECTools_ADDRESS = {
  ROPSTEN: '0x6d35b74c75d60d1170CfF354d8CB5083AB6c3009',
  KOVAN: '0x4dc1bD11F305e7733f3afe21b95560Dd0Db0B174',
  RINKEBY: '0xebF8E2fE235A7Ae45bBb4a4001457391cd0371E5'
}

config.NETWORK = 'rinkeby';

config.ERC20_GAS_COST = 200000

config.CDAI = {
  KOVAN: '0x0a1e4d0b5c71b955c0a5993023fc48ba6e380496',
  RINKEBY: '0x6d7f0754ffeb405d23c51ce938289d4835be3b14'
}

 config.DAI = {
  KOVAN: '0xbF7A7169562078c96f0eC1A8aFD6aE50f12e5A99',
  RINKEBY: '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea'
}

config.UNISWAP_EXCHANGE = {
  RINKEBY: '0xe0bcb0a25797a945a6ea1599b6921d02b012410b',
}

module.exports = config;
