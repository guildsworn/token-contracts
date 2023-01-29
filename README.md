# guildsworn-token-contracts

## Installing the package
```shell
npm install @guildsworn/token-contracts
```
or via yarn
```shell
yarn add @guildsworn/token-contracts
```

# Compiling, building
Try running some of the following tasks:

```shell
yarn install
yarn clean
yarn compile
yarn test
yarn coverage
yarn docs
```
## Updating interfaces
```shell
npx hardhat generate-interface [Contract name]
cp contracts/[Contract name] contracts/interfaces/
```

# Smart Contract deploy
## Before deploy
1. Create `.env` file in root folder or copy and check `.env.example`

### [Deploy parameters](https://github.com/wighawag/hardhat-deploy#1-hardhat-deploy)

## Deploy on hardhat local network, reset deployment if exists and generate deployment files
```shell
npx hardhat deploy --write true --reset
```

## Deploy on Oasis Sapphire Testnet, generate deployment files
```shell
npx hardhat deploy --write true --network oasis_sapphire_testnet
```

## Deploy on Oasis Sapphire Mestnet, generate deployment files
```shell
npx hardhat deploy --write true --network oasis_sapphire_mainnet
```

# Publish the NPM package
```shell
cd contracts/ && yarn compile
yarn publish --access public
```