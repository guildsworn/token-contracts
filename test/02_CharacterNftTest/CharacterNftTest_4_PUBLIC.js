const { expect, assert } = require("chai");
const { ethers, artifacts } = require("hardhat");
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
let token4;

let character1Hash;
let character2Hash;

let CharacterNftInstance;
let LockerInstance;

// Function to calculate the bytes4 interface ID of a Solidity interface
const getInterfaceId = (interfaceAbi) => {
    const contractInterface = new utils.Interface(interfaceAbi);
    let interfaceID = ethers.constants.Zero;
    const functions = Object.keys(contractInterface.functions);
    for (let i = 0; i < functions.length; i++) {
        interfaceID = interfaceID.xor(contractInterface.getSighash(functions[i]));
    }
    return interfaceID;
};

describe("CharacterNftTest_4_PUBLIC", function () {
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
        let character2Name = "Test character class 2";
        character2Hash = utils.hashMessage(character2Name);
        await CharacterNftInstance.connect(minter1).safeMint(tester1.address, character1Hash);
        token1 = 0;
        await CharacterNftInstance.connect(minter1).safeMint(tester1.address, character1Hash);
        token2 = 1;
        await CharacterNftInstance.connect(minter1).safeMint(tester2.address, character1Hash);
        token3 = 2;
        await CharacterNftInstance.connect(minter1).safeMint(tester2.address, character2Hash);
        token4 = 3;

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

    it("lockCharacter - You are not the owner!", async function () {
        let extraData = "0x";
        await CharacterNftInstance.connect(moderator).setWhitelistGuild(LockerInstance.address, true);
        await expect(CharacterNftInstance.connect(tester1).lockCharacter(0, token3, LockerInstance.address, extraData)).to.be.revertedWith('You are not the owner!');
    });
    it("lockCharacter - Guild is not whitelisted!", async function () {
        let extraData = "0x";
        await expect(CharacterNftInstance.connect(tester1).lockCharacter(0, token1, LockerInstance.address, extraData)).to.be.revertedWith('Guild is not whitelisted!');
    });
    it("lockCharacter - Character is already locked!", async function () {
        let extraData = "0x";
        await CharacterNftInstance.connect(moderator).setWhitelistGuild(LockerInstance.address, true);
        await CharacterNftInstance.connect(tester1).lockCharacter(0, token1, LockerInstance.address, extraData);
        await expect(CharacterNftInstance.connect(tester1).lockCharacter(0, token1, LockerInstance.address, extraData)).to.be.revertedWith('Character is already locked!');
    });
    it("lockCharacter - Sucess", async function () {
        let extraData = "0x";
        await CharacterNftInstance.connect(moderator).setWhitelistGuild(LockerInstance.address, true);
        await CharacterNftInstance.connect(tester1).lockCharacter(0, token1, LockerInstance.address, extraData);
        expect(await CharacterNftInstance.connect(tester1).isCharacterLocked(token1)).to.be.true;
        expect(await CharacterNftInstance.connect(tester1).getCharacterLockedAt(token1)).to.equal(LockerInstance.address);
        
    });

    it("unlockCharacter - Character is not locked in guild!", async function () {
        let extraData = "0x";
        await CharacterNftInstance.connect(moderator).setWhitelistGuild(LockerInstance.address, true);
        await CharacterNftInstance.connect(tester1).lockCharacter(0, token1, LockerInstance.address, extraData);
        await expect(CharacterNftInstance.connect(tester1).unlockCharacter(0, token2, LockerInstance.address, extraData)).to.be.revertedWith('Character is not locked in guild!');
    });
    it("unlockCharacter - You are not the owner!", async function () {
        let extraData = "0x";
        await CharacterNftInstance.connect(moderator).setWhitelistGuild(LockerInstance.address, true);
        await CharacterNftInstance.connect(tester2).lockCharacter(0, token3, LockerInstance.address, extraData);
        await expect(CharacterNftInstance.connect(tester1).unlockCharacter(0, token3, LockerInstance.address, extraData)).to.be.revertedWith('You are not the owner!');
    });
    it("unlockCharacter - Sucess", async function () {
        let extraData = "0x";
        await CharacterNftInstance.connect(moderator).setWhitelistGuild(LockerInstance.address, true);
        await CharacterNftInstance.connect(tester1).lockCharacter(0, token1, LockerInstance.address, extraData);
        await CharacterNftInstance.connect(tester1).unlockCharacter(0, token1, LockerInstance.address, extraData);
        expect(await CharacterNftInstance.connect(tester1).isCharacterLocked(token1)).to.be.false;
    });

    it("getCharactersClass", async function () {
        expect(await CharacterNftInstance.connect(tester1).getCharactersClass(token1)).to.equal(character1Hash);
    });

    it("burn - You are not the owner!", async function () {
        await CharacterNftInstance.connect(moderator).setWhitelistGuild(LockerInstance.address, true);
        await expect(CharacterNftInstance.connect(tester1).burn(token3)).to.be.revertedWith('You are not the owner!');
    });
    it("burn - Sucess", async function () {
        await CharacterNftInstance.connect(moderator).setWhitelistGuild(LockerInstance.address, true);
        await CharacterNftInstance.connect(tester1).burn(token1);
    });

    it("tokenURI - Not existing token", async function () {
        await expect(CharacterNftInstance.connect(tester1).tokenURI(99)).to.be.revertedWith('ERC721: invalid token ID');
    });
    it("tokenURI, getBaseURI", async function () {
        expect(await CharacterNftInstance.connect(tester1).tokenURI(token1)).to.equal(await CharacterNftInstance.connect(tester1).getBaseURI() + token1);
    });

    it('supportsInterface - does not support random interface', async () => {
        expect(await CharacterNftInstance.supportsInterface("0x00000000")).to.be.false;
    })
    // it('supportsInterface - does support IERC721', async () => {
    //     //TODO: Can't get working, solidity report that interface id of IERC721 is 0x80ac58cd, but we are calculating 0x80ac58cd
    //     const IERC721 = await artifacts.readArtifact('IERC721');
    //     const interfaceId = getInterfaceId(IERC721.abi);
    //     const supports = await CharacterNftInstance.supportsInterface(interfaceId);
    //     expect(supports).to.be.true;
    // })
    it('supportsInterface - does support ICharacterNftContract', async () => {
        const CharacterNftInterface = await artifacts.readArtifact('ICharacterNftContract');
        const interfaceId = getInterfaceId(CharacterNftInterface.abi);
        const supports = await CharacterNftInstance.supportsInterface(interfaceId);
        expect(supports).to.be.true;
    })
    

    it("ownerOf", async function () {
        expect(await CharacterNftInstance.connect(tester1).ownerOf(token1)).to.equal(tester1.address);
        expect(await CharacterNftInstance.connect(tester2).ownerOf(token1)).to.equal(tester1.address);
    });

    it("transferFrom - Token class is not transferable but user can transfer transferable classes!", async function () {
        await CharacterNftInstance.connect(moderator).setWhitelistGuild(LockerInstance.address, true);
        await CharacterNftInstance.connect(moderator).setNotTransferable(character1Hash, true);

        await expect(CharacterNftInstance.connect(tester1).transferFrom(tester1.address, tester2.address, token1)).to.be.revertedWith('Token class is not transferable!');
        await expect(CharacterNftInstance.connect(tester2).transferFrom(tester2.address, tester1.address, token3)).to.be.revertedWith('Token class is not transferable!');
        await CharacterNftInstance.connect(tester2).transferFrom(tester2.address, tester1.address, token4)
        expect(await CharacterNftInstance.connect(tester1).ownerOf(token4)).to.equal(tester1.address);
    });
    it("transferFrom - Token is locked!", async function () {
        let extraData = "0x";
        await CharacterNftInstance.connect(moderator).setWhitelistGuild(LockerInstance.address, true);
        await CharacterNftInstance.connect(tester1).lockCharacter(0, token1, LockerInstance.address, extraData);

        await expect(CharacterNftInstance.connect(tester1).transferFrom(tester1.address, tester2.address, token1)).to.be.revertedWith('Token is locked!');
    });
    it("transferFrom - Sucess", async function () {
        await CharacterNftInstance.connect(tester1).transferFrom(tester1.address, tester2.address, token1);
    });
});