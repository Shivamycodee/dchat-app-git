import React,{useState,useEffect} from 'react'
import { Client, isSupported } from "@livepeer/webrtmp-sdk";
import { Player } from "@livepeer/react";
import { useKeyContext } from "context/keyHandler";



function webPlayer() {
  const client = new Client();

  const { streamKey, playbackId, name, streamStatus } =
    useKeyContext();

  const [playerKey,setPlayerKey] = useState(0)

useEffect(() => {

  async function start() {

    const StreamKey = streamKey ? streamKey : null;

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    const session = client.cast(stream, StreamKey);

    session.on("open", () => {
      console.log("Stream started.");
    });

    session.on("close", () => {
      console.log("Stream stopped.");
    });

    session.on("error", (err) => {
      console.log("Stream error.", err.message);
    });
  }

  if (isSupported) {
    if (playbackId && streamKey) {
      start();
    } else console.info("start streaming man");
  } else alert("your browser doesn't support webrtmp-sdk");

}, [streamKey, playbackId]);

  const reloadPlayer = ()=>{
  setPlayerKey((prevKey) => prevKey + 1);
  }

  return (
    <div style={{ width: "60%", height: "22%", marginTop: 40, marginLeft: 10 }}>
      <Player
        title={name}
        key={playerKey}
        playbackId={playbackId ? playbackId:null }
        showPipButton
        showTitle={true}
        poster={streamStatus ? "/images/stream.png" : "/images/cat.png"}
        aspectRatio="16to9"
        controls={{
          autohide: 4000,
        }}
        theme={{
          borderStyles: { containerBorderStyle: "hidden" },
          radii: { containerBorderRadius: "10px" },
        }}
      />
      {streamKey && playbackId ? (
        <button
          style={{ marginLeft: "44%", marginTop: "2%" }}
          onClick={() => reloadPlayer()}
          className="btn btn-outline-dark"
        >
          Reload
        </button>
      ) : null}
    </div>
  );
}

export default webPlayer