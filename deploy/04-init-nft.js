module.exports = async ({ getNamedAccounts, deployments, network, guildsworn }) => {
    const { log } = deployments;
    const { deployer, admin, moderator } = await getNamedAccounts();
    const confirmations = network.config.blockConfirmations || 1;

    let characterNftAddress = await guildsworn.getCharacterNftAddress();
    let characterNftInstance = await ethers.getContractAt("CharacterNftContract", characterNftAddress, deployer)
    let isInitialised = await characterNftInstance.isInitialised();
    if (!isInitialised) {
        // Initialization
        const nftRoyaltyVault = process.env.NFT_ROYALTY_VAULT;
        const nftRoyalty = process.env.NFT_ROYALTY ? parseInt(process.env.NFT_ROYALTY) : 1000; // DEFAULT: 10%
        const minters = [];

        let transactionResponse = await characterNftInstance.init(admin, moderator, nftRoyaltyVault, minters, nftRoyalty);
        await transactionResponse.wait(confirmations);
        log(`Initialization of CharacterNftContract Instance at ${characterNftInstance.address} finished.`);
    } else {
        log(`Initialization of CharacterNftContract already finished.`);
    }
}
module.exports.tags = ["all", "init", "init-nft"];