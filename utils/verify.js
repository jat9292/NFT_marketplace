const hre = require("hardhat");

exports.verifyContract = async (contract, args, num_block_confirmation) => {
    const { address } = contract;
    if (hre.network.config.chainId === 31337 || !hre.config.etherscan.apiKey) {
      return; // contract is deployed on local network or no apiKey is configured
    }
    console.log("Waiting 5 block confirmations...");
    await contract.deployTransaction.wait(num_block_confirmation); // needed if verifyContract() is called immediately after deployment
    try {
      console.log("Verifying contract...");
      await hre.run("verify:verify", {
        address: address,
        constructorArguments: args,
      });
    } catch (err) {
      if (err.message.includes("Reason: Already Verified")) {
        console.log("Contract is already verified!");
      }
    }
  };