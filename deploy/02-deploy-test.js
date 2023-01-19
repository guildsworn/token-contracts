const { developmentChains } = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments, network }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const confirmations = network.blockConfirmations || 1;

    if (developmentChains.includes(network.name)) {
        // Deployer for ERC20MockContract only in development
        let args = []
        let deployContract = await deploy("ERC20MockContract", {
            from: deployer,
            args: args,
            log: true,
            waitConfirmations: confirmations, // variable from config
        })
        log(`MOCK Stable Token as USDT Instance at ${deployContract.address}`)        

        // Deployer for UniswapV2PairMockContract only in development
        args = [];
        deployContract = await deploy("UniswapV2PairMockContract", {
            from: deployer,
            args: args,
            log: true,
            waitConfirmations: confirmations, // variable from config
        });
        log(`MOCK Uniswap V2 Pair Mock Contract Instance at ${deployContract.address}`);
    }
}
module.exports.tags = ["all", "stage1", "deploy", "test"]