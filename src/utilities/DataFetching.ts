import axios from "axios";
import { showError } from "./ErrorMsg";

export const fetchData = async (url: string, transformData: any) => {
  try {
    let res = await axios.get(url);
    let data = res.data;
    transformData(data);
  } catch (err: any) {
    if (err.response) {
      // The client was given an error response (5xx, 4xx)
      showError(err.response.data);
      console.log(err.response.data);
      console.log(err.response.status);
      console.log(err.response.headers);
    } else if (err.request) {
      // The client never received a response, and the request was never left
      showError("The request was never left");
    } else {
      // Anything else
      showError("Something else happened");
    }
  }
};
