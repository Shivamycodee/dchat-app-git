import '@/styles/globals.css'
import Head from "next/head";
import Layout from '@/components/layout';
import "bootstrap/dist/css/bootstrap.min.css"
import "react-toastify/dist/ReactToastify.css";
import { SSRProvider } from "@react-aria/ssr";
import WalletContextProvider from 'context/connectWallet';



export default function App({ Component, pageProps }) {
  

  return (
     <SSRProvider>
      <WalletContextProvider>
      <Head>
        <title>aLLmE</title>
      </Head>
      <Layout>
        <Component {...pageProps} />
      </Layout>
      </WalletContextProvider>
     </SSRProvider>
  ); 
}


