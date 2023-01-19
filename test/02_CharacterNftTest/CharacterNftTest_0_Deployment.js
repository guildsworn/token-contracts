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

describe("CharacterNftTest_0_Deployment", function () {
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
    });
    describe("Deployment", function () {
        it("Check if default admin was set to deployer", async function () {
            expect(await CharacterNftInstance.hasRole(defaultAdminHash, deployer.address)).to.be.true;
        });
        it("Check if contract is not Initialised", async function () {            
            expect(await CharacterNftInstance.isInitialised()).to.be.false;
        }); 
        it("Check if init fails if not called from defaulAdmin", async function () {
            await expect(
                CharacterNftInstance.connect(tester1).init(
                    defaultAdmin.address,
                    moderator.address,
                    vault.address,
                    [minter1.address, minter2.address],
                    10
                )
            ).to.be.reverted;
        });        
        it("Check if init goes through", async function () {
            await CharacterNftInstance.init(
                defaultAdmin.address,
                    moderator.address,
                    vault.address,
                    [minter1.address, minter2.address],
                    10
            );
        });
    });
});