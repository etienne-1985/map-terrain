// import { APIDataAdapter } from "../web-modules/APIDataAdapters";
import Quadtree from "@timohausmann/quadtree-js";
import { Rect } from "@timohausmann/quadtree-js";
import { fetchData, fetchRemoteUrl } from "../utils/WebUtils";

export class IgnGeoServiceProvider {
  static apiToken = "pratique";
  static resolution = 156543.033928041; // m/px at lower zoom
  // webm projection of geosys frame origin 
  static origin = {
    top: 20037508.3427892476320267,
    left: -20037508.3427892476320267,
  };

  static async callApi(reqURL: any, isDataBlob = false) {
    // console.log("Requesting: " + reqURL);
    const apiResp: any = isDataBlob
      ? await fetchData(reqURL)
      : fetchRemoteUrl(reqURL);
    return apiResp;
  }

  static getTileImgUrl(col, row, zoom) {
    let reqUrl = `http://wxs.ign.fr/${this.apiToken}/geoportail/wmts?SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetTile&STYLE=normal`;
    reqUrl += `&LAYER=ORTHOIMAGERY.ORTHOPHOTOS&EXCEPTIONS=text/xml&FORMAT=image/jpeg&TILEMATRIXSET=PM&TILEMATRIX=${zoom}&TILEROW=${row}&TILECOL=${col}`;
    return reqUrl;
  }

  // static async getTile(tileRow: any, tileCol: any, zoomLvl = 19) {
  static async retrieveTileImg(tileObj) {
    tileObj.imgRemoteUrl = tileObj.imgRemoteUrl ? tileObj.imgRemoteUrl : IgnGeoServiceProvider.getTileImgUrl(tileObj.col, tileObj.row, tileObj.zoom);
    let imgData = await IgnGeoServiceProvider.callApi(tileObj.imgRemoteUrl, true);
    return imgData;
  }

  static async requestElevation(geoPoint) {
    let req = `https://wxs.ign.fr/an7nvfzojv5wa96dsga5nk8w/alti/rest/elevation.xml?gp-access-lib=2.1.6`;
    req += `&lon=${geoPoint[0]}&lat=${geoPoint[1]}&indent=false&crs=%27CRS:84%27&zonly=true`;
    const res = await IgnGeoServiceProvider.callApi(req);
    const parser = new DOMParser();
    let xmlDoc = parser.parseFromString(res, "text/xml");
    try {
      let strVal = xmlDoc.getElementsByTagName("z")[0].innerHTML;
      return parseInt(strVal);
    } catch (error) {
      // console.log(error);
      // console.log(req);
      // console.log(xmlDoc);
      console.log("parsing error")
    }

  }

}

// interface GeoDataAdapter extends APIDataAdapter {
//   // async getElev(lat, lon) {}
// }

// class IgnDataAdapter implements GeoDataAdapter {
//   apiToken: string;
//   requestApi(reqURL: any) {
//     throw new Error("Method not implemented.");
//   }
//   buildRequest(obj: any): string {
//     throw new Error("Method not implemented.");
//   }
//   static apiToken = "pratique";

//   static async requestApi(reqURL) {
//     console.log("Requesting: " + reqURL);
//     const apiResp: any = await fetchRemoteUrl(reqURL);
//     console.log(apiResp);
//   }
// }

// export class IgnGeoData implements GeoDataAdapter {
//   apiToken: string;
//   requestApi(reqURL: any) {
//     throw new Error("Method not implemented.");
//   }
//   buildRequest(obj: any): string {
//     throw new Error("Method not implemented.");
//   }
//   async dumpArea(min, max, sampling) {
//     console.log("Dumping area from: ");
//     console.log(min);
//     console.log("to");
//     console.log(max);
//     let range = { lat: max.lat - min.lat, lon: max.lon - min.lon };
//     console.log(range);
//     let inc = { lat: range.lat / sampling, lon: range.lon / sampling };
//     console.log(inc);
//     for (var lat = min.lat; lat <= max.lat; lat += inc.lat) {
//       console.log("LAT: " + lat);
//       for (var lon = min.lon; lon <= max.lon; lon += inc.lon) {
//         // let elev = await this.getElev(lon, lat);
//         // console.log(elev);
//       }
//     }
//     let geopoint = await this.getElev(min.lon, min.lat);
//     console.log(geopoint);
//   }

//   async getElev(lon, lat) {
//     let url = `https://wxs.ign.fr/an7nvfzojv5wa96dsga5nk8w/alti/rest/elevation.xml?gp-access-lib=2.1.6&lon=${lon}&lat=${lat}&indent=false&crs=%27CRS:84%27&zonly=false`;
//     const remoteData: any = await fetchRemoteUrl(url);
//     let parser: any = new DOMParser();
//     let xmlDoc: any = parser.parseFromString(remoteData, "text/xml");
//     let geoPoint = {
//       lat: xmlDoc.getElementsByTagName("lat")[0].childNodes[0].nodeValue,
//       lon: xmlDoc.getElementsByTagName("lon")[0].childNodes[0].nodeValue,
//       elev: xmlDoc.getElementsByTagName("z")[0].childNodes[0].nodeValue,
//     };
//     return geoPoint;
//   }
// }
