module.exports = async ({ getNamedAccounts, deployments, network, guildsworn }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const confirmations = network.blockConfirmations || 1;

    if (!network.live) {
        let stableTokenAddress = await guildsworn.getStableTokenAddress(false);        
        if (!stableTokenAddress || stableTokenAddress == "0x0000000000000000000000000000000000000000") {
            // Deployer for ERC20MockContract only in development
            let args = []
            let deployContract = await deploy("ERC20MockContract", {
                from: deployer,
                args: args,
                log: true,
                waitConfirmations: confirmations, // variable from config
            })
            log(`MOCK Stable Token as USDT Instance at ${deployContract.address}`)
        } else {
            log(`MOCK Stable Token as USDT Instance already at ${stableTokenAddress}`)
        }
    }
}
module.exports.tags = ["all", "deploy", "stabletoken"]