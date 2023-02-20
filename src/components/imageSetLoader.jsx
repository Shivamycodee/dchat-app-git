import ImageFetch,{dogs,anime} from '../pages/api/imagesFetch'
import React, { useEffect, useState } from "react";

function imageSetLoader({ category }) {
  const [url, setUrl] = useState([]);

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
      {url.map((item) => {
        return (
          <a target="_blank" href={item}>
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


export default imageSetLoader