# YAW - Yet Another Wallet

An ethereum smart contract wallet which enforces users to maintain a minimum account balance (10 DAI) to provide gas free transactions by abstracting network fees with interest earned from DeFi lending protocols.

User funds are automatically supplied to the compound.finance money market to gain interest in every block and every time the user's EOA ETH balance goes below the threshold amount, a fraction of the interest (cDai) is swapped with ETH using uniswap protocol.

Just like @pooltogether is using the accumulated interest to reward a lucky winner and @rDai is using the accumulated interest to reward a pre-selected beneficiary, @yaw is using the same to cover gas.

## How to Use
```
npm install
quasar dev
```
Currently it is hosted @`https://epic-davinci-4c111e.netlify.com/#/`

## Deployed Contracts
- cDai: `0x6d7f0754ffeb405d23c51ce938289d4835be3b14`
- Dai: `0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea`
- ECTools: `0xebF8E2fE235A7Ae45bBb4a4001457391cd0371E5`
- uniswap exchange for cDai: `0xe0bcb0a25797a945a6ea1599b6921d02b012410b`
- Wallet contracts: deployed every time a new wallet gets created

## Team
- Rajesh Subhankar (@rajeshsubhankar)
- Nico Vergauwen (@kyriediculous)
- Pavlo Radchuk (@rdchksec)
- Javier Aguerri (@javieraguerri)
