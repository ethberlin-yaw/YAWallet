// Fetch the Storage contract data from the Storage.json file
var Wallet = artifacts.require("./Wallet.sol");
var ECTools = artifacts.require("./libs/ECTools.sol");

// JavaScript export
module.exports = function(deployer) {
    // Deploy the contract to the network
    deployer.deploy(ECTools);
	deployer.link(ECTools, Wallet);
    // deployer.deploy(Wallet);

}