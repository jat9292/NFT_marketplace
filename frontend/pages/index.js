import styled from 'styled-components';
import { NFTCard } from '../components/NFTCard';
import { useState, useEffect } from "react"
import { NFTModal } from '../components/NFTModal';
import { ethers } from 'ethers';
import fs from "fs";
const axios = require('axios');
require('dotenv').config({path: '../.env'});


export default function Home({array_addresses_collections,rpc_url}) {
  
  const [showModal, setShowModal] = useState(false)
  const [selectedNft, setSelectedNft] = useState()
  const [nfts, setNfts] = useState([])

  useEffect( () => {
    (async () =>{
        getCollectionNfts(array_addresses_collections)
      }
    )()}, [])


  function toggleModal(i,k) {
    if (i >= 0) {
      setSelectedNft(nfts[k][i])
    }
    setShowModal(!showModal)
  }

  async function getMetadataFromIpfs(tokenURI) {
    let metadata = await axios.get(tokenURI)
    return metadata.data
  }

  async function getCollectionNfts(collection_addresses) {
    const rpc = rpc_url
    const ethersProvider = new ethers.providers.JsonRpcProvider(rpc)

    let abi = [
      "function symbol() public view returns(string memory)",
      "function tokenCount() public view returns(uint256)",
      "function tokenURI(uint256 tokenId) public view virtual override returns (string memory)",
      "function name() public view virtual override returns (string memory)"
    ]
    let collections = []
    for (const address of collection_addresses){
      
      let nftCollection = new ethers.Contract(
        address,
        abi,
        ethersProvider
      )
      
      let numberOfNfts = (await nftCollection.tokenCount()).toNumber()
      let collectionSymbol = await nftCollection.symbol()
      let name = await nftCollection.name()
      let tempArray = []


      for (let i = 1; i <= numberOfNfts; i++) {
          let tokenURI = await nftCollection.tokenURI(i)
          let metadata = await getMetadataFromIpfs(tokenURI)
          metadata.name = name
          metadata.symbol = collectionSymbol
          metadata.tokenid = i
          tempArray.push(metadata)
      }
      collections.push(tempArray)
    } 
    setNfts(collections)
    
  }
  let grids = []
  
  for(let k=0;k<=nfts.length;k++) {
    if (nfts[k]){
      grids.push(
        <>
        <div className="text-3xl font-bold p-2"> {nfts[k][0].name} </div>
        <Grid>
          {nfts[k].map((nft, i) =>
              <NFTCard nft={nft} key={2**i*3**k} toggleModal={() => toggleModal(i,k)} />
            )}
        </Grid>
        </>)}
        
  }
  return (
    <div>
      <Container>
      <div className="text-4xl font-bold p-3"> Explore the different supported NFT collections </div>
      {grids.length !== 0 ? grids : <p className="text-2xl font-bold p-3" >Loading collections...</p>}
      </Container>
      {
        showModal &&
        <NFTModal
          nft={selectedNft}
          toggleModal={() => toggleModal()}
        />
      }
    </div>
  )
}



export async function getStaticProps() {
  
  const data = fs.readFileSync('../supported_collections.txt','utf8');
  let array_addresses_collections = data.split("\n");
  let rpc_url =  process.env.RINKEBY_URL
  return {
    props: {array_addresses_collections,rpc_url}, // will be passed to the page component as props
  }
}




const Container = styled.div`
  width: 70%;
  max-width: 1200px;
  margin: auto;
  margin-top: 100px;
`
const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  row-gap: 40px;

  @media(max-width: 1200px) {
    grid-template-columns: 1fr 1fr 1fr;
  }
  @media(max-width: 900px) {
    grid-template-columns: 1fr 1fr;
  }
  @media(max-width: 600px) {
    grid-template-columns: 1fr;
  }
`
