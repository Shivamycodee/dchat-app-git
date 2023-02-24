import React,{useState,useEffect} from 'react'
import Card from 'react-bootstrap/Card'
import Badge from 'react-bootstrap/Badge'


import libp2p,{ createLibp2p } from "libp2p";
import { webRTCStar } from "@libp2p/webrtc-star";
import {noise} from "@chainsafe/libp2p-noise"
import {mplex} from '@libp2p/mplex'
import { Multiaddr } from "multiaddr";
import { webSockets } from "@libp2p/websockets";
import { kadDHT } from "@libp2p/kad-dht";
import { floodsub } from "@libp2p/floodsub";
import { bootstrap } from "@libp2p/bootstrap";
import { peerIdFromString, PeerId } from "@libp2p/peer-id";


import { fromString as uint8ArrayFromString } from "uint8arrays/from-string";
import { toString as uint8ArrayToString } from "uint8arrays/to-string";


 function ChatCoreMain() {
 
  const [nodE,setNodE] = useState();
  const [nodB,setNodB] = useState();
  const [peers,setPeers] = useState()
  const [peerId,setPeerId] = useState();
  const [msg,setMsg] =  useState();
  
  const start = async()=>{
    
    try{

      const wrtcStar = webRTCStar();
     const node = await createLibp2p({
        addresses: {
          // Add the signaling server address, along with our PeerId to our multiaddrs list
          // libp2p will automatically attempt to dial to the signaling server so that it can
          // receive inbound connections from other peers
          listen: [
            "/dns4/localhost/tcp/9001/wss/p2p-webrtc-star",
            // "/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star",
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
        // we add the Pubsub module we want
        pubsub: floodsub(),
      });

      setNodE(node);


      const nodeB = await createLibp2p({
        addresses: {
          listen: [
            "/dns4/localhost/tcp/9000/wss/p2p-webrtc-star"
            // "/dns4/wrtc-star1.sjc.dwebops.pub/tcp/444/wss/p2p-webrtc-star",
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
            ],
          }),
        ],
        dht: kadDHT(),
        pubsub: floodsub(),
      });

      node.start();
      nodeB.start();

        

    const madd  = node.getMultiaddrs()
    const maddB  = nodeB.getMultiaddrs()
    alert(madd);
    alert(maddB);
    setNodB(maddB);
    setPeerId(madd.toString().slice(65, -1));


      // Listen for new peers
      node.addEventListener("peer:discovery", (evt) => {
        const peer = evt.detail;
        console.log(`Found peer ${peer.id.toString()}`)

        // console.warn("evt.detail.id :",typeof(evt.detail.id));
        // dial them when we discover them
        node.dial(evt.detail.id).catch((err) => {
          console.log(`Could not dial ${evt.detail.id}`, err);
        });
      });

      // Listen for new connections to peers
      node.connectionManager.addEventListener("peer:connect", (evt) => {
        const connection = evt.detail;
        console.log(`Connected to ${connection.remotePeer.toString()}`);
      });

      // Listen for peers disconnecting
      node.connectionManager.addEventListener("peer:disconnect", (evt) => {
        const connection = evt.detail;
        console.log(`Disconnected from ${connection.remotePeer.toString()}`)
      });

//     node.pubsub.subscribe("opposite of god");

// node.pubsub.addEventListener("message", (evt) => {
//   console.warn("message receiver runs")
//   setMsg(uint8ArrayToString(evt.detail.data));
//   console.warn(`data received: ${uint8ArrayToString(evt.detail.data)} on topic ${evt.detail.topic}`)
//   // store(
//   //   `<<-- ${uint8ArrayToString(evt.detail.data)} on topic ${evt.detail.topic}`
//   // );
// });

}catch(e){console.log("try error: ",e)}
  
} // end of start


  const listenMessage = async()=>{

    console.log("listen msg running")
   
     nodE.pubsub.subscribe("opposite of god");

     nodE.pubsub.addEventListener("message", (evt) => {

       console.log("message receiver runs");

       setMsg(uint8ArrayToString(evt.detail.data));
       console.log(
         `data received: ${uint8ArrayToString(evt.detail.data)} on topic ${
           evt.detail.topic
         }`
       );
       // store(
       //   `<<-- ${uint8ArrayToString(evt.detail.data)} on topic ${evt.detail.topic}`
       // );
     });


  }

    const find = async (aPeerId) => {
       //connect to peer
       const anId = peerIdFromString(aPeerId);
       const hasData = Boolean(nodE.peerStore.get(anId));

       alert(`has found peer: ${hasData}`);
     };

    const send = async (_msg) => {
      console.log("send running")
      nodE.pubsub.publish("opposite of god", uint8ArrayFromString(_msg))
         .catch((err) => {
           console.error("err of send :   ",err);
         })
         .then(() => {
           //  store("-->> " + msg);
         });
     };

    // const store = (m) => {
    //    const arr = state.log;
    //    if (arr.length > 50) arr.shift();
    //    arr.push(m);
    //    setState({ log: arr });
    //  };

    const connect = async()=>{
      
      alert(nodB)
      const connection = await nodE.dial(nodB);
      console.warn("done connect")
     console.warn("connecting to node : ",connection)
  // const stream = connection.newStream()
  // stream.write('Hello, world!')
  // stream.end()
  console.warn("it end")

    }

  const listenStream = async()=>{
      console.warn("listening stream")
     stream.on("data", (data) => {
       console.warn("Received:", data.toString());
     });
  }

    useEffect(()=>{

     console.log("useEffect for msg",msg)
    },[msg])

  
    return (
      <>
        <div className="peerHolder">
          <div>
            <h1>
              Your ID{" "}
              <Badge bg="secondary" as="Button">
                {peerId}
              </Badge>
            </h1>
          </div>
          <div className="input-group mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Friend Id"
              aria-label="Friend Id"
              aria-describedby="button-addon2"
              onChange={(e) =>
                setPeers(
                  `/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star/p2p/` +
                    e.target.value
                )
              }
            />
            <div className="input-group-append">
              <button
                className="btn btn-outline-secondary"
                type="button"
                id="button-addon2"
                // onClick={()=>find()}
                onClick={() => connect()}
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
            ></textarea>
          </div>

          <div className="input-group mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="message..."
              aria-label="message..."
              aria-describedby="button-addon2"
            />
            <div className="input-group-append">
              <button
                className="btn btn-outline-secondary"
                type="button"
                id="button-addon2"
                onClick={() => send("it's working on friday")}
              >
                send
              </button>
            </div>
            <button className="btn btn-secondary" onClick={() => start()}>
              start
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => listenMessage()}
              // onClick={() => listenStream()}
            >
              listen
            </button>
          </div>

        </div>
      </>
    );
}

export default ChatCoreMain;



