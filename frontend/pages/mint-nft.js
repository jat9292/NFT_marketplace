import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from 'web3modal'
import styled from 'styled-components';

import fs from "fs";
require('dotenv').config({path: '../.env'});

function MintNFT({array_addresses_collections,rpc_url}) {
    const [nfts, setNfts] = useState([])

    useEffect( () => {
        (async () =>{
            getSupportedCollectionsMetadata(array_addresses_collections)
        }
        )()}, [])

    async function getMetadataFromIpfs(tokenURI) {
        let metadata = await axios.get(tokenURI)
        return metadata.data
    }
    let abi = [
        "function symbol() public view returns(string memory)",
        "function tokenCount() public view returns(uint256)",
        "function tokenURI(uint256 tokenId) public view virtual override returns (string memory)",
        "function name() public view virtual override returns (string memory)",
        "function mint() public returns (uint256)"
      ]

    async function getSupportedCollectionsMetadata(collection_addresses) {
        const rpc = rpc_url
        const ethersProvider = new ethers.providers.JsonRpcProvider(rpc)
        let tempArray = []
        for (const address of collection_addresses) {
            let nftCollection = new ethers.Contract(
                address,
                abi,
                ethersProvider
            )
            let numberOfNfts = (await nftCollection.tokenCount()).toNumber()
            let collectionSymbol = await nftCollection.symbol()
            let tokenURI = await nftCollection.tokenURI(1) // taking first image of collection as global image representing the whole collection
            let metadata = await getMetadataFromIpfs(tokenURI)
            metadata.name = await nftCollection.name()
            metadata.symbol = collectionSymbol
            metadata.size = numberOfNfts
            metadata.address = address
            tempArray.push(metadata)
            }
        setNfts(tempArray)
    }

    async function mintNft(nft) {
        /* needs the user to sign the transaction, so will use Web3Provider and sign it */
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(nft.address, abi, signer)
    
        /* user will be prompted to pay the gas fee for minting to complete the transaction */
        const transaction = await contract.mint()
        await transaction.wait()
        await getSupportedCollectionsMetadata(array_addresses_collections)
      }

    return (
        <div>
        <Container>
        <Title className="text-3xl font-bold p-4"> Mints are free (you must only pay the gas fee)...</Title>
        <Title className="text-2xl font-bold p-4"> Choose a collection to mint from : </Title>
            <Grid>
            { nfts.length!==0 ?
                (nfts.map((nft, i) =>
                <>
                <Title> {nft.name}
                <NftPhoto key={i} style={{ backgroundImage: `url(${nft && nft.image})` }}/>
                <p>Collection size : {nft.size}</p>
                <button className="mt-4 bg-pink-500 text-white font-bold py-2 px-12 rounded" onClick={() => mintNft(nft)}>Mint</button>
                </Title>
                </> ) ): <p className="text-2xl font-bold p-5"> Loading mints...</p>
                
            }
            </Grid>
        </Container>

        </div>
    )
}

export default MintNFT

export async function getStaticProps() {
  
  const data = fs.readFileSync('../supported_collections.txt','utf8');
  let array_addresses_collections = data.split("\n");
  let rpc_url =  process.env.RINKEBY_URL
  return {
    props: {array_addresses_collections,rpc_url}, // will be passed to the page component as props
  }
}


const Title = styled.h1`
  margin: 0;
  text-align: center;
`
const Container = styled.div`
  width: 70%;
  max-width: 1200px;
  margin: auto;
  margin-top: 100px;
`
const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  row-gap: 40px;

  @media(max-width: 600px) {
    grid-template-columns: 1fr;
  }
`
const NftPhoto = styled.div`
display: block;
width: 200px;
height: 200px;
background-position: center center;
background-size: cover;
border-radius: 10px;
margin: auto;
`