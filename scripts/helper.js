const { ethers, network, guildsworn } = require("hardhat");
const { utils } = require("ethers");
const hre = require("hardhat");

let deployerSigner;
let moderatorSigner;
let player1Signer;

let stableTokenAddress;
let eldfallTokenAddress;
let nftAddress;

let stableDeployerInstance;
let characterNftDeployerInstance;
let eldfallTokenDeployerInstance;

let characterNftModeratorWriteInstance;

async function init() {
    const { deployer, moderator, player1 } = await hre.getNamedAccounts();

    deployerSigner = await ethers.getSigner(deployer);
    moderatorSigner = await ethers.getSigner(moderator);
    player1Signer = await ethers.getSigner(player1);

    stableTokenAddress = await guildsworn.getStableTokenAddress();
    nftAddress = await guildsworn.getCharacterNftAddress();
    eldfallTokenAddress = await guildsworn.getEldfallTokenAddress();

    stableDeployerInstance = await ethers.getContractAt("ERC20MockContract", stableTokenAddress, deployerSigner);
    characterNftDeployerInstance = await ethers.getContractAt("CharacterNftContract", nftAddress, deployerSigner);
    eldfallTokenDeployerInstance = await ethers.getContractAt("EldfallTokenContract", eldfallTokenAddress, deployerSigner);

    characterNftModeratorWriteInstance = await ethers.getContractAt("CharacterNftContract", nftAddress, moderatorSigner);
}

async function setBaseUri(baseUri) {
    const confirmations = network.config.blockConfirmations || 1;

    console.log(`Setting base URI to ${baseUri}...`)
    let transactionResponse = await characterNftModeratorWriteInstance.setBaseURI(baseUri);
    await transactionResponse.wait(confirmations);
    console.log(`Base URI set to ${baseUri}!`)
}

async function mintStableToAccount(account, amount) {
    const confirmations = network.config.blockConfirmations || 1;

    console.log(`Minting ${amount} stable tokens to ${account}...`)
    let transactionResponse = await stableDeployerInstance.mint(account, utils.parseEther(amount));
    await transactionResponse.wait(confirmations);
    console.log(`${amount} stable tokens minted to ${account}!`)
}

async function main() {
    await init();
    await setBaseUri("http://guildsworn.com/characterMetadata/");
    await mintStableToAccount("0x6E73925aF44a6e8DfDd07653d91B1f2AEdd4da3E", "100000");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});