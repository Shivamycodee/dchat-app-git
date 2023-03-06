import React, { useState, useEffect, useRef } from "react";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import InputGroup from "react-bootstrap/InputGroup";
import Form from "react-bootstrap/Form";
import Alert from "react-bootstrap/Alert";
import Copy from "copy-to-clipboard";
import { ToastContainer, toast } from "react-toastify";



import Libp2p,{ createLibp2p } from "libp2p";
import { webRTCStar } from "@libp2p/webrtc-star";
import { noise } from "@chainsafe/libp2p-noise";
import { mplex } from "@libp2p/mplex";
import { Multiaddr } from "multiaddr";
import { webSockets } from "@libp2p/websockets";
import { kadDHT } from "@libp2p/kad-dht";
import { bootstrap } from "@libp2p/bootstrap";

import { floodsub } from "@libp2p/floodsub";
// import { gossipsub } from "@chainsafe/libp2p-gossipsub";

import PeerID from "peer-id";
import { peerIdFromString } from "@libp2p/peer-id";

import {useGlobalContext} from '../../context/connectWallet'

const topStyle = {
  marginLeft: 10,
  height: 37,
  padding: 4,
  borderRadius: 9,
  textAlign: "center",
  fontSize: 14,
};

export default function ChatCore() {

  const { account } = useGlobalContext();

  const inputRef = useRef(null);
  const topicRef = useRef(null);
  const selectedTopic = useRef(null);

  const [nodE, setNodE] = useState(null);
  const [peers, setPeers] = useState();
  const [peerId, setPeerId] = useState();
  const [msg, setMsg] = useState();
  const [sendVal, setSendVal] = useState();
  const [topic, setTopic] = useState(["Default"]);
  const [activeTopic, setActiveTopic] = useState("Default");
  const [shareData, setShareData] = useState({
    title: "",
    url: "",
  });

  const wrtcStar = webRTCStar();

  const start = async () => {
    toast(account)
    try {
      const node = await createLibp2p({
        addresses: {
          listen: [
            "/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star",
            // "/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star",
          ],
        },
        transports: [webSockets(), wrtcStar.transport],
        connectionEncryption: [noise()],
        streamMuxers: [mplex()],
        peerDiscovery: [
          wrtcStar.discovery,
          bootstrap({
            list: [
              "/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN",
              "/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb",
              "/dnsaddr/bootstrap.libp2p.io/p2p/QmZa1sAxajnQjVM8WjWXoMbmPd7NsWhfKsPkErzpm9wGkp",
              "/dnsaddr/bootstrap.libp2p.io/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa",
              "/dnsaddr/bootstrap.libp2p.io/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt",
            ],
          }),
        ],
        dht: kadDHT(),
        pubsub: floodsub(),
      });

      await node.start();
      setNodE(node);
      localStorage.setItem(account,node.peerId);

  
      const addr = node.getMultiaddrs();
      setPeerId(addr.toString().slice(65));
      
      // Listen for new peers
      node.addEventListener("peer:discovery", (evt) => {
        const peer = evt.detail.id.toString();
      });

      // Listen for new connections to peers

      // node.connectionManager.addEventListener("peer:connect", (evt) => {
      //   const connection = evt.detail;
      //   console.log(`Connected to ${connection.remotePeer.toString()}`);
      // });

      // Listen for peers disconnecting
      node.connectionManager.addEventListener("peer:disconnect", (evt) => {
        const connection = evt.detail;
        console.log(`Disconnected from ${connection.remotePeer.toString()}`);
      });

      //  node.pubsub.subscribe(topic[0],(msg)=>{
      //   console.warn("subscribe mesg : ",msg)
      //  })
      node.pubsub.subscribe(topic[0]);

      node.pubsub.addEventListener("message", (msg) => {
        console.log(msg);
        console.warn("topic : ", msg.detail.topic);
        let tempMsg = new TextDecoder().decode(msg.detail.data);
        setMsg(tempMsg);
      });

    } catch (e) {
      console.error("error in try : ", e);
    }
  };

  const continueNode = async()=>{

    let tempId = localStorage.getItem(account);
    const peerId = PeerID.createFromB58String(tempId);

    let node = await createLibp2p({
      PeerId: peerId,
      addresses: {
        listen: [
          "/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star",
        ],
      },
        transports: [webSockets(), wrtcStar.transport],
        connectionEncryption: [noise()],
        streamMuxers: [mplex()],
        peerDiscovery: [wrtcStar.discovery],
        dht: kadDHT(),
        pubsub: floodsub(),
    });

   
     setNodE(node);
    console.warn("continue node : ",node)

      const addr = node.getMultiaddrs();
      setPeerId(addr.toString().slice(65));

     node.pubsub.subscribe(topic[0]);

     node.pubsub.addEventListener("message", (msg) => {
       console.log(msg);
       console.warn("topic : ", msg.detail.topic);
       let tempMsg = new TextDecoder().decode(msg.detail.data);
       setMsg(tempMsg);
     });

  }

  const connect = async () => {

      const addr = new Multiaddr(
        "/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star/p2p/" +
          peers
      );
      const connection = await nodE.dial(addr).catch((err) => console.warn("connecting to peer err: ", err));
    console.warn("connected 👌",connection)
  };

  const connectPeer = ()=>{
    toast.promise(connect, {
      pending: {
        render() {
          return "🕑 connecting... ";
        },
        position: "top-center",
      },
      success: {
        render() {
          return "👏 connected ";
        },
        error: "🤕 Try again  ",
      },
    });
  }

  const find = async () => {
    const anId = peerIdFromString(peers);
    const res = await nodE.peerStore.get(anId).catch(() => alert("false"));
    alert(Boolean(res));
  };

  const publishTopic = async () => {
    let _topic = selectedTopic.current.value;
    console.log("comm topic : ", _topic);
    nodE.pubsub.publish(_topic, new TextEncoder().encode(sendVal));
    inputRef.current.value = "";
  };

  const pingMsg = async () => {
    const addr = new Multiaddr(
      "/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star/p2p/" +
        peers
    );
    const result = await nodE
      .ping(addr)
      .then((res) => toast.info(`round trip time : ${res} milliseconds`))
      .catch((err) => toast.error("err at ping : ", err));
  };

  const changeRoom = (item) => {
    setActiveTopic(item);
    toast(`🏠 Room changed to ${item}`);
    nodE.pubsub.subscribe(item);
  };

  const addTopic = () => {
    let temp = topicRef.current.value;
    nodE.pubsub.unsubscribe(topic[topic.length - 1]);
    setTopic([...topic, temp]);
    setActiveTopic(temp);
    nodE.pubsub.subscribe(temp);
    toast(`🏠 Room ${temp} Created`);
    topicRef.current.value = " ";
  };

  const handleCopy = ()=>{
     Copy(peerId);
     toast.success(`📋 Copied To Clipboard`);
  }

  const handleStart = ()=>{
    if(account){
         if(localStorage.getItem(account) === null) start();
         else continueNode();
    }else toast.info("Please Connect Your Wallet")
  }

  const handleShare = async()=>{
       try {
    await navigator.share(shareData);
  } catch (error) {
    console.error('Error sharing:', error.message);
  }
  
  }

  useEffect(() =>{
        if(peerId)  setShareData({
          title: "peerId_",
          url: `${peerId}`,
        });
  }, [topic,peerId]);


  return (
    <>
      <ToastContainer
        autoClose={1200}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        theme="light"
        draggable
      />
      <div style={{ marginTop: 80 }}>
        <DropdownButton
          style={{ display: "inline", marginLeft: 50 }}
          id="dropdown-item-button"
          title="Rooms"
        >
          {topic.map((item, i) => {
            return (
              <Dropdown.Item
                key={i + 1}
                as="button"
                onClick={() => changeRoom(item)}
              >
                {item}
              </Dropdown.Item>
            );
          })}
        </DropdownButton>

        <input
          className="border border-primary"
          ref={selectedTopic}
          style={topStyle}
          value={activeTopic}
          disabled
        ></input>
      </div>
      <div className="peerHolder">
        <div>
          <h1>
            Your ID <br />
            <Alert
              onClick={() => (peerId ? handleCopy() : alert("start node"))}
              style={{ fontSize: 21, cursor: "pointer", overflow: "hidden" }}
              key="secondary"
              variant="secondary"
            >
              {console.log("peer id is : ", peerId)}
              {peerId}
              <button style={{marginLeft:10}} className="btn btn-secondary" onClick={()=>handleShare()}>
                Share
              </button>
            </Alert>
          </h1>
        </div>
        <div className="input-group mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Friend Id"
            aria-label="Friend Id"
            aria-describedby="button-addon2"
            onChange={(e) => setPeers(e.target.value)}
          />
          <div className="input-group-append">
            <button
              className="btn btn-outline-secondary"
              type="button"
              id="button-addon2"
              onClick={() => find()}
            >
              find
            </button>
            <button
              className="btn btn-outline-secondary"
              type="button"
              id="button-addon2"
              onClick={() => connectPeer()}
            >
              connect
            </button>
          </div>
        </div>
        <div className="input-group">
          <textarea
            className="form-control"
            placeholder="Chats..."
            aria-label="Chats"
            value={msg}
            readOnly
          />
        </div>
        <div className="input-group mb-3">
          <input
            type="text"
            id="chatInput"
            className="form-control"
            placeholder="message..."
            aria-label="message..."
            aria-describedby="button-addon2"
            ref={inputRef}
            onChange={(e) => setSendVal(e.target.value)}
          />
          <div className="input-group-append">
            <button
              className="btn btn-outline-secondary"
              type="button"
              id="button-addon2"
              onClick={() => publishTopic()}
            >
              publish
            </button>
          </div>
          <button className="btn btn-secondary" onClick={() =>start()}>
            start
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => [nodE.stop(), console.warn("stop : ", nodE)]}
          >
            stop
          </button>
        </div>
        <InputGroup className="mb-3">
          <InputGroup.Text id="inputGroup-sizing-default">
            Add Topic
          </InputGroup.Text>
          <Form.Control
            aria-label="Default"
            aria-describedby="inputGroup-sizing-default"
            ref={topicRef}
          />

          <button
            className="btn btn-secondary"
            onClick={() =>
              topic.indexOf(topicRef.current.value) === -1
                ? addTopic()
                : alert("already exist")
            }
          >
            ADD
          </button>
        </InputGroup>
      </div>
    </>
  );
}
