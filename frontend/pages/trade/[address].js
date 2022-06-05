import styled from 'styled-components';
import { NFTCardint } from '../../components/NFTCard';
import { useState, useEffect } from "react"
import { ethers } from 'ethers';
const axios = require('axios');
import { useRouter } from 'next/router'
require('dotenv').config({path: '../.env'});



export default function Collection({rpc_url}) {
  
  const [nfts, setNfts] = useState([])
  const router = useRouter()

  useEffect( () => {
    (async () =>{
        getCollection(router.query.address)
      }
    )()}, [])

  async function getMetadataFromIpfs(tokenURI) {
    let metadata = await axios.get(tokenURI)
    return metadata.data
  }

  async function getCollection(collection_address) {
    const rpc = rpc_url
    const ethersProvider = new ethers.providers.JsonRpcProvider(rpc)

    let abi = [
      "function symbol() public view returns(string memory)",
      "function tokenCount() public view returns(uint256)",
      "function tokenURI(uint256 tokenId) public view virtual override returns (string memory)",
      "function name() public view virtual override returns (string memory)"
    ]
      
    let nftCollection = new ethers.Contract(
    collection_address,
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
    console.log(tempArray)
    setNfts(tempArray)
    
  }

let loading_p = <p className="text-1xl font-bold p-5"> Loading the collection...</p>
let grid  = <>
            {(nfts.length!==0) ? (<Grid>{nfts.map((nft, i) =>
                <NFTCardint nft={nft} key={i} toggleModal={() => router.push(router.query.address+'/'+nft.tokenid)}/> 
                )} </Grid>): loading_p}
            </>
  


  return (
    <div>
      <Container>
      <div className="text-4xl font-bold p-3"> Buy or Sell an item from the NFT collection </div>
      {grid}
      </Container>
    </div>
  )
}



export async function getStaticProps() {
  
  let rpc_url =  process.env.RINKEBY_URL
  return {
    props: {rpc_url}, // will be passed to the page component as props
  }
}

export async function getStaticPaths(){

    return {
        paths: [], //indicates that no page needs be created at build time
        fallback: 'blocking'
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
