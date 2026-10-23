import { readFileSync } from "node:fs";
import { configVariable, defineConfig } from "hardhat/config";
import hardhatEthers from "@nomicfoundation/hardhat-ethers";
import hardhatVerify from "@nomicfoundation/hardhat-verify";

process.loadEnvFile(".env");

const deployerPrivateKey = readFileSync(".secret", "utf8").trim();

const development = {
  version: "0.6.2",
};

export default defineConfig({
  solidity: {
    profiles: {
      // Hardhat requires a `default` profile; it's used when --build-profile is omitted
      default: development,
      development: {
        version: "0.6.2",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      production: {
        version: "0.6.2",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
  },
  networks: {
    sepolia: {
      type: "http",
      chainType: "l1",
      url: configVariable("INFURA", {
        format: "https://sepolia.infura.io/v3/{variable}",
      }),
      accounts: [deployerPrivateKey],
      chainId: 11155111,
    },
    mainnet: {
      type: "http",
      chainType: "l1",
      url: configVariable("INFURA", {
        format: "https://mainnet.infura.io/v3/{variable}",
      }),
      accounts: [deployerPrivateKey],
      chainId: 1,
    },
  },
  plugins: [hardhatEthers, hardhatVerify],
  verify: {
    etherscan: {
      apiKey: configVariable("ETHERSCAN_API_KEY"),
    },
  },
});
