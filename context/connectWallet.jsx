import React, { useState,useContext } from "react";
import { ethers } from "ethers";
import { ToastContainer, toast } from "react-toastify";


export const connectWalletContext = React.createContext();

const topStyle = {
  marginLeft: 10,
  height: 37,
  padding: 4,
  borderRadius: 9,
  textAlign: "center",
  fontSize: 14,
};

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

    const getDateData = () => {
      const date = new Date();
      const [month, day, year] = [
        date.getMonth() + 1,
        date.getDate(),
        date.getFullYear(),
      ];

      return `${day}/${month}/${year}`;
    };

    const getTimeData = (epoc) => {
      const date = new Date(epoc);
      let hour = date.getHours();
      let min =
        date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
      return `${hour}:${min}`;
    };

  return (
    <connectWalletContext.Provider
      value={{ wallet, account, getTimeData, getDateData, topStyle }}
    >
      {children}
    </connectWalletContext.Provider>
  );
}

export const useGlobalContext = () => {
  return useContext(connectWalletContext);
};
