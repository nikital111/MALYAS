const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Staking", function () {
    let acc1, acc2, acc3, MLS;
    const minted = 7000000000;
    const mintedSt = minted.toString();
    const commission = 0.0001;
    beforeEach(async function () {
        [acc1, acc2, acc3] = await ethers.getSigners();

        const MLSContract = await ethers.getContractFactory("MALYAS", acc1);
        MLS = await MLSContract.deploy("MALYAS", "MLS", ethers.utils.parseEther(mintedSt));
        await MLS.deployed();

        const StakingContract = await ethers.getContractFactory("Staking", acc1);
        Staking = await StakingContract.deploy(MLS.address,2629800000,150,31557600000,2629800000);
        await Staking.deployed();
    });

    it("should be deployed", async function () {
        expect(MLS.address).to.be.properAddress;
        expect(Staking.address).to.be.properAddress;
        console.log("address is valid");
    });


    it("do bid", async function () {
        const val = ethers.utils.parseEther("1000");
        const valFContract = ethers.utils.parseEther("15000");

        const num = 16000 - commission * 3;
        const numSt = num.toString();
        const valOnContract = ethers.utils.parseEther(numSt);

        const num2 = num - commission;
        const numSt2 = num2.toString();
        const valWithdraw2 = ethers.utils.parseEther(numSt2);

        await MLS.transfer(Staking.address, valFContract);
        await MLS.transfer(acc2.address, val);

        await MLS.connect(acc2).approve(Staking.address, val);
        
        const doBidTx = await Staking.connect(acc2).doBid(ethers.utils.parseEther("999.9999"));
        const time = (await ethers.provider.getBlock(doBidTx.blockNumber)).timestamp;
        expect(doBidTx)
            .to.emit(Staking, 'DoBid')
            .withArgs(acc2.address, val, time);
            
        const balance1 = await MLS.balanceOf(acc2.address);
        const balance2 = await MLS.balanceOf(Staking.address);

        expect(balance1).to.eq(0);
        expect(balance2).to.eq(valOnContract);

        const bid = await Staking.getInfoBid(acc2.address);

        console.log(bid)

        expect(bid[0]).to.eq(ethers.utils.parseEther("999.9999"));
        expect(bid[1]).to.eq(time);
        expect(bid[2]).to.eq(time + 2629800000);
        expect(bid[3]).to.eq(ethers.utils.parseEther("999.9999"));

    });



});
