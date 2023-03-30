import { useRef, useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  getDoc,
} from "firebase/firestore";

 const firebaseConfig = {
   apiKey: "AIzaSyA7THiYoQqddpl_NRTRizh3Xg9ox6hUcc8",
   authDomain: "nimo-7a52f.firebaseapp.com",
   databaseURL: "https://nimo-7a52f-default-rtdb.firebaseio.com",
   projectId: "nimo-7a52f",
   storageBucket: "nimo-7a52f.appspot.com",
   messagingSenderId: "932110078099",
   appId: "1:932110078099:web:ae67041d4bc27ee1b5fd66",
   measurementId: "G-NZ5M5N4HMP",
 };

function videoCallComponent() {

    
  const app = initializeApp(firebaseConfig);
  const firestore = getFirestore(app);

  const [isClient, setIsClient] = useState(false);
  const [pc, setPc] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const webcamVideo = useRef(null);
  const remoteVideo = useRef(null);
  const callInput = useRef(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const servers = {
      iceServers: [
        {
          urls: [
            "stun:stun1.l.google.com:19302",
            "stun:stun2.l.google.com:19302",
          ],
        },
      ],
      iceCandidatePoolSize: 10,
    };

    const pcInstance = new RTCPeerConnection(servers);
    setPc(pcInstance);
  }, [isClient]);



  // stream web cam starts...

   const startWebcam = async () => {
     const stream = await navigator.mediaDevices.getUserMedia({
       video: true,
       audio: true,
     });
     setLocalStream(stream);
     setRemoteStream(new MediaStream());

     if (!localStream || !remoteStream) {
       console.warn("Local or remote stream is not set.");
       return;
     }

     stream.getTracks().forEach((track) => {
       pc.addTrack(track, stream);
     });

     pc.ontrack = (event) => {
       event.streams[0].getTracks().forEach((track) => {
         remoteStream.addTrack(track);
       });
     };

     webcamVideo.current.srcObject = stream;
     remoteVideo.current.srcObject = remoteStream;
   };

   // stream web cam ends...


   // creating call starts...

     const createCall = async () => {
       const callsCollection = collection(firestore, "calls");
       const callDoc = doc(callsCollection);
       const offerCandidates = collection(callDoc, "offerCandidates");
       const answerCandidates = collection(callDoc, "answerCandidates");

       callInput.current.value = callDoc.id;

       pc.onicecandidate = (event) => {
         event.candidate && addDoc(offerCandidates, event.candidate.toJSON());
       };
       const offerDescription = await pc.createOffer();
       await pc.setLocalDescription(offerDescription);

       const offer = {
         sdp: offerDescription.sdp,
         type: offerDescription.type,
       };

       await setDoc(callDoc, { offer });

       onSnapshot(callDoc, (snapshot) => {
         const data = snapshot.data();
         if (!pc.currentRemoteDescription && data?.answer) {
           const answerDescription = new RTCSessionDescription(data.answer);
           pc.setRemoteDescription(answerDescription);
         }
       });

       onSnapshot(answerCandidates, (snapshot) => {
         snapshot.docChanges().forEach((change) => {
           if (change.type === "added") {
             const candidate = new RTCIceCandidate(change.doc.data());
             pc.addIceCandidate(candidate);
           }
         });
       });
     };

   // creating call ends...

   //  answer call starts...

   const answerCall = async () => {
     const callId = callInput.current.value;
     console.log(callId);
     const callDoc = doc(firestore, "calls", callId);
     const answerCandidates = collection(callDoc, "answerCandidates");
     const offerCandidates = collection(callDoc, "offerCandidates");

     pc.onicecandidate = (event) => {
       event.candidate && addDoc(answerCandidates, event.candidate.toJSON());
     };

     //  const callData = (await callDoc.get()).data();
     // const callData = (await get(callDoc)).data();
     const callData = (await getDoc(callDoc)).data();

     const offerDescription = callData.offer;
     await pc.setRemoteDescription(new RTCSessionDescription(offerDescription));

     const answerDescription = await pc.createAnswer();
     await pc.setLocalDescription(answerDescription);

     const answer = {
       type: answerDescription.type,
       sdp: answerDescription.sdp,
     };

     await updateDoc(callDoc, { answer });

     onSnapshot(offerCandidates, (snapshot) => {
       snapshot.docChanges().forEach((change) => {
         if (change.type === "added") {
           let data = change.doc.data();
           pc.addIceCandidate(new RTCIceCandidate(data));
         }
       });
     });
   };

   //  answer call ends...

  const hangUp = () => {
    pc.close();
    localStream.getTracks().forEach((track) => {
      track.stop();
    });
    setLocalStream(null);
    setRemoteStream(null);
    webcamVideo.current.srcObject = null;
    remoteVideo.current.srcObject = null;
  };



  return (
    <>
      <div>
        <h2>1. Start your Webcam</h2>
        <div className="videos">
          <span>
            <h3>Local Stream</h3>
            <video id="webcamVideo" ref={webcamVideo} autoPlay playsInline />
          </span>
          <span>
            <h3>Remote Stream</h3>
            <video id="remoteVideo" ref={remoteVideo} autoPlay playsInline />
          </span>
        </div>
        <button onClick={startWebcam}>Start webcam</button>
        <h2>2. Create a new Call</h2>
        <button onClick={createCall} disabled={!localStream}>
          Create Call (offer)
        </button>
        <h2>3. Join a Call</h2>
        <p>Answer the call from a different browser window or device</p>
        <input id="callInput" ref={callInput} />
        <button onClick={answerCall} disabled={!localStream}>
          Answer
        </button>
        <h2>4. Hangup</h2>
        <button onClick={hangUp} disabled={!localStream}>
          Hangup
        </button>
      </div>
    </>
  );
}

export default videoCallComponent;
