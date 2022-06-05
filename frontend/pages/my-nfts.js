import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from 'web3modal'
import styled from 'styled-components';
import { NFTCardint } from '../components/NFTCard';
import fs from "fs";
import { useRouter } from 'next/router'

function MyNFTs({array_addresses_collections}) {
    const [nfts, setNfts] = useState([])
    const [currentAccount,setCurrentAccount]=useState([])
    const [loading,setLoading]=useState(true)
    const router = useRouter()

    useEffect( () => {
        (async () =>{
            getOwnedMetadata(array_addresses_collections)
        }
        )()}, [currentAccount])

    async function getMetadataFromIpfs(tokenURI) {
        let metadata = await axios.get(tokenURI)
        return metadata.data
    }
    let abi = [
        "function symbol() public view returns(string memory)",
        "function tokenCount() public view returns(uint256)",
        "function tokenURI(uint256 tokenId) public view virtual override returns (string memory)",
        "function name() public view virtual override returns (string memory)",
        "function mint() public returns (uint256)",
        "function balanceOf(address owner) public view virtual override returns (uint256)",
        "function ownerOf(uint256 tokenId) public view virtual override returns (address)"
      ]

    async function getOwnedMetadata(collection_addresses) {
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()
        const signer_address = await signer.getAddress()
        let tempArray = []
        for (const address of collection_addresses) {
            let nftCollection = new ethers.Contract(
                address,
                abi,
                signer
            )
            let numberOfNfts = (await nftCollection.tokenCount()).toNumber()
            let collectionSymbol = await nftCollection.symbol()
            let number_owned = await nftCollection.balanceOf(signer_address)
            if (number_owned>=1){
                for (let i=1;i<=numberOfNfts;i++){
                    let owner = await nftCollection.ownerOf(i)
                    let SignerisOwner =  (owner === signer_address)
                    if (SignerisOwner) {
                        let tokenURI = await nftCollection.tokenURI(i)
                        let metadata = await getMetadataFromIpfs(tokenURI)
                        metadata.name = await nftCollection.name()
                        metadata.symbol = collectionSymbol
                        metadata.size = numberOfNfts
                        metadata.address = address
                        metadata.tokenid = i
                        tempArray.push(metadata)
                    }
                }
            }
            }
        setNfts(tempArray)
        setLoading(false)
    }

    return (
        <Container>
        <h1 className="text-3xl font-bold p-5" >You own the following NFTs:</h1>
          {
          (loading===false) ? 
           (nfts.length!==0 ? 
            <Grid>
                {nfts.map((nft, i) => <NFTCardint nft={nft} key={i} toggleModal={() => router.push('trade/'+nft.address+'/'+nft.tokenid)}/>)}
            </Grid>:<p className="text-1xl font-bold p-5"> You do not own any NFT from any of the supported collections.</p>):
             <p className="text-1xl font-bold p-5"> Loading your personal collection...</p>
            }
        </Container>
    )
}

export default MyNFTs

export async function getStaticProps() {
  
  const data = fs.readFileSync('../supported_collections.txt','utf8');
  let array_addresses_collections = data.split("\n");
  return {
    props: {array_addresses_collections},
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

const NftPhoto = styled.div`
display: block;
width: 200px;
height: 200px;
background-position: center center;
background-size: cover;
border-radius: 10px;
margin: auto;
`