const { developmentChains } = require("../helper-hardhat-config");
const { utils } = require("ethers");

module.exports = async ({ getNamedAccounts, deployments, network }) => {
    const { log } = deployments;
    const { moderator, backend, player1, player2, player3 } = await getNamedAccounts();
    const confirmations = network.blockConfirmations || 1;

    if (developmentChains.includes(network.name))
    {
        log(`Test transactions in progress...`);
        let storeModeratorInstance = await ethers.getContract("CharacterStoreContract", moderator);
        let nftModeratorInstance = await ethers.getContract("CharacterNftContract", moderator);
        let storePlayer1Instance = await ethers.getContract("CharacterStoreContract", player1);
        let storePlayer2Instance = await ethers.getContract("CharacterStoreContract", player2);
        let storePlayer3Instance = await ethers.getContract("CharacterStoreContract", player3);
        let stablePlayer1Instance = await ethers.getContract("ERC20MockContract", player1);
        let stablePlayer2Instance = await ethers.getContract("ERC20MockContract", player2);
        let nftPlayer1Instance = await ethers.getContract("CharacterNftContract", player1);
        let nftPlayer2Instance = await ethers.getContract("CharacterNftContract", player2);
        let lockerInstance = await ethers.getContract("LockerContract", moderator);
        let bridgePlayer1Instance = await ethers.getContract("BridgeContract", player1);
        let bridgePlayer2Instance = await ethers.getContract("BridgeContract", player2);
        
        // Create free none transferable character
        // let characterFreeName = "Character Free";
        // let characterFreeHash = utils.hashMessage(characterFreeName);
        // let characterFreePrice = utils.parseEther("0");
        // let characterFreeActive = true;
        // let characterFreeData = await storeModeratorInstance.getCharacter(characterFreeHash);
        // if (utils.stripZeros(characterFreeData.characterHash).length == 0)
        // {
        //     let transactionResponse = await storeModeratorInstance.addCharacter(character1Name, character1Hash, character1Price, character1Active);
        //     await transactionResponse.wait(confirmations);
        //     log(`Character ${character1Name} created`);
        // }

        // Create 3 characters
        let character1Name = "Character 1";
        let character1Hash = utils.hashMessage(character1Name);
        let character1Price = utils.parseEther("0.1");
        let character1Active = true;
        let character1Data = await storeModeratorInstance.getCharacter(character1Hash);
        if (utils.stripZeros(character1Data.characterHash).length == 0)
        {
            let transactionResponse = await storeModeratorInstance.addCharacter(character1Name, character1Hash, character1Price, character1Active);
            await transactionResponse.wait(confirmations);
            log(`Character ${character1Name} created`);
        }
        
        let character2Name = "Character 2";
        let character2Hash = utils.hashMessage(character2Name);
        let character2Price = utils.parseEther("0.1");
        let character2Active = true;
        let character2Data = await storeModeratorInstance.getCharacter(character2Hash);
        if (utils.stripZeros(character2Data.characterHash).length == 0)
        {
            transactionResponse = await storeModeratorInstance.addCharacter(character2Name, character2Hash, character2Price, character2Active);
            await transactionResponse.wait(confirmations);        
            log(`Character ${character2Name} created`);
        }

        let character3Name = "Character 3";
        let character3Hash = utils.hashMessage(character3Name);
        let character3Price = utils.parseEther("0.1");
        let character3Active = true;
        let character3Data = await storeModeratorInstance.getCharacter(character3Hash);
        if (utils.stripZeros(character3Data.characterHash).length == 0)
        {
            transactionResponse = await storeModeratorInstance.addCharacter(character3Name, character3Hash, character3Price, character3Active);
            await transactionResponse.wait(confirmations);
            log(`Character ${character3Name} created`);
        }

        // Mint some stable tokens to player 1
        transactionResponse = await stablePlayer1Instance.mint(player1, utils.parseEther("1000"));
        await transactionResponse.wait(confirmations);

        // Player 1 buys character 1
        let characterData = await storePlayer1Instance.getCharacter(character1Hash);
        transactionResponse = await stablePlayer1Instance.approve(storePlayer1Instance.address, characterData.price);
        await transactionResponse.wait(confirmations);

        transactionResponse = await storePlayer1Instance.buyWithStable(character1Hash);
        await transactionResponse.wait(confirmations);
        log(`Character ${character1Name} bought by ${player1}`);

        // Get last character token id from player 1
        let player1NftBalance = await nftPlayer1Instance.balanceOf(player1);
        let character1Player1TokenId = await nftPlayer1Instance.tokenOfOwnerByIndex(player1, player1NftBalance-1);
        
        // Player 1 locks character 1
        let extraData = "0x";
        transactionResponse = await nftPlayer1Instance.lockToken(character1Player1TokenId, lockerInstance.address, extraData);
        await transactionResponse.wait(confirmations);         
        log(`Character ${character1Name} with token id ${character1Player1TokenId} locked by ${player1}`);

        // Player 1 plays the game
        // Player 1 finishes the game, he send request to backend to unlock the character
        const signerBackend = await ethers.getSigner(backend);
        let signitureMessageHash = await lockerInstance.getMessageHash(player1, character1Player1TokenId, extraData);
        let signitureMessageBytesHash = ethers.utils.arrayify(signitureMessageHash)
        let signiture = await signerBackend.signMessage(signitureMessageBytesHash);

        // Player 1 unlocks character 1 with backend signature
        transactionResponse = await nftPlayer1Instance.unlockToken(character1Player1TokenId, extraData, signiture);
        await transactionResponse.wait(confirmations);
        log(`Character ${character1Name} with token id ${character1Player1TokenId} unlocked by ${player1}`);

        // Player 1 bridge character 1 to Real World
        // Player 1 must fill up the order form (his name, address), after order is accepted, frontend calls below transactions
        const realWorldChainId = -1;
        let bridgeTransferPrice = await bridgePlayer1Instance.getDestinationChainTransferPrice(realWorldChainId);
        let bridgeTransferPriceEth = utils.formatEther(bridgeTransferPrice);
        if (bridgeTransferPrice > 0)
        {
            // If there is destination transfer price, player 1 must pay it -> phisical item will be delivered to player 1 for some USDT
            transactionResponse = await stablePlayer1Instance.approve(bridgePlayer1Instance.address, bridgeTransferPrice);
            await transactionResponse.wait(confirmations);

            log(`Player ${player1} will pay to transfer on chainId: ${realWorldChainId}, ${bridgeTransferPriceEth} stable tokens.`);
        }
        transactionResponse = await nftPlayer1Instance.approve(bridgePlayer1Instance.address, character1Player1TokenId);
        await transactionResponse.wait(confirmations);
        log(`Player ${player1} will transfer on chainId: ${realWorldChainId}, ${character1Player1TokenId} NFT token.`);

        transactionResponse = await bridgePlayer1Instance.bridgeTransfer(realWorldChainId, player1, character1Player1TokenId);
        await transactionResponse.wait(confirmations);
        log(`Character ${character1Name} with token id ${character1Player1TokenId} has been transfered to ${realWorldChainId} chain id.`);

        // Player 2 get free knight at register on platform
        let character4Name = "Character Knight";
        let character4Hash = utils.hashMessage(character4Name);
        let isTransferable = await nftModeratorInstance.isTransferable(character4Hash);
        if (isTransferable == true)
        {
            transactionResponse = await nftModeratorInstance.setNotTransferable(character4Hash, true);
            await transactionResponse.wait(confirmations);
            log(`Character ${character4Name} with hash ${character4Hash} is set as not transferable.`);            
        }

        // Player 2 want to transfer knight on chainId 1
        const platformChainId = 0;
        const platformTokenId = 1;
        const platformTokenMetadata = ethers.utils.toUtf8Bytes("https://www.myplatform.com/nft/1");
        const platformBridgeTransferOrderId = 1;
        const destinationChainId = await bridgePlayer2Instance.getChainId();
        // Platform execute internal bridgeTransfer logic (no SC) and prepere signiture for player 2
        signitureMessageHash = await bridgePlayer2Instance.getMessageHash(platformChainId, player2, destinationChainId, player2, platformTokenId, character4Hash, platformTokenMetadata, platformBridgeTransferOrderId);
        signitureMessageBytesHash = ethers.utils.arrayify(signitureMessageHash);
        signiture = await signerBackend.signMessage(signitureMessageBytesHash);

        transactionResponse = await bridgePlayer1Instance.bridgeTransferTo(platformChainId, player2, destinationChainId, player2, platformTokenId, character4Hash, platformTokenMetadata, platformBridgeTransferOrderId, signiture);
        await transactionResponse.wait(confirmations);
        // Get last character token id from player 1
        let player2NftBalance = await nftPlayer2Instance.balanceOf(player2);
        let character4Player2TokenId = await nftPlayer2Instance.tokenOfOwnerByIndex(player2, player2NftBalance-1);
        log(`Character ${character4Name} with platform token id ${platformTokenId} has been transfered to chain id: ${destinationChainId}, new token id is: ${character4Player2TokenId}.`);

        // Player 2 want to transfer knight to Player 3
        // Should throw error, because knight is not transferable: reverted with reason string 'Token class is not transferable!'
        //transactionResponse = await nftPlayer2Instance.transferFrom(player2, player3, character4Player2TokenId);
        //await transactionResponse.wait(confirmations);

        // Player 2 bridge character 4 to Real World
        // Player 2 must fill up the order form (his name, address), after order is accepted, frontend calls below transactions
        bridgeTransferPrice = await bridgePlayer2Instance.getDestinationChainTransferPrice(realWorldChainId);
        bridgeTransferPriceEth = utils.formatEther(bridgeTransferPrice);
        if (bridgeTransferPrice > 0)
        {
            // If there is destination transfer price, player 2 must pay it -> phisical item will be delivered to player 2 for some USDT
            transactionResponse = await stablePlayer2Instance.approve(bridgePlayer2Instance.address, bridgeTransferPrice);
            await transactionResponse.wait(confirmations);
            log(`Player ${player2} will pay to transfer on chainId: ${realWorldChainId}, ${bridgeTransferPriceEth} stable tokens.`);
        }

        transactionResponse = await nftPlayer2Instance.approve(bridgePlayer2Instance.address, character4Player2TokenId);
        await transactionResponse.wait(confirmations);
        log(`Player ${player2} will transfer on chainId: ${realWorldChainId}, ${character4Player2TokenId} NFT token.`);

        transactionResponse = await bridgePlayer2Instance.bridgeTransfer(realWorldChainId, player2, character4Player2TokenId);
        await transactionResponse.wait(confirmations);
        log(`Character ${character4Name} with token id ${character4Player2TokenId} has been transfered to ${realWorldChainId} chain id.`);

        log(`Creating test data finished.`);
    } 
}
module.exports.tags = ["all", "stage3", "test", "test-data"];