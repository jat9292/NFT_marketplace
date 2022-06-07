# NFT market place project

## Launching the Dapp 

In this project, we create a dapp marketplace for NFTs following the ERC721 standard.

Go to this website to test the Dapp deployed on the Rinkeby testnet : http://nftmarketplacejat.ml/ 

___

Alternatively, to rebuild this project from scratch you must first create a `.env` file in the project root defining 3 variables :

`ETHERSCAN_API` : an Etherscan API key, useful to verify on etherscan the smart contracts once deployed.

`PRIVATE_KEY` : an Ethereum private key, you should have some testnet ETH from Rinkeby on this address, to deploy the smart contracts and interact later with the dapp.

`RINKEBY_URL` : an URL to an RPC node for Rinkeby testnet (for eg from Infura node provider).

Then, in the project root, install the dependencies for the Smart contract development environment typing:
```console
npm install
```

Then deploy the smart contracts on Rinkeby testnet using:
```console
npx hardhat run --network rinkeby scripts/deploy.js
```

This command will deploy two NFT Collections (Super Mario World and Cute Dogs) and verify automatically their smart contracts on Etherscan. Also, the deployer will mint the first two items from each collection at the end of the deployment. Then, the marketplace contract will also be deployed and verified on Etherscan, as well as the Wrapped Ethereum contract.

Then go to the frontend directory install dependencies, build the NEXT.js project and launch locally the server: 
```console
cd frontend
npm install
npm run build
npm start
```

You can then start using the dapp by going to this URL via your Internet browser (make sure to configure your Metamask wallet on Rinkeby network): 
```console
http://localhost:3000/
```
___
___

## How to use the dapp


