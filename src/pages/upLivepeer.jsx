import React from 'react'
import {
  LivepeerConfig,
  createReactClient,
  studioProvider,
} from "@livepeer/react";
import CreateAndViewAsset from '../components/createVIewAsset'



function UpLivepeer() {

  const livepeerClient = createReactClient({
    provider: studioProvider({
      apiKey: "60a04979-a9da-46c7-b181-d5f6363c65d2",
    }),
  });

  

  return (
    <>
      <LivepeerConfig client={livepeerClient}>
        <CreateAndViewAsset />
      </LivepeerConfig>
    </>
  );
}

export default UpLivepeer