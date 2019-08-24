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
}

config.NETWORK = 'kovan';

config.ERC20_GAS_COST = 200000

config.DAI_TOKEN = '0xc4375b7de8af5a38a93548eb8453a498222c4ff2'

module.exports = config;