import { ethers } from "hardhat";
import { CbankSwap } from "../types/contracts/CbankSwap.sol/CbankSwap";
async function main() {
    const [deployer] = await ethers.getSigners();
    const SwapContract = await ethers.getContractFactory("CbankSwap");
    const contract = SwapContract.attach(`${process.env.SWAP_CONTRACT_ADDRESS}`).connect(deployer) as CbankSwap;
    const ownerAddress = `${process.env.OWNER_ADDRESS}`;

    await contract.transferOwnership(ownerAddress);
    console.log("Ownership transferred");
}

main();
