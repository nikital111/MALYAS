const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MLS", function () {
  let acc1, acc2, acc3, MLS;
  const minted = 7000000000;
  const mintedSt = minted.toString();
  const commission = 0.0001;
  beforeEach(async function () {
    [acc1, acc2, acc3] = await ethers.getSigners();
    const MLSContract = await ethers.getContractFactory("MALYAS", acc1);
    MLS = await MLSContract.deploy("MALYAS", "MLS", ethers.utils.parseEther(mintedSt));
    await MLS.deployed();
  });

  it("should be deployed", async function () {
    expect(MLS.address).to.be.properAddress;
    //console.log("address is valid");

    const balance = await MLS.balanceOf(acc1.address);

    //console.log(balance);

    expect(balance).to.eq(ethers.utils.parseEther(mintedSt));
  });

  it("mint", async function () {
    const val = ethers.utils.parseEther("1000");
    let address0 = "0x0000000000000000000000000000000000000000";
    const tx = await MLS._mint(acc2.address, val);

    await expect(tx)
      .to.emit(MLS, 'Transfer')
      .withArgs(address0, acc2.address, val);

    const balance = await MLS.balanceOf(acc2.address);
   // console.log(balance);

    expect(balance).to.eq(val);
  });

  it("transfer", async function () {
    const val = ethers.utils.parseEther("1000");

    const num1 = minted - 1000;
    const numSt1 = num1.toString();
    const valTransfer1 = ethers.utils.parseEther(numSt1);

    const num2 = 1000 - commission;
    const numSt2 = num2.toString();
    const valTransfer2 = ethers.utils.parseEther(numSt2);

    const num3 = minted - commission;
    const numSt3 = num3.toString();
    const supplyAfterTr = ethers.utils.parseEther(numSt3);

    const transfer = await MLS.transfer(acc2.address, val);

    await expect(transfer)
      .to.emit(MLS, 'Transfer')
      .withArgs(acc1.address, acc2.address, val);

    const balance1 = await MLS.balanceOf(acc1.address);
    const balance2 = await MLS.balanceOf(acc2.address);
    //console.log(balance1, balance2);

    expect(balance1).to.eq(valTransfer1);
    expect(balance2).to.eq(valTransfer2);

    const totalSupply = await MLS.totalSupply();

    expect(totalSupply).to.eq(supplyAfterTr);

  });

  it("approve", async function () {
    const val = ethers.utils.parseEther("1000");

    const tx = await MLS.approve(acc2.address, val);

    await expect(tx)
      .to.emit(MLS, 'Approval')
      .withArgs(acc1.address, acc2.address, val);

    const allowVal = await MLS.allowance(acc1.address, acc2.address);
    //console.log(allowVal);
    expect(allowVal).to.eq(val);
  });

  it("transfer from", async function () {
    const val = ethers.utils.parseEther("1000");

    const num1 = minted - 1000;
    const numSt1 = num1.toString();
    const valTransfer1 = ethers.utils.parseEther(numSt1);

    const num2 = 1000 - commission;
    const numSt2 = num2.toString();
    const valTransfer2 = ethers.utils.parseEther(numSt2);

    await MLS.approve(acc3.address, val);

    const transferFrom = await MLS.connect(acc3).transferFrom(acc1.address, acc2.address, val);

    await expect(transferFrom)
      .to.emit(MLS, 'Transfer')
      .withArgs(acc1.address, acc2.address, val);

    const balance1 = await MLS.balanceOf(acc1.address);
    const balance2 = await MLS.balanceOf(acc2.address);
    //console.log(balance1, balance2);

    expect(balance1).to.eq(valTransfer1);
    expect(balance2).to.eq(valTransfer2);

    const allowance = await MLS.allowance(acc1.address, acc2.address);

    expect(allowance).to.eq(0);

  });

  it("burn", async function () {
    const val = ethers.utils.parseEther("1000000000");
    let address0 = "0x0000000000000000000000000000000000000000";

    const num = minted - 1000000000;
    const numSt = num.toString();
    const valTransfer = ethers.utils.parseEther(numSt);

    const burn = await MLS._burn(acc1.address, val);

    await expect(burn)
      .to.emit(MLS, 'Transfer')
      .withArgs(acc1.address, address0, val);

    const balance = await MLS.balanceOf(acc1.address);
    const totalSupply = await MLS.totalSupply();
    //console.log(balance, totalSupply);

    expect(balance).to.eq(valTransfer);
    expect(totalSupply).to.eq(valTransfer);

  });

  it("change Allowance", async function () {
    const val = ethers.utils.parseEther("1000");

    await MLS.approve(acc2.address, val);

    const increase = await MLS.increaseAllowance(acc2.address, val);

    await expect(increase)
      .to.emit(MLS, 'Approval')
      .withArgs(acc1.address, acc2.address, ethers.utils.parseEther("2000"));

    const allowVal = await MLS.allowance(acc1.address, acc2.address);
    //console.log(allowVal);
    expect(allowVal).to.eq(ethers.utils.parseEther("2000"));


    const decrease = await MLS.decreaseAllowance(acc2.address, val);

    await expect(decrease)
      .to.emit(MLS, 'Approval')
      .withArgs(acc1.address, acc2.address, val);

    const allowVal2 = await MLS.allowance(acc1.address, acc2.address);
    //console.log(allowVal2);
    expect(allowVal2).to.eq(val);

  });

});
