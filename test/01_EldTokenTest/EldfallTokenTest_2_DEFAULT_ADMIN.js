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
let TokenInstance;

describe("EldfallTokenTest_2_DEFAULT_ADMIN", function () {
    beforeEach("deploy the contract instance first", async function () {
        [deployer, defaultAdmin, moderator, locker, eldToken, priceResolver, vault, signer, tester, tester1, minter1, minter2] = await ethers.getSigners();

        const TokenFactory = await ethers.getContractFactory("ERC20MockContract");
        TokenInstance = await TokenFactory.deploy();
        await TokenInstance.deployed();

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

    describe("Salvaging tokens", function () {
        let tokenAmount = ethers.utils.parseEther("1337");
        it("Should be able to salvage tokens", async function () {
            await TokenInstance.mint(EldTokenInstance.address, tokenAmount);
            expect(await TokenInstance.balanceOf(EldTokenInstance.address)).to.equal(tokenAmount);
            await EldTokenInstance.connect(defaultAdmin).salvageTokensFromContract(TokenInstance.address, defaultAdmin.address, tokenAmount);
            expect(await TokenInstance.balanceOf(EldTokenInstance.address)).to.equal("0");
            expect(await TokenInstance.balanceOf(defaultAdmin.address)).to.equal(tokenAmount);
        });
        it("Should fail if not called from default admin", async function () {
            await TokenInstance.mint(EldTokenInstance.address, tokenAmount);
            await expect(EldTokenInstance.connect(moderator).salvageTokensFromContract(TokenInstance.address, defaultAdmin.address, tokenAmount)).to.be.reverted;
        });
    });

});