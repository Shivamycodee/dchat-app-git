import React, { useState, useEffect, useRef } from "react";
import { Form, Button, Row, Col, Container } from "react-bootstrap";

import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import InputGroup from "react-bootstrap/InputGroup";
import Alert from "react-bootstrap/Alert";
import Copy from "copy-to-clipboard";
import { ToastContainer, toast } from "react-toastify";


import { createLibp2p } from "libp2p";
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

export default function ChatCore() {

  const { account, getTimeData, getDateData, topStyle, isURL } =
    useGlobalContext();

  const inputRef = useRef(null);
  const topicRef = useRef(null);
  const selectedTopic = useRef(null);

  const [nodE, setNodE] = useState(null);
  const [peers, setPeers] = useState();
  const [peerId, setPeerId] = useState();
  const [topic, setTopic] = useState(["Default"]);
  const [activeTopic, setActiveTopic] = useState("Default");
  const [shareData, setShareData] = useState({
    title: "",
    url: "",
  });

  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [recValue,setRecValue] = useState("");

  const [roomData,setRoomData] = useState([]);

  

  const handleRoomData = ()=>{

    const rmdata = {
      room: activeTopic,
      data:messages
    }
    setRoomData([rmdata]);
  }

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleSendMessage = () => {
    // send message to server or update state directly
    const newMessage = {
      text: inputValue,
      timestamp: Date.now(),
      sender: "user",
    };
    setMessages([...messages, newMessage]);
    
    // setInputValue("");   // why this...
  };

  const handleReceiveMessage = () => {
    // received message to server or update state directly
    const newMessage = {
      text: recValue,
      timestamp: Date.now(),
      sender: "receive",
    };
    setMessages([...messages, newMessage]);
    // setInputValue(""); // why this...
  };

  const wrtcStar = webRTCStar();

  const start = async () => {
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
        let tempMsg = new TextDecoder().decode(msg.detail.data);
        setRecValue(tempMsg);
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

      const addr = node.getMultiaddrs();
      setPeerId(addr.toString().slice(65));

     node.pubsub.subscribe(topic[0]);

  }

  const connect = async () => {

      const addr = new Multiaddr(
        "/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star/p2p/" +
          peers
      );
      const connection = await nodE.dial(addr).catch((err) => console.warn("connecting to peer err: ", err));
    // console.warn("connected 👌",connection)
  };

  const connectPeer = async()=>{

    const anId = peerIdFromString(peers);
    const res = await nodE.peerStore
      .get(anId).then(()=>{
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
      })
      .catch(() => toast.info("🤕 peer not found try again..."));
  }

  const find = async () => {
    const anId = peerIdFromString(peers);
    const res = await nodE.peerStore.get(anId).catch(() => alert("false"));
    alert(Boolean(res));
  };

  const publishTopic = async () => {
    handleSendMessage();
    let _topic = selectedTopic.current.value;
    console.log("comm topic : ", _topic);
    nodE.pubsub.publish(_topic, new TextEncoder().encode(inputValue));
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

    roomData.map((val) => {
      if (val.room === item) {
        setMessages(val.data);
      }
    });
  };

  const addTopic = () => {
    let temp = topicRef.current.value;
    nodE.pubsub.unsubscribe(topic[topic.length - 1]);
    setTopic([...topic, temp]);
    setActiveTopic(temp);
    setMessages([]);
    nodE.pubsub.subscribe(temp);
    toast(`🏠 Room ${temp} Created`);
    topicRef.current.value = " ";

  };

  const handleCopy = ()=>{
     Copy(peerId);
     toast.success(`📋 Copied To Clipboard`);
  }


  const handleShare = async()=>{
       try {
    await navigator.share(shareData);
  } catch (error) {
    console.error('Error sharing:', error.message);
  }
  
  }

  const saveChat = async()=>{

  const cid = await helios.addJSON(roomData);
    console.info("your cid : ",cid.toString());
    localStorage.setItem(`${account}cid`,cid);


  }

  async function getObject() {
    const ipfs = await IPFS.create();
    const chunks = [];
    const cid = localStorage.getItem(`${account}cid`);
    for await (const chunk of ipfs.cat(cid)) {
      chunks.push(chunk);
    }
    const jsonStr = Buffer.concat(chunks).toString();
    console.info("ipfs data : ",jsonStr);
  }

   useEffect(() => {        // To print data paired with address
     if (localStorage.getItem(account)) {
       setMessages(JSON.parse(localStorage.getItem(account)));
     }
   }, [account]);

  useEffect(() =>{           // TO handle nearby share functionality
        if(peerId)  setShareData({
          title: "peerId_",
          url: `${peerId}`,
        });     
  }, [topic,peerId]);

  useEffect(() => {
    if (recValue) {
      handleReceiveMessage();
    }
  }, [recValue]);

 
  useEffect(()=>{
      localStorage.setItem(account, JSON.stringify(messages));

      if (localStorage.getItem(account + "room")) {
             let flag = true;
        JSON.parse(localStorage.getItem(account + "room")).map((val, i) => {

          if (val.room === activeTopic && val.room !== null) {
            flag = false;

              setRoomData((prevState)=>{
                const temp = [...prevState];
                temp[i].data = messages;
                return temp;
              })
            
          } 
        });

        if(flag){
           const rmdata = {
             room: activeTopic,
             data: messages,
           };
           setRoomData([...roomData, rmdata]);
        }

      } else {
        handleRoomData();
      }
     
  },[messages])


 useEffect(()=>{
  if(account){
    localStorage.setItem(account + "room", JSON.stringify(roomData));
  }
   
 },[roomData])


  return (
    <>
      <ToastContainer
        autoClose={600}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        theme="light"
        draggable
      />
      <div style={{ marginTop: 60 }}>
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
        <button
          style={{ marginLeft: "44%", width: 170 }}
          className="btn btn-outline-primary"
          onClick={() =>
            account ? start() : toast.info("connect your wallet")
          }
        >
          Start 🚀
        </button>
      </div>
      <div className="peerHolder">
        <div>
          <h1>
            Your ID
            <Alert
              onClick={() => (peerId ? handleCopy() : alert("start node"))}
              style={{ fontSize: 21, cursor: "pointer", overflow: "hidden" }}
              key="secondary"
              variant="secondary"
            >
              {peerId}
              <button
                style={{ marginLeft: 10 }}
                className="btn btn-secondary"
                onClick={() => handleShare()}
              >
                Share 🤝
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
              onClick={() => connectPeer()}
            >
              connect 🔗
            </button>
          </div>
        </div>

        {/* chat space */}

        <div className="input-group">
          <Container className="chat-box-container">
            <div className="container">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1 border-top"></div>
                <div className="px-3">{getDateData()}</div>
                <div className="flex-grow-1 border-top"></div>
              </div>
            </div>

            <Row className="message-container">
              <Col className="message-list">
                {messages
                  ? messages.map((message) => (
                      <div
                        key={message.timestamp}
                        className={`message ${
                          message.sender === "user" ? "sent" : "received"
                        }`}
                      >
                        <span className="message-text">
                          {isURL(message.text) ? (
                            <a
                              style={{ color: "white" }}
                              href={message.text}
                              rel="noreferrer"
                              target="_blank"
                              alt="lnk"
                            >
                              {message.text}
                            </a>
                          ) : (
                            message.text
                          )}
                          {/* {console.warn("is URL : ", isURL(message.text))} */}
                          <img
                            style={{
                              width: 15,
                              height: 15,
                              marginLeft: 3,
                              marginTop: 10,
                            }}
                            src="/images/double-tick.png"
                            alt="double tick"
                          ></img>
                        </span>

                        <div
                          style={{ fontSize: 13 }}
                          className="align-self-end small text-muted"
                        >
                          {getTimeData(message.timestamp)}
                        </div>
                      </div>
                    ))
                  : null}
              </Col>
            </Row>
          </Container>
        </div>

        {/* chat space end*/}

        <InputGroup className="mb-3">
          <Form.Control
            aria-label="Default"
            aria-describedby="inputGroup-sizing-default"
            placeholder="type a message..."
            ref={inputRef}
            onChange={(e) => handleInputChange(e)}
          />

          <button className="btn btn-secondary" onClick={() => publishTopic()}>
            SEND 🏹
          </button>
        </InputGroup>

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
            ADD ➕
          </button>
        </InputGroup>
        <div>
          <button
            className="btn btn-warning"
            style={{ width: "49.5%", height: 50, marginRight: 5 }}
            onClick={() => saveChat()}
          >
            🍀 Save Your Chat On IPFS 🍀
          </button>
          <button
            className="btn btn-dark"
            style={{ width: "49.5%", height: 50 }}
            onClick={() => getObject()}
          >
            🍀 Get Your Chat From IPFS 🍀
          </button>
        </div>
      </div>
    </>
  );
}