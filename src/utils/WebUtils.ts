export const fetchRemoteUrl = async (url: string) => {
    console.log("fetching " + url);
    const opt: RequestInit = { mode: "cors" };
    try {
      let response = await fetch(url, opt);
      let txt = await response.text();
      return txt;
    } catch (e) {
      console.log(e);
    }
  };
  
  export const fetchData = async (url: string) => {
    // console.log("fetching " + url);
    const opt: RequestInit = { mode: "cors" };
    try {
      let response = await fetch(url, opt);
      let data = await response.blob();
      return data;
    } catch (e) {
      console.log(e);
    }
  };
  
  export class WebSocketInterface {
    ws = new WebSocket(`ws://${window.location.hostname}/ws`);
  
    constructor() {
      // super();
      this.ws.onmessage = function (event) {
        console.log(event.data);
      };
  
      this.ws.onopen = (event) => {
        console.log("Connection opened");
      };
  
      this.ws.onclose = (event) => {
        console.log("Connection closed");
        // setTimeout(initWebSocket, 2000);
      };
    }
  
    sendData = async (data: any) => {
      const strData = JSON.stringify(data);
      try {
        this.ws.send(strData); //send data to the server
      } catch (error) {
        console.log(error); // catch error
      }
    };
  }
  