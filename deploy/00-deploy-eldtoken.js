module.exports = async ({ getNamedAccounts, deployments, network, guildsworn }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const confirmations = network.blockConfirmations || 1;

    let eldfallTokenAddress = await guildsworn.getEldfallTokenAddress(false);
    if (!eldfallTokenAddress || eldfallTokenAddress == "0x0000000000000000000000000000000000000000") {
        // Deployer for EldfallTokenContract ELD Token
        let args = []
        const deployContract = await deploy("EldfallTokenContract", {
            from: deployer,
            args: args,
            log: true,
            waitConfirmations: confirmations, // variable from config
        });
        log(`EldfallTokenContract instance at ${deployContract.address}`);
    } else {
        log(`EldfallTokenContract instance already at ${eldfallTokenAddress}`);
    }
}
module.exports.tags = ["all", "deploy", "eldtoken"];