import { Vector2 } from "three";
import { Rectangle } from "@timohausmann/quadtree-ts";
import { MapArea } from "./MapArea";
import { IgnGeoServiceProvider } from "../services/GeoServices";

export class MapTile extends Rectangle {
    zoom
    imgLocalUrl
    constructor(props, zoom) {
        super(props);
        this.zoom = zoom;
    }

    async fetchData(){
        const imgRemoteUrl = IgnGeoServiceProvider.getTileImgUrl(this.col, this.row, this.zoom);
        let imgData = await IgnGeoServiceProvider.callApi(imgRemoteUrl, true);
        this.img = imgData;
    }

    get center() {
        const middle = new Vector2(this.x + this.width / 2, this.y + this.height / 2);
        const mapTileCenter = new Vector2().fromArray(MapArea.mapProj(middle.toArray()));
        return mapTileCenter
    }

    get col() {
        const lon = Math.floor(this.center.x / this.width);
        return lon
    }

    get row() {
        const lat = Math.floor(this.center.y / this.height);
        return lat
    }

    get img() {
        // const imgRemoteUrl = IgnGeoServiceProvider.getTileImgUrl(this.col, this.row, this.zoom);
        return this.imgLocalUrl
    }

    set img(imgData){
        this.imgLocalUrl = URL.createObjectURL(imgData);
    }
}