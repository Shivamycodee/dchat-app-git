import React, { useState,useContext } from "react";
import { ethers } from "ethers";
import { ToastContainer, toast } from "react-toastify";


export const connectWalletContext = React.createContext();

export default  function walletContextProvider({children}) {

    const [account,setAccount] = useState()

    const wallet = async()=>{

        if(!account){
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            const signer =  provider.getSigner();
            signer.getAddress().then((res)=>setAccount(res))
        }else toast(account)

    }
  return (
    <connectWalletContext.Provider value={{ wallet, account }}>
      {children}
    </connectWalletContext.Provider>
  );
}

export const useGlobalContext = () => {
  return useContext(connectWalletContext);
};
