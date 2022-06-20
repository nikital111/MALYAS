const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Staking", function () {
    let acc1, acc2, acc3, MLS;
    const minted = 7000000000;
    const mintedSt = minted.toString();
    const commission = 0.0001;
    // beforeEach(async function () {
    //     [acc1, acc2, acc3] = await ethers.getSigners();

    //     const MLSContract = await ethers.getContractFactory("MALYAS", acc1);
    //     MLS = await MLSContract.deploy("MALYAS", "MLS", ethers.utils.parseEther(mintedSt));
    //     await MLS.deployed();

    //     const StakingContract = await ethers.getContractFactory("Staking", acc1);
    //     Staking = await StakingContract.deploy(MLS.address,1,150,31557600000,1);
    //     await Staking.deployed();
    // });

    it("should be deployed", async function () {
        [acc1, acc2, acc3] = await ethers.getSigners();

        const MLSContract = await ethers.getContractFactory("MALYAS", acc1);
        MLS = await MLSContract.deploy("MALYAS", "MLS", ethers.utils.parseEther(mintedSt));
        await MLS.deployed();

        const StakingContract = await ethers.getContractFactory("Staking", acc1);
        Staking = await StakingContract.deploy(MLS.address, 1, 150, 31557600000, 1);
        await Staking.deployed();

        expect(MLS.address).to.be.properAddress;
        expect(Staking.address).to.be.properAddress;
        //console.log("address is valid");
    });


    it("do bid", async function () {
        [acc1, acc2, acc3] = await ethers.getSigners();

        const MLSContract = await ethers.getContractFactory("MALYAS", acc1);
        MLS = await MLSContract.deploy("MALYAS", "MLS", ethers.utils.parseEther(mintedSt));
        await MLS.deployed();

        const StakingContract = await ethers.getContractFactory("Staking", acc1);
        Staking = await StakingContract.deploy(MLS.address, 1, 150, 31557600000, 1);
        await Staking.deployed();

        const val = ethers.utils.parseEther("1000");
        const valFContract = ethers.utils.parseEther("15000");

        const num = 16000 - commission * 3;
        const numSt = num.toString();
        const valOnContract = ethers.utils.parseEther(numSt);

        const num3 = 1000 - commission;
        const numSt3 = num3.toString();
        const val4 = ethers.utils.parseEther(numSt3);

        await MLS.transfer(Staking.address, valFContract);
        await MLS.transfer(acc2.address, val);

        await MLS.connect(acc2).approve(Staking.address, val);

        const doBidTx = await Staking.connect(acc2).doBid(ethers.utils.parseEther("999.9999"));
        const time = (await ethers.provider.getBlock(doBidTx.blockNumber)).timestamp;
        await expect(doBidTx)
            .to.emit(Staking, 'DoBid')
            .withArgs(acc2.address, val4, time);

        const balance1 = await MLS.balanceOf(acc2.address);
        const balance2 = await MLS.balanceOf(Staking.address);

        expect(balance1).to.eq(0);
        expect(balance2).to.eq(valOnContract);

        const bid = await Staking.getInfoBid(acc2.address);

        // console.log(bid)

        expect(bid[0]).to.eq(ethers.utils.parseEther("999.9999"));
        expect(bid[1]).to.eq(time);
        expect(bid[2]).to.eq(time + 1);

    });



    it("remove bid", async function () {
        [acc1, acc2, acc3] = await ethers.getSigners();

        const MLSContract = await ethers.getContractFactory("MALYAS", acc1);
        MLS = await MLSContract.deploy("MALYAS", "MLS", ethers.utils.parseEther(mintedSt));
        await MLS.deployed();

        const StakingContract = await ethers.getContractFactory("Staking", acc1);
        Staking = await StakingContract.deploy(MLS.address, 1, 150, 31557600000, 1);
        await Staking.deployed();

        const val = ethers.utils.parseEther("1000");
        const valFContract = ethers.utils.parseEther("15000");

        const num = 1000 - commission * 2;
        const numSt = num.toString();
        const val2 = ethers.utils.parseEther(numSt);

        const num2 = 15000 - commission * 2;
        const numSt2 = num2.toString();
        const val3 = ethers.utils.parseEther(numSt2);

        const num3 = 1000 - commission;
        const numSt3 = num3.toString();
        const val4 = ethers.utils.parseEther(numSt3);

        await MLS.transfer(Staking.address, valFContract);
        await MLS.transfer(acc2.address, val);

        await MLS.connect(acc2).approve(Staking.address, val);



        const doBidTx = await Staking.connect(acc2).doBid(ethers.utils.parseEther("999.9999"));

        const timeDo = (await ethers.provider.getBlock(doBidTx.blockNumber)).timestamp;

        const removeBidTx = await Staking.connect(acc2).removeBid();

        const time = (await ethers.provider.getBlock(removeBidTx.blockNumber)).timestamp;

        await expect(removeBidTx)
            .to.emit(Staking, 'RemoveBid')
            .withArgs(acc2.address, val4, time);

        const balance1 = await MLS.balanceOf(acc2.address);
        const balance2 = await MLS.balanceOf(Staking.address);

        expect(balance1).to.eq(val2);
        expect(balance2).to.eq(val3);

        const bid = await Staking.getInfoBid(acc2.address);

        //console.log(bid);

        expect(bid[0]).to.eq(0);
        expect(bid[1]).to.eq(timeDo);
        expect(bid[2]).to.eq(timeDo + 1);
        expect(bid[5]).to.eq(0);

    });


    it("check reward", async function () {
        [acc1, acc2, acc3] = await ethers.getSigners();

        const MLSContract = await ethers.getContractFactory("MALYAS", acc1);
        MLS = await MLSContract.deploy("MALYAS", "MLS", ethers.utils.parseEther(mintedSt));
        await MLS.deployed();

        const StakingContract = await ethers.getContractFactory("Staking", acc1);
        // , 3m, 150%, 1y, 1m.
        Staking = await StakingContract.deploy(MLS.address, 7889400000, 150, 31557600000, 2629800000);
        await Staking.deployed();

        const val = ethers.utils.parseEther("1000");
        const valFContract = ethers.utils.parseEther("15000");

        const num = 1000 - commission;
        const numSt = num.toString();
        const valBid = ethers.utils.parseEther(numSt);

        await MLS.transfer(Staking.address, valFContract);
        await MLS.transfer(acc2.address, val);

        await MLS.connect(acc2).approve(Staking.address, val);

        await Staking.connect(acc2).doBid(valBid);

        const bid = await Staking.getInfoBid(acc2.address);

        // console.log(bid);

        expect(bid[3]).to.eq(ethers.utils.parseEther("374.9999625"));

    });


    it("claim reward", async function () {
        [acc1, acc2, acc3] = await ethers.getSigners();

        const MLSContract = await ethers.getContractFactory("MALYAS", acc1);
        MLS = await MLSContract.deploy("MALYAS", "MLS", ethers.utils.parseEther(mintedSt));
        await MLS.deployed();

        const StakingContract = await ethers.getContractFactory("Staking", acc1);
        Staking = await StakingContract.deploy(MLS.address, 1, 15000000000, 1, 1);
        await Staking.deployed();

        const val = ethers.utils.parseEther("1000");
        const valFContract = ethers.utils.parseEther("15000");

        const val2 = ethers.utils.parseEther("4.753212574678695");

        const val3 = ethers.utils.parseEther("1004.752912574678695");

        await MLS.transfer(Staking.address, valFContract);
        await MLS.transfer(acc2.address, val);

        await MLS.connect(acc2).approve(Staking.address, val);

        await Staking.connect(acc2).doBid(ethers.utils.parseEther("999.9999"));

        await Staking.connect(acc2).removeBid();

        const claimRewardTx = await Staking.connect(acc2).claimReward();

        const time = (await ethers.provider.getBlock(claimRewardTx.blockNumber)).timestamp;

        await expect(claimRewardTx)
            .to.emit(Staking, 'ClaimReward')
            .withArgs(acc2.address, val2, time);

        const bid = await Staking.getInfoBid(acc2.address);

        // console.log(bid);

        expect(bid[0]).to.eq(0);
        expect(bid[1]).to.eq(0);
        expect(bid[2]).to.eq(0);
        expect(bid[3]).to.eq(0);
        expect(bid[4]).to.eq(0);
        expect(bid[5]).to.eq(0);

        const balance1 = await MLS.balanceOf(acc2.address);

        expect(balance1).to.eq(val3);

    });




});
