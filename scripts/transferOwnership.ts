import { ethers } from "hardhat";
import { CBANK } from "../types/contracts/CBANK.sol/CBANK";
async function main() {
    const [deployer] = await ethers.getSigners();
    const TokenContract = await ethers.getContractFactory("CBANK");
    const contract = TokenContract.attach(`${process.env.CONTRACT_ADDRESS}`).connect(deployer) as CBANK;

    const ownerAddress = `${process.env.OWNER_ADDRESS}`;
    const totalAmount = "10000000000000000000000000000";
    await contract.transfer(ownerAddress, totalAmount);
    console.log("All token transferred");

    await contract.addLocker(ownerAddress);
    console.log("Locker added");

    await contract.transferOwnership(ownerAddress);
    console.log("Ownership transferred");
    await contract.transferSupervisorOwnership(ownerAddress);
    console.log("Supervisor ownership transferred");
}

main();
