module.exports = async ({ getNamedAccounts, deployments, network }) => {
    const { log } = deployments;
    const { deployer, admin } = await getNamedAccounts();
    const confirmations = network.blockConfirmations || 1;
    
    let eldCoinInstance = await ethers.getContract("EldfallTokenContract", deployer)
    let isInitialised = await eldCoinInstance.isInitialised();
    if (!isInitialised) {
        // Add user to minter role
        const minterAddress = network.erc20minterAddress;
        const minters = [];
        if (minterAddress) {
            minters.push(minterAddress);
        }

        // Add store contract to minter role
        let storeContractInstance = await ethers.getContract("CharacterStoreContract", deployer)
        minters.push(storeContractInstance.address);

        // Initialization    
        let transactionResponse = await eldCoinInstance.init(admin, minters);
        await transactionResponse.wait(confirmations);
        log(`Initialization of EldfallTokenContract Instance at ${eldCoinInstance.address} finished.`);
    } else {
        log(`Initialization of EldfallTokenContract already finished.`);
    }
}
module.exports.tags = ["all", "stage1", "init", "init-eldtoken"];