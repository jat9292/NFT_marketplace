const { ethers, run } = require("hardhat");
const fs = require("fs");
const {verifyContract} = require("../utils/verify")

let WAIT_BLOCK_CONFIRMATION = 5

async function main() {
  // create first collection
  const SuperMarioWorld = await ethers.getContractFactory("NFTCollection")
  constructor_args = ["Super Mario World", "SUPM",
  "https://ipfs.io/ipfs/Qmb6tWBDLd9j2oSnvSNhE314WFL7SRpQNtfwjFWsStXp5A/",8]
  const superMarioWorld = await SuperMarioWorld.deploy(...constructor_args)

  console.log("Success! Contract was deployed to: ", superMarioWorld.address)
  
  // verify first collection contract on Etherscan
  await verifyContract(superMarioWorld,constructor_args,WAIT_BLOCK_CONFIRMATION)

  fs.appendFileSync('supported_collections.txt', superMarioWorld.address+'\n')

  // mint first two NFTs from first collection
  await superMarioWorld.mint()
  await superMarioWorld.mint()
  console.log("NFT successfully minted")


  // create second collection
  const CuteDogs = await ethers.getContractFactory("NFTCollection");
  constructor_args = ["Cute dogs", "CDOGS",
  "https://ipfs.io/ipfs/QmfHpdY1iZzazBCibAj7rPNUMBLsNdUHbHP5G1tsnfyHuH/",3]
  const cuteDogs = await CuteDogs.deploy(...constructor_args)

  console.log("Success! Contract was deployed to: ", cuteDogs.address)
  
  // verify second collection contract on Etherscan
  await verifyContract(cuteDogs,constructor_args,WAIT_BLOCK_CONFIRMATION)

  fs.appendFileSync('supported_collections.txt', cuteDogs.address)

  // mint first two NFTs from second collection
  await cuteDogs.mint()
  await cuteDogs.mint()
  console.log("NFT successfully minted")


  // create WETH contract
  const WETH = await ethers.getContractFactory("WETH")
  const weth = await WETH.deploy();

  console.log("Success! Contract was deployed to: ", weth.address)
  await verifyContract(weth,[],WAIT_BLOCK_CONFIRMATION)

  fs.appendFileSync('weth_address.txt', weth.address)


  // create NFT MarketPlace contract
  const NFT_marketplace = await ethers.getContractFactory("NFTMarketPlace");
  const nft_marketplace= await NFT_marketplace.deploy(weth.address);

  console.log("Success! Contract was deployed to: ", nft_marketplace.address);
  await verifyContract(nft_marketplace,[weth.address],WAIT_BLOCK_CONFIRMATION)

  fs.appendFileSync('market_address.txt', nft_marketplace.address)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });