require('dotenv').config();

const DEFAULT_ELD_DISCAUNT = process.env.DEFAULT_ELD_DISCAUNT ? parseInt(process.env.DEFAULT_ELD_DISCAUNT) : 50;
const DEFAULT_ELD_KICKBACK = process.env.DEFAULT_ELD_KICKBACK ? parseInt(process.env.DEFAULT_ELD_KICKBACK) : 10;
const DEFAULT_STORE_VAULT = process.env.DEFAULT_STORE_VAULT ? process.env.DEFAULT_STORE_VAULT : "0xbc56536f82834f23e14E9a805AFE8692E37B2BDc";
const DEFAULT_NFT_ROYALTY_VAULT = process.env.DEFAULT_NFT_ROYALTY_VAULT ? process.env.DEFAULT_NFT_ROYALTY_VAULT : "0xbc56536f82834f23e14E9a805AFE8692E37B2BDc";
const DEFAULT_NFT_ROYALTY = process.env.DEFAULT_NFT_ROYALTY ? parseInt(process.env.DEFAULT_NFT_ROYALTY) : 1000; // 10%

const networkConfig = {
}

const developmentChains = ["hardhat", "localhost", "testnet"]
const TEST_INITIAL_STABLE_COIN_AMOUNT = ethers.utils.parseUnits("2000", "ether") // Will be minted to test players
const TEST_RESERVE_ELD_COIN_AMOUNT = ethers.utils.parseUnits("900000", "ether") // Will be set as ELD reserve amount in UniswapV2PairMockContract
const TEST_RESERVE_STABLE_COIN_AMOUNT = ethers.utils.parseUnits("900000", "ether") // Will be set as Stable Coin reserve amount in UniswapV2PairMockContract
module.exports = {
    networkConfig,
    developmentChains,
    TEST_INITIAL_STABLE_COIN_AMOUNT,
    TEST_RESERVE_ELD_COIN_AMOUNT,
    TEST_RESERVE_STABLE_COIN_AMOUNT,
    DEFAULT_NFT_ROYALTY_VAULT,
    DEFAULT_NFT_ROYALTY
}