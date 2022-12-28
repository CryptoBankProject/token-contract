import { ethers, network } from "hardhat";
import { CBANK } from "../types/contracts/CBANK.sol/CBANK";

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Network: ", network.name);

    console.log("Deploying contracts with the account: ", deployer.address);

    const balance = await deployer.getBalance();
    console.log("Account balance: ", ethers.utils.formatEther(balance.toString()) + " KLAY");

    const Factory = await ethers.getContractFactory("CBANK");
    const contract = (await Factory.deploy()) as CBANK;
    await contract.deployed();

    console.log("CBANK address: ", contract.address);
}

main();
