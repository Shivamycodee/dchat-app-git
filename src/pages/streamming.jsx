import React from 'react'
import AccessControl from '../components/accessControl'
import WebPlayer from '../components/webPlayer'
import {
  LivepeerConfig,
  createReactClient,
  studioProvider,
} from "@livepeer/react";

function Streamming() {

    const livepeerClient = createReactClient({
      provider: studioProvider({
        apiKey: "60a04979-a9da-46c7-b181-d5f6363c65d2",
      }),
    });

  return (
    <>
      <LivepeerConfig client={livepeerClient}>
        <WebPlayer/>
        <AccessControl/>
      </LivepeerConfig>
    </>
  );
}

export default Streamming;