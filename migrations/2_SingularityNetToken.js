let SingularityNetToken = artifacts.require("./SingularityNetToken.sol");

const name = "SingularityNET Token"
const symbol = "AGIX"

module.exports = function (deployer) {
    deployer.deploy(SingularityNetToken, name, symbol);
  };
