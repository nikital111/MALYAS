const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Airdrop", function () {
    let acc1, acc2, acc3, acc4, acc5, acc6, acc7, MLS;
    const minted = 7000000000;
    const mintedSt = minted.toString();
    const commission = 0.0001;
    beforeEach(async function () {
        [acc1, acc2, acc3, acc4, acc5, acc6, acc7] = await ethers.getSigners();

        const MLSContract = await ethers.getContractFactory("MALYAS", acc1);
        MLS = await MLSContract.deploy("MALYAS", "MLS", ethers.utils.parseEther(mintedSt));
        await MLS.deployed();

        const TTContract = await ethers.getContractFactory("TestToken", acc1);
        TT = await TTContract.deploy();
        await TT.deployed();

        const AirdropContract = await ethers.getContractFactory("Airdrop", acc1);
        Airdrop = await AirdropContract.deploy(MLS.address, TT.address);
        await Airdrop.deployed();
    });

    it("should be deployed", async function () {
        expect(MLS.address).to.be.properAddress;
        expect(TT.address).to.be.properAddress;
        expect(Airdrop.address).to.be.properAddress;
        //console.log("address is valid");
    });


    it("distribute Airdrop", async function () {
        const val = ethers.utils.parseEther("1000");

        const num1 = 100000;
        const numSt1 = num1.toString();
        const valToAirdrop = ethers.utils.parseEther(numSt1);

        const num2 = 1000 - commission;
        const numSt2 = num2.toString();
        const valDistribute = ethers.utils.parseEther(numSt2);

        const num3 = 2000 - commission * 2;
        const numSt3 = num3.toString();
        const valDistribute2 = ethers.utils.parseEther(numSt3);

        const arrRec = [acc2.address,acc3.address,acc4.address,acc5.address,acc6.address,acc7.address];

        const arrAmount = [val,val,val,val,val,val];

        await TT.mint(acc2.address, val);
        await TT.mint(acc3.address, val);
        await TT.mint(acc4.address, val);
        await TT.mint(acc5.address, val);
        await TT.mint(acc6.address, val);
        await TT.mint(acc7.address, val);

        await MLS.transfer(Airdrop.address, valToAirdrop);

        const distribute = await Airdrop.distributeAirdrop(arrRec,arrAmount);

        const time = (await ethers.provider.getBlock(distribute.blockNumber)).timestamp;

        await expect(distribute)
            .to.emit(Airdrop, 'DistributedAirdrop')
            .withArgs(arrRec.length, time);

        const balance1 = await MLS.balanceOf(acc2.address);
        const balance2 = await MLS.balanceOf(acc3.address);
        const balance3 = await MLS.balanceOf(acc4.address);
        const balance4 = await MLS.balanceOf(acc5.address);
        const balance5 = await MLS.balanceOf(acc6.address);
        const balance6 = await MLS.balanceOf(acc7.address);

        expect(balance1).to.eq(valDistribute);
        expect(balance2).to.eq(valDistribute);
        expect(balance3).to.eq(valDistribute);
        expect(balance4).to.eq(valDistribute);
        expect(balance5).to.eq(valDistribute);
        expect(balance6).to.eq(valDistribute);
    });


    it("claim Airdrop", async function () {
        const val = ethers.utils.parseEther("1000");

        const num1 = 100000;
        const numSt1 = num1.toString();
        const valToAirdrop = ethers.utils.parseEther(numSt1);

        const num2 = 1000 - commission;
        const numSt2 = num2.toString();
        const valDistribute = ethers.utils.parseEther(numSt2);

        await TT.mint(acc2.address, val);
        await MLS.transfer(Airdrop.address, valToAirdrop);

        const claimAirdropTx = await Airdrop.connect(acc2).claimAirdrop();

        const time2 = (await ethers.provider.getBlock(claimAirdropTx.blockNumber)).timestamp;

        await expect(claimAirdropTx)
            .to.emit(Airdrop, 'ClaimAirdrop')
            .withArgs(acc2.address, val, time2);

            const balance = await MLS.balanceOf(acc2.address);
            expect(balance).to.eq(valDistribute);

       // const secondClaimAirdropTx = await Airdrop.connect(acc2).claimAirdrop();

        await expect(Airdrop.connect(acc2).claimAirdrop())
        .to.be.revertedWith('claimed');
    })

});
