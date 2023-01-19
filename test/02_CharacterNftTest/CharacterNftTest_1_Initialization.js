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

describe("CharacterNftTest_1_Initialization", function () {
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
    });
    describe("Initialization", function () {
        it("Check if init fails if it is called again", async function () {
            await expect(
                CharacterNftInstance.init(
                    defaultAdmin.address,
                    moderator.address,
                    vault.address,
                    [minter1.address, minter2.address],
                    10
                )
            ).to.be.reverted;
        });
        it("Check if contract is Initialised", async function () {
            expect(await CharacterNftInstance.isInitialised()).to.be.true;
        });
        it("Check if default admin was set to admin", async function () {
            expect(await CharacterNftInstance.hasRole(defaultAdminHash, defaultAdmin.address)).to.be.true;
        });
        it("Check if deployer is not longer default admin", async function () {
            expect(await CharacterNftInstance.hasRole(defaultAdminHash, deployer.address)).to.be.false;
        });
        it("Check if minter1 is minter", async function () {
            expect(await CharacterNftInstance.hasRole(minterHash, minter1.address)).to.be.true;
        });
        it("Check if minter2 is minter", async function () {
            expect(await CharacterNftInstance.hasRole(minterHash, minter2.address)).to.be.true;
        });
        it("Check if vault was set to vault", async function () {
            expect(await CharacterNftInstance.getVaultAddress()).to.equal(vault.address);
        });
        it("Check if royaltyNumerator was set to 10", async function () {
            expect(await CharacterNftInstance.getRoyaltyNumerator()).to.equal(10);
        });
    });
});