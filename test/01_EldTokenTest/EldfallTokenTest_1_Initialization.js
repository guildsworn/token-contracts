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

describe("EldfallTokenTest_1_Initialization", function () {
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

        await EldTokenInstance.init(
            defaultAdmin.address,
            [minter1.address, minter2.address]
        );
    });

    describe("Initialization", function () {
        it("Check if init fails if it is called again", async function () {
            await expect(
                EldTokenInstance.init(
                    defaultAdmin.address,
                    [minter1.address, minter2.address]
                )
            ).to.be.reverted;
        });
        it("Check if contract is Initialised", async function () {
            expect(await EldTokenInstance.isInitialised()).to.be.true;
        });
        it("Check if default admin was set to admin", async function () {
            expect(await EldTokenInstance.hasRole(defaultAdminHash, defaultAdmin.address)).to.be.true;
        });
        it("Check if deployer is not longer default admin", async function () {
            expect(await EldTokenInstance.hasRole(defaultAdminHash, deployer.address)).to.be.false;
        });
        it("Check if minter1 is minter", async function () {
            expect(await EldTokenInstance.hasRole(minterHash, minter1.address)).to.be.true;
        });
        it("Check if minter2 is minter", async function () {
            expect(await EldTokenInstance.hasRole(minterHash, minter2.address)).to.be.true;
        });
    });
});