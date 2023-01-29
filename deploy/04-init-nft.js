module.exports = async ({ getNamedAccounts, deployments, network }) => {
    const { log } = deployments;
    const { deployer, admin, moderator } = await getNamedAccounts();
    const confirmations = network.blockConfirmations || 1;
    
    let characterNftContractInstance = await ethers.getContract("CharacterNftContract", deployer)
    let isInitialised = await characterNftContractInstance.isInitialised();
    if (!isInitialised) {
        // Initialization
        const nftRoyaltyVault = process.env.NFT_ROYALTY_VAULT;
        const nftRoyalty = process.env.NFT_ROYALTY ? parseInt(process.env.NFT_ROYALTY) : 1000; // DEFAULT: 10%
        const minters = [];

        //let nftRoyaltyVault = network.nftRoyaltyVault ? network.nftRoyaltyVault : nftRoyaltyVault;
        //let nftRoyalty = network.nftRoyalty ? network.nftRoyalty : DEFAULT_NFT_ROYALTY;
        let transactionResponse = await characterNftContractInstance.init(admin, moderator, nftRoyaltyVault, minters, nftRoyalty);
        await transactionResponse.wait(confirmations);
        log(`Initialization of CharacterNftContract Instance at ${characterNftContractInstance.address} finished.`);

        // log(`Setting up CharacterNftContract Instance at ${characterNftContractInstance.address}...`);
        // characterNftContractInstance = await ethers.getContract("CharacterNftContract", moderator)
        // let nftRoyaltyVault = network.nftRoyaltyVault ? network.nftRoyaltyVault : DEFAULT_NFT_ROYALTY_VAULT;
        // transactionResponse = await characterNftContractInstance.setVaultAddress(nftRoyaltyVault);
        // await transactionResponse.wait(confirmations);

        
        // transactionResponse = await characterNftContractInstance.setRoyaltyNumerator(nftRoyalty);
        // await transactionResponse.wait(confirmations);        
        // log(`Setting up CharacterNftContract Instance at ${characterNftContractInstance.address} finished.`);

    } else {
        log(`Initialization of CharacterNftContract already finished.`);
    }
}
module.exports.tags = ["all", "init", "init-nft"];