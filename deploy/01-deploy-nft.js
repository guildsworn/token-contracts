module.exports = async ({ getNamedAccounts, deployments, network, guildsworn }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const confirmations = network.config.blockConfirmations || 1;

    let characterNftAddress = await guildsworn.getCharacterNftAddress(false);
    if (!characterNftAddress || characterNftAddress == "0x0000000000000000000000000000000000000000") {
        // Deployer for CharacterNftContract
        let args = []
        const deployContract = await deploy("CharacterNftContract", {
            from: deployer,
            args: args,
            log: true,
            waitConfirmations: confirmations, // variable from config
        });
        log(`NFT Instance at ${deployContract.address}`);
    } else {
        log(`NFT Instance already at ${characterNftAddress}`);
    }
}
module.exports.tags = ["all", "deploy", "nft"];