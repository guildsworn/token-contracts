module.exports = async ({ getNamedAccounts, deployments, network }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const confirmations = network.blockConfirmations || 1;

    // Deployer for EldfallTokenContract ELD Token
    let args = []
    const deployContract = await deploy("EldfallTokenContract", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: confirmations, // variable from config
    });
    log(`EldfallTokenContract instance at ${deployContract.address}`);
}
module.exports.tags = ["all", "stage1", "deploy", "eldtoken"];