# guildsworn-token-contracts

Try running some of the following tasks:

```shell
yarn install
npx hardhat generate-interface CharacterNftContract
npx hardhat compile
yarn run test
yarn run coverage
```

## Reserved chains
-1: Real World
0: Backend - central database
X: Any other blockchain ChainId

## Deploy
### Before deploy
1. Create `.env` file in root folder or copy and check `.env.example`
2. Check and modify `helper-hardhat-config.js` - network specific settings.

### [Deploy parameters](https://github.com/wighawag/hardhat-deploy#1-hardhat-deploy)

### Deploy on hardhat local network, reset deployment if exists and generate one json file for frontend 
```shell
npx hardhat deploy --write true --export eldfallnetworks.json --reset
```

### Deploy on testnet, generate one json file for frontend
```shell
npx hardhat deploy --write true --export eldfallnetworks.json --network testnet
```

### Deploy on mainnet
#### Stage 1
```shell
npx hardhat deploy --tags stage1 --write true --export eldfallnetworks.json --network mainnet
```
#### Manual create currency pair on DEX with ELD/USDT and update dexPairAddressEldUsdt in helper-hardhat-config.js
#### Stage 2
```shell
npx hardhat deploy --tags stage2 --write true --export eldfallnetworks.json --network mainnet
```
