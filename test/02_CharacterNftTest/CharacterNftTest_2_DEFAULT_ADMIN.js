const { expect, assert } = require("chai");
const { ethers } = require("hardhat");

let deployer;
let defaultAdmin;
let defaultAdminHash;
let moderator;
let moderatorHash;
let minterHash;
let locker;
let vault;
let signer;
let tester1;
let tester2;
let minter1;
let minter2;

let CharacterNftInstance;
let TokenInstance;

describe("CharacterNftTest_2_DEFAULT_ADMIN", function () {
    beforeEach("deploy the contract instance first", async function () {
        [deployer, defaultAdmin, moderator, locker, eldToken, priceResolver, vault, signer, tester1, tester2, minter1, minter2] = await ethers.getSigners();

        const TokenFactory = await ethers.getContractFactory("ERC20MockContract");
        TokenInstance = await TokenFactory.deploy();
        await TokenInstance.deployed();

        const CharacterNftFactory = await ethers.getContractFactory("CharacterNftContract");
        CharacterNftInstance = await CharacterNftFactory.deploy();
        await CharacterNftInstance.deployed();

        // --------------------------
        //   Setting up contracts
        // --------------------------
        defaultAdminHash = await CharacterNftInstance.DEFAULT_ADMIN_ROLE();
        moderatorHash = await CharacterNftInstance.MODERATOR_ROLE();
        minterHash = await CharacterNftInstance.MINTER_ROLE();

        await CharacterNftInstance.init(
            defaultAdmin.address,
            moderator.address,
            vault.address,
            [minter1.address, minter2.address],
            10
        );
    });
    describe("Salvaging tokens", function () {
        let tokenAmount = ethers.utils.parseEther("1337");
        it("Should be able to salvage tokens", async function () {
            await TokenInstance.mint(CharacterNftInstance.address, tokenAmount);
            expect(await TokenInstance.balanceOf(CharacterNftInstance.address)).to.equal(tokenAmount);
            await CharacterNftInstance.connect(defaultAdmin).salvageTokensFromContract(TokenInstance.address, defaultAdmin.address, tokenAmount);
            expect(await TokenInstance.balanceOf(CharacterNftInstance.address)).to.equal("0");
            expect(await TokenInstance.balanceOf(defaultAdmin.address)).to.equal(tokenAmount);
        });
        it("Should fail if not called from default admin", async function () {
            await TokenInstance.mint(CharacterNftInstance.address, tokenAmount);
            await expect(CharacterNftInstance.connect(moderator).salvageTokensFromContract(TokenInstance.address, defaultAdmin.address, tokenAmount)).to.be.reverted;
        });
    });
});