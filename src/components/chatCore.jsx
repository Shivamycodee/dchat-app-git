import React, { useState, useEffect, useRef } from "react";
import { Form, Button, Row, Col, Container } from "react-bootstrap";

import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import InputGroup from "react-bootstrap/InputGroup";
import Alert from "react-bootstrap/Alert";
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

import { createHelia } from "helia";
import { unixfs } from "@helia/unixfs";
import { MemoryBlockstore } from "blockstore-core";
import { MemoryDatastore } from "datastore-core";

export default function ChatCore() {

  const { account, getTimeData, getDateData, topStyle, isURL, handleCopy } =
    useGlobalContext();

  const inputRef = useRef(null);
  const topicRef = useRef(null);
  const selectedTopic = useRef(null);


  // user node...
  const [nodE, setNodE] = useState(null);
  // user peerId
  const [peerId, setPeerId] = useState();

  // peers to connect (only one)
  const [peers, setPeers] = useState();

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

  // for helia node.
  const [fs,setFs] = useState();

  

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
      alert(`let's go bitch.. 🚀`)
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
              // "/dnsaddr/bootstrap.libp2p.io/p2p/QmZa1sAxajnQjVM8WjWXoMbmPd7NsWhfKsPkErzpm9wGkp",
              // "/dnsaddr/bootstrap.libp2p.io/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa",
              // "/dnsaddr/bootstrap.libp2p.io/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt",
            ],
          }),
        ],
        dht: kadDHT(),
        pubsub: floodsub(),
        nat: {
          enabled:true
        },
        relay:{
          enabled:true
        }
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

      node.pubsub.subscribe(topic[0]);

      node.pubsub.addEventListener("message", (msg) => {
        let tempMsg = new TextDecoder().decode(msg.detail.data);
        setRecValue(tempMsg);
      });


      //creating helia node.
      const blockstore = new MemoryBlockstore();
      const datastore = new MemoryDatastore();

        const helia = await createHelia({
          node,
          blockstore,
          datastore

        });
 
        const fsTemp = unixfs(helia);
        setFs(fsTemp);
        
      

    } catch (e) {
      console.error("error in try : ", e);
    }
  };


  
  const connect = async () => {

      const addr = new Multiaddr(
        "/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star/p2p/" +
          peers
      );
      const connection = await nodE.dial(addr).catch((err) => console.warn("connecting to peer err: ", err));
    // console.warn("connected 👌",connection)
  };

  // connecting to peer
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

  const publishTopic = async () => {
    handleSendMessage();
    let _topic = selectedTopic.current.value;
    // console.log("comm topic : ", _topic);
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

   const addTopic = () => {
     let temp = topicRef.current.value;

     nodE.pubsub.unsubscribe(topic[topic.length - 1]); // unsubscribing from the before room...
     setTopic([...topic, temp]);
     setActiveTopic(temp);
     setMessages([]);

     nodE.pubsub.subscribe(temp); // subscribing to the new room...
     toast(`🏠 Room ${temp} Created`);
     topicRef.current.value = "";
   };


  const changeRoom = (item) => {

    setActiveTopic(item);
    toast(`🏠 Room changed to ${item}`);


    nodE.pubsub.subscribe(item); // subscribing to the new room...

    // handling data case when user choose to go back to a used room...

    // roomData.map((val) => {
    //   if (val.room === item) {
    //     setMessages(val.data);
    //   }
    // });

  };

  const saveChat = async()=>{

    const chatStr = localStorage.getItem(account+'room');
    if (chatStr && account) {
      
      const encoder = new TextEncoder();
      const bytes = encoder.encode(chatStr);

      // add the bytes to your node and receive a unique content identifier

      const _cid = await fs.addBytes(bytes);
      const cid = _cid.toString();
      console.log("cid is : "+cid);
      localStorage.setItem(account + "data", cid);
      
    } else {
      toast.error(`connect ur 👛 & 🫵 Data is empty.`);
    }
  }

 const getChat = async()=>{

  const cid = localStorage.getItem(account+'data');

  if(nodE && cid){

    const decoder = new TextDecoder();
    let text = "";
 const b = await fs.cat(
   "bafkreih5bdsgt6g6ohr7ma6ifbfar6fytbbjyvnyb5hlbytlnen5vtnhyy"
 );    
 console.log(b); 
     for await (let chunk of fs.cat(cid)) {
       text += decoder.decode(chunk, {
         stream: true,
       });
     }
 
    console.log(text)

    const chatObj = JSON.parse(text);
    console.log(chatObj);
    
    // chatObj.map((val) => {
    //   if (val.room === activeTopic) {
    //     setMessages(val.data);
    //   }
    // });

  }else toast.error(`nothing to show...`)

 }

  const handleShare = async()=>{
       try {
    await navigator.share(shareData);
  } catch (error) {
    console.error('Error sharing:', error.message);
  }
  
  }
  
  useEffect(() =>{           // TO handle nearby share functionality
        if(peerId)  setShareData({
          title: "peerId_",
          url: `${peerId}`,
        });     
      }, [topic,peerId]);


      // useEffect(() => {        // To print data paired with address
      //   if (localStorage.getItem(account)) {
      //     setMessages(JSON.parse(localStorage.getItem(account)));
      //   }
      // }, [account]);
     
      
      //useEffect to add the received message in message variables
      useEffect(() => {
        if (recValue) {
          handleReceiveMessage();
        }
      }, [recValue]);


  
      // this use effect is used to store data in room,data format. it will keep adding the new data coming in room
 
  useEffect(()=>{   
    
      localStorage.setItem(account, JSON.stringify(messages));
      //  console.log("🚀: "+localStorage.getItem(account + "room"));
      if (localStorage.getItem(account + "room")) {
             let flag = true;
        JSON.parse(localStorage.getItem(account + "room")).map((val, i) => {

          if (val.room === activeTopic) {
            flag = false;

          setRoomData((prevState)=>{
                const temp = [...prevState];
                if (!temp) return;    
                console.log(`temp is : ${temp}`)
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


  // This useEffect will initally store the room data in localStorage.
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
              onClick={() => (peerId ? handleCopy(peerId) : alert("start node"))}
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
            onClick={() => getChat()}
          >
            🍀 Get Your Chat From IPFS 🍀
          </button>
        </div>
      </div>
    </>
  );
}