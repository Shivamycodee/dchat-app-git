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

    function isURL(str) {
      const pattern = new RegExp(
        "^(https?:\\/\\/)?" + // protocol
          "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
          "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
          "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
          "(\\?[;&a-z\\d%_.~+=-]*)?"  // query string
          // "(\\#[-a-z\\d_]*)?$",  
        // "i" 
      ); // fragment locator
      return pattern.test(str);
    }

  return (
    <connectWalletContext.Provider
      value={{ wallet, account, getTimeData, getDateData, topStyle, isURL }}
    >
      {children}
    </connectWalletContext.Provider>
  );
}

export const useGlobalContext = () => {
  return useContext(connectWalletContext);
};
