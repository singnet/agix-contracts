let SingularityNetToken = artifacts.require("./SingularityNetToken.sol");

const name = "SingularityNET Token"
const symbol = "AGIV2"

module.exports = function (deployer) {
    deployer.deploy(SingularityNetToken, name, symbol);
  };
