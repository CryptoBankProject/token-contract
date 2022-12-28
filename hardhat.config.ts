import { HardhatUserConfig } from "hardhat/config";
import { task } from "hardhat/config";
import "@typechain/hardhat";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import "hardhat-gas-reporter";
import "solidity-coverage";
import * as dotenv from "dotenv";
dotenv.config({ path: __dirname + "/.env" });

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (args, hre) => {
    const accounts = await hre.ethers.getSigners();

    for (const account of accounts) {
        console.log(await account.address);
    }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
    networks: {
        mainnet: {
            url: "https://node-api.klaytnapi.com/v1/klaytn",
            chainId: 8217,
            gasPrice: 250000000000,
            accounts: { mnemonic: `${process.env.DEPLOYER_MNEMONIC}` },
            httpHeaders: {
                "x-chain-id": `8217`,
                Authorization: `${process.env.KAS_AUTHORIZATION}`,
            },
        },
        testnet: {
            url: "https://node-api.klaytnapi.com/v1/klaytn",
            chainId: 1001,
            gasPrice: 250000000000,
            accounts: { mnemonic: `${process.env.DEPLOYER_MNEMONIC}` },
            httpHeaders: {
                "x-chain-id": `1001`,
                Authorization: `${process.env.KAS_AUTHORIZATION}`,
            },
        },
    },
    solidity: {
        compilers: [
            {
                version: "0.8.15",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200,
                    },
                },
            },
        ],
    },
    gasReporter: {
        enabled: true,
        currency: "CHF",
        gasPrice: 21,
    },
    typechain: {
        outDir: "types",
        target: "ethers-v5",
    },
    mocha: {
        timeout: 20000,
    },
};

export default config;
