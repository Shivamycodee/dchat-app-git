import React,{useEffect} from 'react'
import Link from 'next/link'
import { useGlobalContext } from 'context/connectWallet';


function Navbar() {

  const {wallet} = useGlobalContext();

  useEffect(()=>{
    wallet()
  },[])

  return (
    <nav style={{ padding: 10, background: "black" }}>
      <ul
        style={{ padding: 7 }}
        className="nav nav-pills "
        id="pills-tab"
        role="tablist"
      >
        <li style={{ marginLeft: 20 }} className="nav-item">
          <a
            className="nav-link active"
            id="pills-home-tab"
            data-toggle="pill"    
            href={"/"}
            role="tab"
            aria-controls="pills-home"
            aria-selected="true"
          >
            <code style={{ fontSize: 20, color: "white" }}>Home</code>
          </a>
        </li>
        <li className="nav-item">
          <a
            className="nav-link"
            id="pills-profile-tab"           
            data-toggle="pill"
            href="#pills-profile"
            role="tab"
            aria-controls="pills-profile"
            aria-selected="false"
          >
            <code style={{ fontSize: 20, color: "white" }}>downloads</code>
          </a>
        </li>
        <li className="nav-item">
          <a
            className="nav-link"
            id="pills-contact-tab"
            data-toggle="pill"
            href="#pills-contact"
            role="tab"
            aria-controls="pills-contact"
            aria-selected="false"
          >
            <code style={{ fontSize: 20, color: "white" }}>category</code>
          </a>
        </li>
        <li>
          <button className="btn btn-primary walletConnect" onClick={()=>wallet()}>
            <code style={{ fontSize: 20, color: "white" }}>connect wallet</code>
          </button>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar