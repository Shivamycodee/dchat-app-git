import ImageFetch,{dogs,anime} from '../pages/api/imagesFetch'
import React, { useEffect, useState } from "react";
// import Image from 'next/image'

import { createHelia } from "helia";
import { unixfs } from "@helia/unixfs";

function ImageSetLoader({ category }) {
  const [url, setUrl] = useState([]);

  const [fs,setFs]  = useState();
  const [cid,setCid]  = useState();


    const createNode = async () => {
      const helia = await createHelia();
      const fsTemp = unixfs(helia);
      setFs(fsTemp);

      // we will use this TextEncoder to turn strings into Uint8Arrays
      const encoder = new TextEncoder();
      const data = [
        {
          room: "Default",
          data: [
            {
              text: "hi how it's going",
              timestamp: 1680951529431,
              sender: "user",
            },
            {
              text: "isn't it just crazy",
              timestamp: 1680951539160,
              sender: "user",
            },
            {
              text: "true i know 🙈",
              timestamp: 1680951549024,
              sender: "user",
            },
          ],
        },
        {
          room: "Default",
          data: [
            {
              text: "hi how it's going",
              timestamp: 1680951529431,
              sender: "user",
            },
            {
              text: "isn't it just crazy",
              timestamp: 1680951539160,
              sender: "user",
            },
            {
              text: "true i know 🙈",
              timestamp: 1680951549024,
              sender: "user",
            },
          ],
        },
      ];
      const bytes = encoder.encode(JSON.stringify(data));

      // add the bytes to your node and receive a unique content identifier
      const cidTemp = await fsTemp.addBytes(bytes);
      setCid(cidTemp);
      console.log("Added file:", cidTemp.toString());
    };


    const getData = async()=>{
      const decoder = new TextDecoder();
      let text = "";

      for await (const chunk of fs.cat(cid)) {
        text += decoder.decode(chunk, {
          stream: true,
        });
      }

      console.log( JSON.parse(text)[0].data);
      // alert(text)
    }


  useEffect(() => {
    async function getUrl() {
      const arr = [];
   

      for (let i = 0; i < 8; i++) {
        if(category === "dogs"){     
        const img = await dogs.get().then((res) => {return res.data.message});
        arr.push(img);

        }else if(category === "cats"){
            const img = await ImageFetch.get().then((res) => {
              return res.data.file;
            });
            arr.push(img);
        }else if(category === "anime"){
              const img = await anime.get().then((res)=>{
                return res.data.url;
              })
            arr.push(img);

        }
      }
      setUrl(arr);
    }
    getUrl();
  }, [category]);

  return (
    <div>
      <button onClick={createNode}>NODE</button>
      <button onClick={getData}>Data</button>
      {url.map((item,i) => {
        return (
          <a
            key={i}
            rel="noreferrer"
            target="_blank"
            href={item}
          >
            <img
              src={item ? item : null}
              className="img-caller rounded setImg"
              alt="Responsive image"
            />
          </a>
        );
      })}
    </div>
  );
}


export default ImageSetLoader