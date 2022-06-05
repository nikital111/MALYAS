const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TeamTokens", function () {
    let acc1, acc2, acc3, acc4, acc5, MLS;
    const minted = 7000000000;
    const mintedSt = minted.toString();
    const commission = 0.0001;
    beforeEach(async function () {
        [acc1, acc2, acc3] = await ethers.getSigners();

        const MLSContract = await ethers.getContractFactory("MALYAS", acc1);
        MLS = await MLSContract.deploy("MALYAS", "MLS", ethers.utils.parseEther(mintedSt));
        await MLS.deployed();
        
        const tx = await MLS.name();
        const time = (await ethers.provider.getBlock(tx.blockNumber)).timestamp;
        console.log(time);

        const myTime = time + 2;

        const TeamTokensContract = await ethers.getContractFactory("TeamTokens", acc1);
        TeamTokens = await TeamTokensContract.deploy(MLS.address, myTime, acc2.address);
        await TeamTokens.deployed();
    });

    it("should be deployed", async function () {
        expect(MLS.address).to.be.properAddress;
        expect(TeamTokens.address).to.be.properAddress;
        console.log("address is valid");
    });


    it("withdraw tokens", async function () {
        const val = ethers.utils.parseEther("1000");

        const num = 1000 - commission;
        const numSt = num.toString();
        const valWithdraw = ethers.utils.parseEther(numSt);

        const num2 = num - commission;
        const numSt2 = num2.toString();
        const valWithdraw2 = ethers.utils.parseEther(numSt2);

        const tx = await MLS.transfer(TeamTokens.address, val);

        await tx.wait();

        const withdrawTokens = await TeamTokens.withdrawTokens(valWithdraw);

        const time = (await ethers.provider.getBlock(withdrawTokens.blockNumber)).timestamp;

        expect(withdrawTokens)
            .to.emit(TeamTokens, 'WithdrawnTokens')
            .withArgs(acc2.address, val, time);

        const balance1 = await MLS.balanceOf(acc2.address);
        const balance2 = await MLS.balanceOf(TeamTokens.address);

        expect(balance1).to.eq(valWithdraw2);
        expect(balance2).to.eq(0);

    });



});
