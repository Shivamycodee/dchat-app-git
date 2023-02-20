import '@/styles/globals.css'
import Head from "next/head";
import Layout from '@/components/layout';
import "bootstrap/dist/css/bootstrap.min.css"


export default function App({ Component, pageProps }) {
  

  return (
    <>
      <Head>
        <title>aLLmE</title>
      </Head>
      <Layout>
        <Component {...pageProps} />
      </Layout>

    </>
  ); 
}


