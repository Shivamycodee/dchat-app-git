import axios from "axios";

export default axios.create({
  baseURL: "https://aws.random.cat/meow",
});

export const dogs = axios.create({
  baseURL: "https://dog.ceo/api/breeds/image/random",
});

export const anime = axios.create({
  baseURL: "https://api.waifu.pics/sfw/kill",
});