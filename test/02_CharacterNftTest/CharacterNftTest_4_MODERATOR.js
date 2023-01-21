const { expect, assert } = require("chai");
const { ethers } = require("hardhat");
const { utils } = require("ethers");

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
let token1;
let token2;
let token3;
let character1Hash;
let character2Hash;

let CharacterNftInstance;
let LockerInstance;

describe("CharacterNftTest_4_MODERATOR", function () {
    beforeEach("deploy the contract instance first", async function () {
        [deployer, defaultAdmin, moderator, locker, eldToken, priceResolver, vault, signer, tester1, tester2, minter1, minter2] = await ethers.getSigners();

        // const TokenFactory = await ethers.getContractFactory("ERC20MockContract");
        // TokenInstance = await TokenFactory.deploy();
        // await TokenInstance.deployed();

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

        let character1Name = "Test character class";
        character1Hash = utils.hashMessage(character1Name);
        let character2Name = "Test character class 2";
        character2Hash = utils.hashMessage(character2Name);
        await CharacterNftInstance.connect(minter1).safeMint(tester1.address, character1Hash);
        token1 = 0;
        await CharacterNftInstance.connect(minter1).safeMint(tester1.address, character1Hash);
        token2 = 1;

        const LockerFactory = await ethers.getContractFactory("LockerMockContract");
        LockerInstance = await LockerFactory.deploy();
        await LockerInstance.deployed();
        // await LockerInstance.init(
        //     defaultAdmin.address,
        //     moderator.address,
        //     CharacterNftInstance.address,
        //     eldToken.address,
        //     priceResolver.address,
        //     vault.address,
        //     signer.address,
        //     10,
        //     11
        // );        
    });
    it("owner", async function () {
        expect(await CharacterNftInstance.connect(tester1).owner()).to.equal(moderator.address);
    });

    it("setTokenURI - Fail if not called from moderator", async function () {
        await expect(CharacterNftInstance.connect(tester1).setTokenURI(token1, "TestToken1Url")).to.be.reverted;
    });    
    it("setTokenURI - Sucess", async function () {
        await CharacterNftInstance.connect(moderator).setTokenURI(token1, "TestToken1Url")
        expect(await CharacterNftInstance.connect(moderator).tokenURI(token1)).to.equal("https://www.eldfall.com/characterMetadata/TestToken1Url");
    });

    it("setBaseURI - Fail if not called from moderator", async function () {
        await expect(CharacterNftInstance.connect(tester1).setBaseURI("https://test.com/")).to.be.reverted;
    });    
    it("setBaseURI - Sucess", async function () {
        await CharacterNftInstance.connect(moderator).setBaseURI("https://test.com/")
        expect(await CharacterNftInstance.connect(moderator).getBaseURI()).to.equal("https://test.com/");
    });

    it("setVaultAddress - Fail if not called from moderator", async function () {
        await expect(CharacterNftInstance.connect(tester1).setVaultAddress(tester1.address)).to.be.reverted;
    });
    it("setVaultAddress - Fail if same value", async function () {
        await expect(CharacterNftInstance.connect(moderator).setVaultAddress(vault.address)).to.be.revertedWith('Value is already set!');
    });
    it("setVaultAddress - Sucess", async function () {
        await CharacterNftInstance.connect(moderator).setVaultAddress(tester1.address);
        expect(await CharacterNftInstance.getVaultAddress()).to.equal(tester1.address);
    });

    it("setRoyaltyNumerator - Fail if not called from moderator", async function () {
        await expect(CharacterNftInstance.connect(tester1).setRoyaltyNumerator(11)).to.be.reverted;
    });
    it("setRoyaltyNumerator - Fail if same value", async function () {
        await expect(CharacterNftInstance.connect(moderator).setRoyaltyNumerator(10)).to.be.revertedWith('Value is already set!');
    });
    it("setRoyaltyNumerator - Sucess", async function () {
        await CharacterNftInstance.connect(moderator).setRoyaltyNumerator(11);
        expect(await CharacterNftInstance.getRoyaltyNumerator()).to.equal(11);
    });

    it("setNotTransferable - Fail if not called from moderator", async function () {
        await expect(CharacterNftInstance.connect(tester1).setNotTransferable(character1Hash, true)).to.be.reverted;
    });
    it("setNotTransferable - Fail if same value", async function () {
        await CharacterNftInstance.connect(moderator).setNotTransferable(character1Hash, true);
        await expect(CharacterNftInstance.connect(moderator).setNotTransferable(character1Hash, true)).to.be.revertedWith('Value is already set!');
    });
    it("setNotTransferable - Sucess", async function () {
        await CharacterNftInstance.connect(moderator).setNotTransferable(character1Hash, true);
        expect(await CharacterNftInstance.isTransferable(character1Hash)).to.equal(false);
        expect(await CharacterNftInstance.isTransferable(character2Hash)).to.equal(true);
    });

    it("setWhitelistGuild - Fail if not called from moderator", async function () {
        await expect(CharacterNftInstance.connect(tester1).setWhitelistGuild(LockerInstance.address, true)).to.be.reverted;
    });
    it("setWhitelistGuild - Fail if same value", async function () {
        await CharacterNftInstance.connect(moderator).setWhitelistGuild(LockerInstance.address, true);
        await expect(CharacterNftInstance.connect(moderator).setWhitelistGuild(LockerInstance.address, true)).to.be.revertedWith('Value is already set!');
    });
    it("setWhitelistGuild - Sucess", async function () {
        await CharacterNftInstance.connect(moderator).setWhitelistGuild(LockerInstance.address, true);
        expect(await CharacterNftInstance.isGuildWhitelisted(LockerInstance.address)).to.equal(true);
        expect(await CharacterNftInstance.isGuildWhitelisted(tester1.address)).to.equal(false);
    });

    it("externalUnlockCharacter - Fail if not called from moderator", async function () {
        let extraData = "0x";
        await CharacterNftInstance.connect(moderator).setWhitelistGuild(LockerInstance.address, true);
        await CharacterNftInstance.connect(tester1).lockCharacter(0, token1, LockerInstance.address, extraData);

        await expect(CharacterNftInstance.connect(tester1).externalUnlockCharacter(tester1.address, 0, token1, LockerInstance.address, extraData)).to.be.reverted;
    });
    it("externalUnlockCharacter - Sucess", async function () {
        let extraData = "0x";
        await CharacterNftInstance.connect(moderator).setWhitelistGuild(LockerInstance.address, true);
        await CharacterNftInstance.connect(tester1).lockCharacter(0, token1, LockerInstance.address, extraData);
        await CharacterNftInstance.connect(moderator).externalUnlockCharacter(tester1.address, 0, token1, LockerInstance.address, extraData);
        expect(await CharacterNftInstance.isCharacterLocked(token1)).to.equal(false);
    });
});