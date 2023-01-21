require('dotenv').config();

const DEFAULT_NFT_ROYALTY_VAULT = process.env.DEFAULT_NFT_ROYALTY_VAULT ? process.env.DEFAULT_NFT_ROYALTY_VAULT : "0xbc56536f82834f23e14E9a805AFE8692E37B2BDc";
const DEFAULT_NFT_ROYALTY = process.env.DEFAULT_NFT_ROYALTY ? parseInt(process.env.DEFAULT_NFT_ROYALTY) : 1000; // 10%

const networkConfig = {
}

const developmentChains = ["hardhat", "localhost", "testnet", "oasis_sapphire_testnet"]
const TEST_INITIAL_STABLE_COIN_AMOUNT = ethers.utils.parseUnits("2000", "ether") // Will be minted to test players
module.exports = {
    networkConfig,
    developmentChains,
    TEST_INITIAL_STABLE_COIN_AMOUNT,
    DEFAULT_NFT_ROYALTY_VAULT,
    DEFAULT_NFT_ROYALTY
}