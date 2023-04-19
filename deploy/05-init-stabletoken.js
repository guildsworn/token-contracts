module.exports = async ({ getNamedAccounts, deployments, network, guildsworn }) => {
    const { log } = deployments;
    const { deployer, player1, player2, player3 } = await getNamedAccounts();
    const confirmations = network.config.blockConfirmations || 1;

    if (!network.live) {
        const initialStableCoinAmount = process.env.TEST_INITIAL_STABLE_COIN_AMOUNT_ETHER ? ethers.utils.parseUnits(process.env.TEST_INITIAL_STABLE_COIN_AMOUNT_ETHER, "ether"): ethers.utils.parseUnits("2000", "ether") // Will be minted to test players
        // Init test stable token and mint some stable tokens to players
        let stableTokenAddress = await guildsworn.getStableTokenAddress(); 
        const stableCoinInstance = await ethers.getContractAt("ERC20MockContract", stableTokenAddress, deployer)
        let transactionResponse = await stableCoinInstance.init([player1, player2, player3], Array(3).fill(initialStableCoinAmount));
        await transactionResponse.wait(confirmations)
        log(`Initialization of ERC20MockContract Instance - Stable Token as USDT at ${stableCoinInstance.address} finished.`);
    }
}
module.exports.tags = ["all", "init", "init-stabletoken"];