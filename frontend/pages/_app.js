import '../styles/globals.css'
import Link from 'next/link'
import { useEffect, useState } from "react"
import { useRouter } from 'next/router'

const RINKEBY_CHAIN_ID = '0x4'

function MyApp({ Component, pageProps }) {
  const [connected, setConnected]= useState('not_connected')
  const router = useRouter()

  useEffect( () =>{
    
    checkIfWalletIsConnected(globalThis?.ethereum?ethereum:undefined);
  },[globalThis?.ethereum]);

  useEffect(() => {
    globalThis?.ethereum?.on("accountsChanged", () => router.reload());
    globalThis?.ethereum?.on("chainChanged", () => router.reload());
    return () => {
      globalThis?.ethereum?.removeListener("accountsChanged", () => router.reload());
      globalThis?.ethereum?.removeListener("chainChanged", () => router.reload());
    };
  });

  async function checkIfWalletIsConnected(we){

    if (we!==undefined){
      const chainId = await we.request({ method: 'eth_chainId' })
      if (chainId===RINKEBY_CHAIN_ID)
        setConnected('connected_to_correct_network')
      else {setConnected('connected_to_wrong_network')}
    }
    else {setConnected('not_connected')}
  }
  let output_dico = {}
  output_dico['connected_to_correct_network'] = <div>
    <nav className="border-b p-6">
      <p className="text-4xl font-bold">NFT Marketplace</p>
      <div className="flex mt-4">
        <Link href="/">
          <a className="mr-4 text-pink-500">
            Home
          </a>
        </Link>
        <Link href="/mint-nft">
          <a className="mr-6 text-pink-500">
            Mint NFT
          </a>
        </Link>
        <Link href="/my-nfts">
          <a className="mr-6 text-pink-500">
            My NFTs
          </a>
        </Link>
        <Link href="/market">
          <a className="mr-6 text-pink-500">
            Secondary Market
          </a>
        </Link>
      </div>
    </nav>
    <Component {...pageProps} />
  </div>

  output_dico['connected_to_wrong_network'] = <p className="text-2xl p-6">You are connected to the wrong network. Please connect your wallet to the Rinkeby Network...</p>

  output_dico['not_connected'] = <p className="text-2xl p-6">You are not connected to the blockchain. Please install and connect your wallet to the Rinkeby Network...</p>

  return output_dico[connected]
}

export default MyApp