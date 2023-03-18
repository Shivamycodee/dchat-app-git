import { useCreateStream, useStream } from "@livepeer/react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import copy from "copy-to-clipboard";
import { ToastContainer, toast } from "react-toastify";



import React,{ useMemo, useState, useEffect } from "react";
import { useKeyContext } from "context/keyHandler";


export default function AccessControl() {

  const { setStreamKey, setPlaybackId, name ,setName, setStreamStatus } =
    useKeyContext();
  const [url,setUrl] = useState()
  const [streamId,setStreamId] = useState()
  const [flag,setFlag]  = useState(false);
  const [streamName, setStreamName] = useState();

  const {
    mutate: createStream,
    data: createdStream,
    status,
  } = useCreateStream(
    streamName
      ? {
          name: streamName,
        }
      : null
  );

  useEffect(() => {
    if (createdStream) {
      localStorage.setItem("streamName", createdStream.name);
      setName(createdStream.name);
      setStreamId(createdStream.id);
      localStorage.setItem("streamKey", createdStream.streamKey);
      setStreamKey(createdStream.streamKey);
      localStorage.setItem("palybackId", createdStream.playbackId);
      setPlaybackId(createdStream.playbackId);
    }

    if (!createdStream && localStorage.getItem("streamKey")) {
      createStream?.();
      setFlag(true);
      setName(localStorage.getItem("streamName"));
      setStreamKey(localStorage.getItem("streamKey"));
      setPlaybackId(localStorage.getItem("palybackId"));
    }
  }, [createdStream]);

  const { data: stream } = useStream({
    streamId: createdStream?.id,
    refetchInterval: (stream) => (!stream?.isActive ? 4000 : false),
  });

  if(stream) setStreamStatus(stream.isActive)

  const isLoading = useMemo(() => status === "loading", [status]);

  const deleteStream = ()=>{
    localStorage.clear();
    window.location.reload();
  }

  // async function deleteStream() {
  //   const url = `https://livepeer.com/api/stream/${streamId}`;
    
  //   const response = await fetch(url, {
  //     method: "DELETE",
  //     headers: {
  //       "Content-Type": "application/json",
  //       Authorization: `Bearer 60a04979-a9da-46c7-b181-d5f6363c65d2`,
  //     },
  //   });


  //   if (response.ok) {
  //     console.log(`Stream with ID ${streamId} deleted successfully.`);
  //   } else {
  //     console.error(`Failed to delete stream with ID ${streamId}.`);
  //   }
  // }

  const handleCopy = ()=>{
    copy(
      `https://livepeercdn.studio/hls/${createdStream.playbackId}/index.m3u8`
    );
    toast(`Playback Link Copied 🙆‍♀️ ${createdStream.playbackId}`);
  }

  return (
    <>
      <ToastContainer
        autoClose={1000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        theme="light"
        draggable
      />
      <div
        style={{
          position: "fixed",
          padding: "6%",
          top: "30%",
          marginLeft: "63%",
          background: "#a0ff90",
          borderRadius: "10px",
          height: "40%",
        }}
      >
        <InputGroup className="mb-3">
          <Form.Control
            placeholder={name ? name:"Stream name"}
            aria-label="Stream name"
            aria-describedby="basic-addon2"
            onChange={(e) => setStreamName(e.target.value)}
          />
          <Button
            onClick={() => {
              createStream?.();
            }}
            variant="outline-secondary"
            id="button-addon2"
          >
            GO LIVE 🎥
          </Button>

          {createdStream || flag ? (
            <button
              onClick={() => handleCopy()}
              className="btn btn-outline-danger"
            >
              Share 📁
            </button>
          ) : null}
          {createdStream || flag ? (
            <button
              onClick={() => deleteStream()}
              className="btn btn-outline-danger"
            >
              Delete
            </button>
          ) : null}
        </InputGroup>

        <InputGroup className="mb-3">
          <Form.Control
            placeholder="Enter URL"
            aria-label="Enter URL"
            aria-describedby="basic-addon2"
            onChange={(e) => setUrl(e.target.value)}
          />
          <Button
            onClick={() => {
              let final = url.slice(31, 47);
              setPlaybackId(final);
            }}
            variant="outline-secondary"
            id="button-addon2"
          >
            Watch Stream
          </Button>
        </InputGroup>
        <i>🍀🍀🍀🍀🍀🍀🍀🍀🍀🍀🍀🍀🍀🍀🍀🍀🍀</i>
      </div>
    </>
  );
};


