module.exports = async ({ getNamedAccounts, deployments, network }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const confirmations = network.blockConfirmations || 1;

    if (!network.live) {
        // Deployer for ERC20MockContract only in development
        let args = []
        let deployContract = await deploy("ERC20MockContract", {
            from: deployer,
            args: args,
            log: true,
            waitConfirmations: confirmations, // variable from config
        })
        log(`MOCK Stable Token as USDT Instance at ${deployContract.address}`)
    }
}
module.exports.tags = ["all", "deploy", "test"]