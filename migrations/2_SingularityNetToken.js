let SingularityNetToken = artifacts.require("./SingularityNetToken.sol");

const name = "SingularityNET Token"
const symbol = "AGI"

module.exports = function (deployer) {
    deployer.deploy(SingularityNetToken, name, symbol);
  };
