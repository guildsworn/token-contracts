const { expect, assert } = require("chai");
const { ethers } = require("hardhat");

let deployer;
let defaultAdmin;
let defaultAdminHash;
let moderator;
let minterHash;
let locker;
let vault;
let signer;
let tester;
let tester1;
let minter1;
let minter2;

let EldTokenInstance;

describe("EldfallTokenTest_0_Deployment", function () {
    beforeEach("deploy the contract instance first", async function () {
        [deployer, defaultAdmin, moderator, locker, eldToken, priceResolver, vault, signer, tester, tester1, minter1, minter2] = await ethers.getSigners();

        const EldtokenFactory = await ethers.getContractFactory("EldfallTokenContract");
        EldTokenInstance = await EldtokenFactory.deploy();
        await EldTokenInstance.deployed();

        // --------------------------
        //   Setting up contracts
        // --------------------------
        defaultAdminHash = await EldTokenInstance.DEFAULT_ADMIN_ROLE();
        minterHash = await EldTokenInstance.MINTER_ROLE();
    });
    describe("Deployment", function () {
        it("Check if default admin was set to deployer", async function () {            
            expect(await EldTokenInstance.hasRole(defaultAdminHash, deployer.address)).to.be.true;
        });
        it("Check if contract is not Initialised", async function () {            
            expect(await EldTokenInstance.isInitialised()).to.be.false;
        });        
        it("Check if init fails if not called from defaulAdmin", async function () {
            await expect(
                EldTokenInstance.connect(tester).init(
                    defaultAdmin.address,
                    [minter1.address, minter2.address]
                )
            ).to.be.reverted;
        });
        it("Check if init goes through", async function () {
            await EldTokenInstance.init(
                defaultAdmin.address,
                [minter1.address, minter2.address]
            );
        });      
    });
});