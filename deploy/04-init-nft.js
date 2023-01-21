const { DEFAULT_NFT_ROYALTY_VAULT, DEFAULT_NFT_ROYALTY } = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments, network }) => {
    const { log } = deployments;
    const { deployer, admin, moderator } = await getNamedAccounts();
    const confirmations = network.blockConfirmations || 1;
    
    let characterNftContractInstance = await ethers.getContract("CharacterNftContract", deployer)
    let isInitialised = await characterNftContractInstance.isInitialised();
    if (!isInitialised) {        
        // Add user to moderator role
        const moderatorAddress = moderator ? moderator : network.erc721moderatorAddress;
        // Add user to minter role
        const minterAddress = network.erc721minterAddress;
        const minters = [];
        if (minterAddress) {
            minters.push(minterAddress);
        }

        // // Add store contract to minter role
        // let storeContractInstance = await ethers.getContract("CharacterStoreContract", deployer)
        // minters.push(storeContractInstance.address);

        // Initialization
        let nftRoyaltyVault = network.nftRoyaltyVault ? network.nftRoyaltyVault : DEFAULT_NFT_ROYALTY_VAULT;
        let nftRoyalty = network.nftRoyalty ? network.nftRoyalty : DEFAULT_NFT_ROYALTY;
        let transactionResponse = await characterNftContractInstance.init(admin, moderatorAddress, nftRoyaltyVault, minters, nftRoyalty);
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
module.exports.tags = ["all", "stage1", "init", "init-nft"];