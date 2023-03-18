import '@/styles/globals.css'
import Head from "next/head";
import Layout from '@/components/layout';
import "bootstrap/dist/css/bootstrap.min.css"
import "react-toastify/dist/ReactToastify.css";
import { SSRProvider } from "@react-aria/ssr";
import WalletContextProvider from 'context/connectWallet';
import KeyHandlerProvider from 'context/keyHandler'


export default function App({ Component, pageProps }) {
  

  return (
     <SSRProvider>
      <WalletContextProvider>
        <KeyHandlerProvider>
      <Head>
        <title>aLLmE</title>
      </Head>
      <Layout>
        <Component {...pageProps} />
      </Layout>
        </KeyHandlerProvider>
      </WalletContextProvider>
     </SSRProvider>
  ); 
}


