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
let character1Hash;

let CharacterNftInstance;

describe("CharacterNftTest_3_MINTER", function () {
    beforeEach("deploy the contract instance first", async function () {
        [deployer, defaultAdmin, moderator, locker, eldToken, priceResolver, vault, signer, tester1, tester2, minter1, minter2] = await ethers.getSigners();

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
    });
    it("Should be able to mint tokens", async function () {
        await expect(CharacterNftInstance.connect(minter1).safeMint(tester1.address, character1Hash))
            .to.emit(CharacterNftInstance, "CharacterCreated")
            .withArgs(0, character1Hash);
        expect(await CharacterNftInstance.balanceOf(tester1.address)).to.equal("1");
    });
    it("Should fail if not called from minter", async function () {
        await expect(CharacterNftInstance.connect(tester1).safeMint(tester1.address, character1Hash)).to.be.reverted;
    });
});