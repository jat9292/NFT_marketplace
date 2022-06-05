import { useRouter } from 'next/router'
import styled from 'styled-components';
import { NFTCard } from '../../../components/NFTCard';
import { useState, useEffect } from "react"
import { ethers } from 'ethers';
const axios = require('axios');
import Web3Modal from 'web3modal'
import fs from "fs";
import { useForm } from "react-hook-form"

function Id({market_address,market_abi}) {
  const { register, handleSubmit, formState } = useForm()
  const {isSubmitting} = formState
  const router = useRouter()
  const [nft,setNft]=useState(undefined)
  const [global_provider,setProvider]=useState(undefined)
  const [connection_status, setConnection]= useState('connecting')
  const [listing_status, setListing]= useState('connecting')
  const [listing_price, setListingPrice] = useState('0')
  const [owner, setOwner] = useState('')
  const nft_address = router.query.address
  const nft_id = router.query.id
  let nft_abi =  [
    "function symbol() public view returns(string memory)",
    "function tokenCount() public view returns(uint256)",
    "function tokenURI(uint256 tokenId) public view virtual override returns (string memory)",
    "function name() public view virtual override returns (string memory)",
    "function ownerOf(uint256 tokenId) public view virtual override returns (address)",
    "function getApproved(uint256 tokenId) public view virtual override returns (address)",
    "function approve(address to, uint256 tokenId) public virtual override",
  ]

  useEffect( () => {
    (async () =>{
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        let temp_provider = new ethers.providers.Web3Provider(connection)
        setProvider(temp_provider)
        getNFTMetadata(temp_provider)
    }
    )()}, [])

  async function getNFTMetadata(provider){
    let metadata = {}

    const signer = provider.getSigner()
    const nftCollection = new ethers.Contract(nft_address, nft_abi, provider)
    let collectionSymbol = await nftCollection.symbol()
    let tokenURI = await nftCollection.tokenURI(nft_id) // taking first image of collection as global image representing the whole collection
    let metadatadl = await axios.get(tokenURI)
    metadata = metadatadl.data
    metadata.name = await nftCollection.name()
    metadata.symbol = collectionSymbol
    metadata.tokenid = nft_id
    metadata.address = nft_address
    setNft(metadata)
    let owner = await nftCollection.ownerOf(nft_id)
    setOwner(owner)
    let signer_address = await signer.getAddress()
    if (signer_address===owner){
      setConnection('seller')}
    else{setConnection('buyer')}
    const marketplace = new ethers.Contract(market_address[0], market_abi, provider)
    let nft_price = (await marketplace.getListing(nft_address,nft_id)).price.toString()
    console.log(nft_price)
    if (nft_price==='0' || nft_price===undefined){
        setListing('not_listed')
        }
    else {
        setListing('listed')
        setListingPrice(nft_price)
    }
  }

  async function listNFT(data) {
    let lprice = ethers.utils.parseEther(data.price)
    const market_contract = new ethers.Contract(market_address[0], market_abi, global_provider.getSigner())
    const nft_contract = new ethers.Contract(nft_address, nft_abi, global_provider.getSigner())
    let approved_address = await nft_contract.getApproved(nft_id)
    // if NFTMarketPlace contact is not approved, then ask the owner to submit a first transaction to approve the nft
    if (approved_address!==market_address[0]){
      let tx1 = await nft_contract.approve(market_address[0], nft_id)
      await tx1.wait()
    }
    const transaction = await market_contract.listItem(nft_address,nft_id,lprice)
    await transaction.wait()
    await getNFTMetadata(global_provider)
  }

  async function updateListingNFT(data) {
    let lprice = ethers.utils.parseEther(data.price)
    const market_contract = new ethers.Contract(market_address[0], market_abi, global_provider.getSigner())
    const nft_contract = new ethers.Contract(nft_address, nft_abi, global_provider.getSigner())
    let approved_address = await nft_contract.getApproved(nft_id)
    // if NFTMarketPlace contact is not approved, then ask the owner to submit a first transaction to approve the nft
    if (approved_address!==market_address[0]){
      let tx1 = await nft_contract.approve(market_address[0], nft_id)
      await tx1.wait()
    }
    const transaction = await market_contract.updateListing(nft_address,nft_id,lprice)
    await transaction.wait()
    await getNFTMetadata(global_provider)
  }

  async function cancelListing(){
    const market_contract = new ethers.Contract(market_address[0], market_abi, global_provider.getSigner())
    let tx2 = await market_contract.cancelListing(nft_address, nft_id)
    await tx2.wait()
    await getNFTMetadata(global_provider)
  }

  async function acceptSellerOffer(){
    const market_contract = new ethers.Contract(market_address[0], market_abi, global_provider.getSigner())
    let tx3 = await market_contract.buyItem(nft_address, nft_id,  {value: listing_price})
    await tx3.wait()
    await getNFTMetadata(global_provider)
  }

  let output_dico = {}

  output_dico["seller-not_listed"] = <>             
    <div className="text-center p-3">This NFT is owned by you</div>
    <div className="text-center p-3">This item is not listed at the moment</div>
    <div>
    <form className="text-center" onSubmit={handleSubmit(listNFT)}>
      <label className="p-3">
    Price (in ETH) : 
    </label>
      <input {...register("price", { required: true, pattern:"(?<=^| )\d+(\.\d+)?(?=$| )" })} 
      style={{ border: "1px solid black" }} />
      <p className="font-bold inline p-1">Ξ</p>
      <button type="submit" disabled={isSubmitting}  
      className="m-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full">
         {isSubmitting ? 
    <div className="w-5 h-5 border-b-2 border-white-400 rounded-full animate-spin"></div> : <span>List</span>}
        </button>
    </form>
    </div>
    </> 

  output_dico["buyer-not_listed"] = <>       
  <div className="text-center p-3">This NFT is owned by : <span className="text-sm">{owner}</span></div>
  <div className="text-center p-3">This item is not listed at the moment. Wait for the owner to list it.</div>
  </> 

  output_dico["seller-listed"] = <>             
  <div className="text-center p-3">This NFT is owned by you</div>
  <div className="text-center p-3">This item is now listed at : {ethers.utils.formatEther(listing_price)}<span className="font-bold inline p-1">Ξ</span></div>
  <div>
  <form className="text-center" onSubmit={handleSubmit(updateListingNFT)}>
    <label className="p-3">
  Update Listing Price (in ETH) : 
  </label>
    <input {...register("price", { required: true, pattern:"(?<=^| )\d+(\.\d+)?(?=$| )" })} 
    style={{ border: "1px solid black" }} />
    <p className="font-bold inline p-1">Ξ</p>
    <button type="submit" disabled={isSubmitting}  
    className="m-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full">
      {isSubmitting ? 
  <div className="w-5 h-5 border-b-2 border-white-400 rounded-full animate-spin"></div> : <span>Update</span>}
      </button>
  </form>
  </div>
  <div className="text-center">
  <button className="mt-4 bg-green-500 text-white font-bold py-2 px-12 rounded" onClick={() => cancelListing()}>Cancel Listing</button>
  </div>
  </> 

output_dico["buyer-listed"] = <>             
<div className="text-center p-3">This NFT is owned by : <span className="text-sm">{owner}</span></div>
<div className="text-center p-3">This item is now listed at : {ethers.utils.formatEther(listing_price)}<span className="font-bold inline p-1">Ξ</span></div>
<div className="text-center">
<button className="mt-4 bg-green-500 text-white font-bold py-2 px-12 rounded" onClick={() => acceptSellerOffer()}>Accept Owner&apos;s Offer & Buy</button>
</div>
</> 

  console.log(connection_status+"-"+listing_status)

  
  return  <Container>
          {(typeof(nft)!==undefined)?<NFTCard nft={nft} toggleModal={() => 0}/> : <p className="text-2xl font-bold p-5"> Loading...</p>}
              
          {output_dico[connection_status+"-"+listing_status]}
                

          </Container>
}

export default Id


export async function getServerSideProps() {
  const data = fs.readFileSync('../market_address.txt','utf8');
  let market_address = data.split("\n");
  let market_abi = require('../../../../artifacts/contracts/NFTMarketPlace.sol/NFTMarketPlace.json').abi
  return {
    props: {market_address,market_abi}, // will be passed to the page component as props
  };
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