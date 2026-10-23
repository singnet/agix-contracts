import { network } from "hardhat";

const { ethers } = await network.getOrCreate();

const [deployer] = await ethers.getSigners();
console.log("Deploying contracts with the account:", deployer.address);

const name = "full name of the token";
const ticker = "ticker of the token";

const token = await ethers.deployContract("SingularityNetToken", [name, ticker]);
await token.waitForDeployment();

console.log("Contract deployed", await token.getAddress());
