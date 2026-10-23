# snet-token-contracts
Includes token contracts, deployments, tests

### SingularityNetToken
* ERC-20 implementation for SingularityNET AGIX Token

## Requirements
* [Node.js](https://github.com/nodejs/node) (22 or later)
* [Npm](https://www.npmjs.com/package/npm)

## Installation

```bash
    npm install
```

## Compilation

```bash
npx hardhat compile
```

## Deploy

```bash
npx hardhat run scripts/deploy.js --build-profile production --network sepolia
```

## Verify

```bash
npx hardhat verify --build-profile production --network sepolia <address> <full_name> <ticker>
```
