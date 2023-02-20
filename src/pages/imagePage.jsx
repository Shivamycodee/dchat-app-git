import React,{useEffect,useState} from 'react'
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import "../styles/imagesPage.module.css"
import ImageSetLoader from '@/components/imageSetLoader'



function imagePage({data}) {

   console.log("server data : ",data)

  const [category,setCategory] = useState("cats");


  return (
    <div style={{ height: "600vh" }}>
      <DropdownButton
        style={{ display: "inline", marginTop: "60px", marginLeft: 40 }}
        id="dropdown-item-button"
        title="Cateogries"
      >
        <Dropdown.Item
          onClick={(e) => setCategory(e.target.value)}
          value="cats"
          as="button"
        >
          Cats
        </Dropdown.Item>
        <Dropdown.Item
          as="button"
          onClick={(e) => setCategory(e.target.value)}
          value="dogs"
        >
          Dog
        </Dropdown.Item>
        <Dropdown.Item
          as="button"
          onClick={(e) => setCategory(e.target.value)}
          value="anime"
        >
          Anime
        </Dropdown.Item>
      </DropdownButton>
      <input
        className="border border-primary"
        style={{
          marginTop: 60,
          marginLeft: 70,
          width: 150,
          height: 37,
          borderRadius: 7,
          textAlign: "center",
          fontSize: 17,
        }}
        value={category ? category : "cats"}
        disabled
      ></input>
      <div className="catg-holder">
        <ImageSetLoader category={category} />
      </div>
    </div>
  );
}

// export async function getServerSideProps() {
//   const res = await fetch("https://aws.random.cat/meow");
//   const data = await res.json();
//   return {
//     props: {
//       data,
//     },
//   };
// }

export default imagePage