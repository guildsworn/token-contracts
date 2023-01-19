module.exports = async ({ getNamedAccounts, deployments, network }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const confirmations = network.blockConfirmations || 1;

    // Deployer for CharacterNftContract
    let args = []
    const deployContract = await deploy("CharacterNftContract", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: confirmations, // variable from config
    });
    log(`NFT Instance at ${deployContract.address}`);
}
module.exports.tags = ["all", "stage1", "deploy", "nft"];