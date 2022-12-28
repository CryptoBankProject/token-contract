import { ethers } from "hardhat";
import { BigNumber, constants } from "ethers";
import chai from "chai";
import { solidity } from "ethereum-waffle";
import { CBANK } from "../types/contracts/CBANK.sol/CBANK";
import { TestCBANK } from "../types/contracts/TestCBANK";
import { CbankSwap } from "../types/contracts/CbankSwap.sol/CbankSwap";

import { ERRORS } from "./constants";
import { expectEvent, expectRevert, timeTravel } from "./helpers";
const { expect } = chai;

const SWAP_RATE: number = 1;

chai.use(solidity);

describe("CBANK Swap Test", function () {
    let cbankContract: CBANK;
    let testCbankContract: TestCBANK;
    let cbankSwapContract: CbankSwap;

    let user1SwapContract: CbankSwap;
    let newOwnerSwapContract: CbankSwap;
    let user1TestCbankContract: TestCBANK;
    let owner: string;
    let user1: string;
    let newOwner: string;

    beforeEach(async function () {
        const accounts = await ethers.getSigners();
        const ownerSigner = accounts[0];
        owner = await ownerSigner.getAddress();
        user1 = await accounts[1].getAddress();
        newOwner = await accounts[2].getAddress();

        const CbankContract = await ethers.getContractFactory("CBANK", ownerSigner);
        cbankContract = (await CbankContract.deploy()) as CBANK;
        await cbankContract.deployed();

        const TestCbankContract = await ethers.getContractFactory("TestCBANK", ownerSigner);
        testCbankContract = (await TestCbankContract.deploy()) as TestCBANK;
        await testCbankContract.deployed();
        user1TestCbankContract = testCbankContract.connect(accounts[1]);

        const CbankSwapContract = await ethers.getContractFactory("CbankSwap", ownerSigner);
        cbankSwapContract = (await CbankSwapContract.deploy(testCbankContract.address, cbankContract.address)) as CbankSwap;
        await cbankSwapContract.deployed();

        user1SwapContract = cbankSwapContract.connect(accounts[1]);
        newOwnerSwapContract = cbankSwapContract.connect(accounts[2]);
    });

    describe("1. Swap Test", async function () {
        it("1-1 should token address info right", async function () {
            expect(await cbankSwapContract.legacyCBANK()).to.equal(testCbankContract.address);
            expect(await cbankSwapContract.newCBANK()).to.equal(cbankContract.address);
        });

        it("1-2 should swap right", async function () {
            await expectRevert(user1SwapContract.swap(), ERRORS.INSUFFICIENT_LEGACY_CBANK);

            const swapAmount = 1000000;
            const cbankSwapAmount = swapAmount * SWAP_RATE;
            await testCbankContract.transfer(user1, swapAmount);
            expect(await testCbankContract.balanceOf(user1)).to.equal(swapAmount);

            await expectRevert(user1SwapContract.swap(), ERRORS.ALLOWANCE_TOO_LOW);

            await user1TestCbankContract.approve(cbankSwapContract.address, ethers.constants.MaxUint256);

            await expectRevert(user1SwapContract.swap(), ERRORS.INSUFFICIENT_NEW_CBANK);

            await cbankContract.transfer(cbankSwapContract.address, cbankSwapAmount);
            expect(await cbankContract.balanceOf(cbankSwapContract.address)).to.equal(cbankSwapAmount);

            await user1SwapContract.swap();
            expect(await testCbankContract.balanceOf(user1)).to.equal(0);
            expect(await testCbankContract.balanceOf(cbankSwapContract.address)).to.equal(swapAmount);
            expect(await cbankContract.balanceOf(user1)).to.equal(cbankSwapAmount);
            expect(await cbankContract.balanceOf(cbankSwapContract.address)).to.equal(0);
        });
    });

    describe("2. Withdraw Test", async function () {
        it("2-1 should withdraw right", async function () {
            const depositAmount = 1000000;
            await cbankContract.transfer(cbankSwapContract.address, depositAmount);
            expect(await cbankContract.balanceOf(cbankSwapContract.address)).to.equal(depositAmount);

            await expectEvent(cbankSwapContract.transferOwnership(newOwner), "OwnershipTransferred", { previousOwner: owner, newOwner: newOwner });

            await expectRevert(cbankSwapContract.withdraw(), ERRORS.OWNABLE_CALLER_NOT_OWNER);
            await newOwnerSwapContract.withdraw();
            expect(await cbankContract.balanceOf(newOwner)).to.equal(depositAmount);
        });
        it("2-2 should withdraw legacy right", async function () {
            const swapAmount = 1000000;
            const cbankSwapAmount = swapAmount * SWAP_RATE;
            await testCbankContract.transfer(user1, swapAmount);
            await user1TestCbankContract.approve(cbankSwapContract.address, ethers.constants.MaxUint256);
            await cbankContract.transfer(cbankSwapContract.address, cbankSwapAmount);
            await user1SwapContract.swap();

            await expectEvent(cbankSwapContract.transferOwnership(newOwner), "OwnershipTransferred", { previousOwner: owner, newOwner: newOwner });
            await newOwnerSwapContract.withdrawLegacy();
            expect(await testCbankContract.balanceOf(newOwner)).to.equal(swapAmount);
        });
    });
});
