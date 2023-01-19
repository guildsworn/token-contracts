const { 
    developmentChains, 
    TEST_INITIAL_STABLE_COIN_AMOUNT,    
    TEST_RESERVE_ELD_COIN_AMOUNT,
    TEST_RESERVE_STABLE_COIN_AMOUNT } = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments, network }) => {
    const { log } = deployments;
    const { deployer, player1, player2, player3 } = await getNamedAccounts();
    const confirmations = network.blockConfirmations || 1;

    if (developmentChains.includes(network.name)) {
        // Init test stable token and mint some stable tokens to players
        const stableCoinInstance = await ethers.getContract("ERC20MockContract", deployer)
        let transactionResponse = await stableCoinInstance.init([player1, player2, player3], Array(3).fill(TEST_INITIAL_STABLE_COIN_AMOUNT));
        await transactionResponse.wait(confirmations)
        log(`Initialization of ERC20MockContract Instance at ${stableCoinInstance.address} finished.`);


        // Init UniswapV2PairMockContract
        const eldCoinInstance = await ethers.getContract("EldfallTokenContract", deployer)
        const uniswapV2PairMockContractInstance = await ethers.getContract("UniswapV2PairMockContract", deployer);
        transactionResponse = await uniswapV2PairMockContractInstance.init(eldCoinInstance.address, stableCoinInstance.address, TEST_RESERVE_ELD_COIN_AMOUNT, TEST_RESERVE_STABLE_COIN_AMOUNT);
        await transactionResponse.wait(confirmations);
        log(`Initialization of UniswapV2PairMockContract Instance at ${uniswapV2PairMockContractInstance.address} finished.`);
    }
}
module.exports.tags = ["all", "stage1", "init", "init-test"];