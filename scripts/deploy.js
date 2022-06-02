const { ethers, run } = require("hardhat");
const fs = require('fs');

async function main() {
  // create first collection
  const SuperMarioWorld = await ethers.getContractFactory("NFTCollection");
  constructor_args = ["SuperMarioWorld", "SUPM",
  "https://ipfs.io/ipfs/Qmb6tWBDLd9j2oSnvSNhE314WFL7SRpQNtfwjFWsStXp5A/",8]
  const superMarioWorld = await SuperMarioWorld.deploy(...constructor_args);

  await superMarioWorld.deployed();
  console.log("Success! Contract was deployed to: ", superMarioWorld.address);
  fs.appendFileSync('supported_collections.txt', superMarioWorld.address+'\n')

  // mint first two NFTs from first collection
  await superMarioWorld.mint()
  await superMarioWorld.mint()
  console.log("NFT successfully minted");

  // verify first contract on Etherscan
  await run('verify:verify', {
    address: superMarioWorld.address,
    constructorArguments: constructor_args,
  })


// create second collection
  const CuteDogs = await ethers.getContractFactory("NFTCollection");
  constructor_args = ["Cute dogs", "CDOGS",
  "https://ipfs.io/ipfs/QmfHpdY1iZzazBCibAj7rPNUMBLsNdUHbHP5G1tsnfyHuH/",3]
  const cuteDogs = await CuteDogs.deploy(...constructor_args);

  await cuteDogs.deployed();
  console.log("Success! Contract was deployed to: ", cuteDogs.address);
  fs.appendFileSync('supported_collections.txt', cuteDogs.address)

  // mint first two NFTs from second collection
  await cuteDogs.mint()
  await cuteDogs.mint()

  // verify second contract on Etherscan
  await run('verify:verify', {
    address: cuteDogs.address,
    constructorArguments: constructor_args,
  })
  
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });