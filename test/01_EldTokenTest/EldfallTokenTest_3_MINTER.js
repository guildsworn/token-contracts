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

describe("EldfallTokenTest_3_MINTER", function () {
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

    it("Should be able to mint tokens", async function () {
        await EldTokenInstance.connect(minter1).safeMint(tester.address, 1234);
        expect(await EldTokenInstance.balanceOf(tester.address)).to.equal("1234");

        await EldTokenInstance.connect(minter2).safeMint(tester1.address, 1234);
        expect(await EldTokenInstance.balanceOf(tester1.address)).to.equal("1234");
    });
    it("Should fail if not called from minter", async function () {
        await expect(EldTokenInstance.connect(tester).safeMint(tester.address, 1234)).to.be.reverted;
    });
});