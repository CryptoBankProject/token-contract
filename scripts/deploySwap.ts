import { ethers, network } from "hardhat";
import { CbankSwap } from "../types/contracts/CbankSwap.sol/CbankSwap";

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Network: ", network.name);

    console.log("Deploying swap contracts with the account: ", deployer.address);

    const balance = await deployer.getBalance();
    console.log("Account balance: ", ethers.utils.formatEther(balance.toString()) + " KLAY");

    const Factory = await ethers.getContractFactory("CbankSwap");
    const contract = (await Factory.deploy("0x52f4c436c9aab5b5d0dd31fb3fb8f253fd6cb285", "0xf2Eb788Cfc3386A6511b7D1973E3Fe6f87f89117")) as CbankSwap;
    await contract.deployed();

    console.log("Cbank Swap address: ", contract.address);
}

main();
