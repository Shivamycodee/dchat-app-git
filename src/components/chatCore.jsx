import React, { useState, useEffect } from "react";
import Badge from "react-bootstrap/Badge";

import libp2p, { createLibp2p } from "libp2p";
import { webRTCStar } from "@libp2p/webrtc-star";
import { noise } from "@chainsafe/libp2p-noise";
import { mplex } from "@libp2p/mplex";
import { Multiaddr } from "multiaddr";
import { webSockets } from "@libp2p/websockets";
import { kadDHT } from "@libp2p/kad-dht";
import { floodsub } from "@libp2p/floodsub";
import { bootstrap } from "@libp2p/bootstrap";
import { peerIdFromString, PeerId } from "@libp2p/peer-id";

import { fromString as uint8ArrayFromString } from "uint8arrays/from-string";
import { toString as uint8ArrayToString } from "uint8arrays/to-string";


export default function chatCore() {

    const [nodE,setNodE] = useState();
    const [peers,setPeers] = useState();
    const [peerId,setPeerId] = useState();


  const start = async()=>{
  
      try{
        const wrtcStar = webRTCStar();
        const node = await createLibp2p({
          addresses: {
            // Add the signaling server address, along with our PeerId to our multiaddrs list
            // libp2p will automatically attempt to dial to the signaling server so that it can
            // receive inbound connections from other peers
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
          // we add the Pubsub module we want
          pubsub: floodsub(),
        });

        node.start();
        setNodE(node);

        const addr = node.getMultiaddrs();
        setPeerId(addr.toString().slice(65, -1));
        alert(addr);


        // Listen for new peers
        node.addEventListener("peer:discovery", (evt) => {
          const peer = evt.detail;
          console.log(`Found peer ${peer.id.toString()}`);


          // dial them when we discover them
          console.warn("evt.detail.id : ", evt.detail.id);
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
          console.log(`Disconnected from ${connection.remotePeer.toString()}`);
        });
      }catch(e){console.log("error in try : ",e)}

  }


  const connect = async()=>{

     alert(peers);
     const connection = await nodE.dial(peers);
     console.warn("connecting to node : ", connection);
     const stream = connection.newStream();
     stream.write("Hello, world!");
     stream.end();


  }


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
            onChange={
              (e) =>
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
            value="{msg}"
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

