import { ethers } from "hardhat";
import { CBANK } from "../types/contracts/CBANK.sol/CBANK";
import fs from "fs";
import { parse } from "csv-parse";
const delay = (time: number) => new Promise((res) => setTimeout(res, time));

async function main() {
    const [deployer] = await ethers.getSigners();
    const TokenContract = await ethers.getContractFactory("CBANK");
    const contract = TokenContract.attach(`${process.env.CONTRACT_ADDRESS}`).connect(deployer) as CBANK;

    // fs.createReadStream(__dirname + "/../transferList.csv")
    //     .pipe(parse({ delimiter: ",", from_line: 1 }))
    //     .on("data", function (row) {
    //         console.log(row[0] + "," + row[1] + "," + ethers.utils.parseEther(row[2].replaceAll(",", "")).toString());
    //     });

    const transfers: any = [];
    const data = fs.readFileSync(__dirname + "/../sample.csv").toLocaleString();
    const rows = data.split("\n");
    rows.forEach((row) => {
        if (row) {
            const columns = row.split(",");
            transfers.push(columns);
        }
    });

    for (let i = 0; i < transfers.length; i++) {
        const [id, toAddress, sendAmount] = transfers[i];
        console.log(id, toAddress, sendAmount);
        const tx = await contract.transfer(toAddress, sendAmount);
        const receipt = await tx.wait();
        console.log(receipt.transactionHash);
        await delay(1000);
    }

    // const toAddress = ``;
    // const sendAmount = "10000000000000000000000000000";
    // await contract.transfer(toAddress, sendAmount);
    console.log("Token transferred");
}

main();
