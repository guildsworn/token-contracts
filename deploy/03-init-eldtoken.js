module.exports = async ({ getNamedAccounts, deployments, network }) => {
    const { log } = deployments;
    const { deployer, admin } = await getNamedAccounts();
    const confirmations = network.blockConfirmations || 1;
    
    let eldCoinInstance = await ethers.getContract("EldfallTokenContract", deployer)
    let isInitialised = await eldCoinInstance.isInitialised();
    if (!isInitialised) {
        // Initialization
        const minters = [];
        let transactionResponse = await eldCoinInstance.init(admin, minters);
        await transactionResponse.wait(confirmations);
        log(`Initialization of EldfallTokenContract Instance at ${eldCoinInstance.address} finished.`);
    } else {
        log(`Initialization of EldfallTokenContract already finished.`);
    }
}
module.exports.tags = ["all", "init", "init-eldtoken"];