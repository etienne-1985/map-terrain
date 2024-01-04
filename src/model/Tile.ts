import Quadtree, { Rect } from "@timohausmann/quadtree-js";
import { Vector2, Vector3 } from "three";
// import { Heightmap } from "../three-core-modules/Heightmap";
import { MapArea } from "./MapArea";
import { IgnGeoServiceProvider } from "../services/GeoServices";

// ex: lon=4.3/ lat:48

/**
 * Tile's object data structure to be consumed
 * by tile renderers or helper
 */
export class Tile implements Rect {
  size = 256;
  // tile's internal references in geo system
  col;
  row;
  zoom;
  origin; // tile's top/left origin in geosystem
  range;
  // tile's bounds in tree (Rect interface implem)
  x;
  y;
  width;
  height;
  // tile's own data
  imgData;
  imgUrl;
  imgRemoteUrl;
  imgLocalUrl;
  quadtree: Quadtree;
  heightmap;
  // update flag
  updated = false;

  constructor(node: Quadtree) {
    this.x = node.bounds.x;
    this.y = node.bounds.y;
    this.width = node.bounds.width;
    this.height = node.bounds.height;
    const { tileCol, tileRow } = this.getMapCoords(); //TileMap.getTileCoords(node);
    this.row = tileRow;
    this.col = tileCol;
    this.zoom = node.level;
    this.imgRemoteUrl = IgnGeoServiceProvider.getTileImgUrl(tileCol, tileRow, this.zoom);
    // console.log(`[Tile] new tile at row ${tileRow}, col ${tileCol}`)
    // this.origin = tileOrigin;
    // this.origin = { top: tileRow * tileRange, left: tileCol * tileRange };
    // this.heightmap = new Heightmap(this.size, this.size);
  }

  getCenter() {
    // return new TilePoint([this.x + this.width/2, this.y + this.height/2])
    return new Vector2(this.x + this.width / 2, this.y + this.height / 2);
  }

  getMapCoords() {
    const mapTileCenter = new Vector2().fromArray(MapArea.mapProj(this.getCenter().toArray()));
    const tileCol = Math.floor(mapTileCenter.x / this.width); // lon
    const tileRow = Math.floor(mapTileCenter.y / this.height); // lat
    return {
      tileCol,
      tileRow,
    };
  }

  print() {
    console.log(`Tile row: ${this.row}, col: ${this.col}`);
  }

  /**
   *
   * @param x
   * @param y
   */
  getHeightAt(x, y) {
    let range = (4 * Math.PI) / 256;
    let height = (1 + Math.cos(x * range + y * range)) / 2;
    return height;
  }

  /**
   *
   */
  genSplitPoints(indicesNb) {
    [...new Array(indicesNb + 1)].forEach((dum, row) => {
      [...new Array(indicesNb + 1)].forEach((dum, col) => {
        const offset = [
          (col / indicesNb) * this.range,
          (row / indicesNb) * this.range,
        ]; // lon/lat
        const localCoords = [
          this.origin.left + offset[0],
          this.origin.top - offset[1],
        ];

        // this.splitPoints.push(new GeoPoint(proj4.Proj()));
        console.log();
      });
    });
  }

  localProj(mapProj) {
    const leftOffset =
      (mapProj[0] - this.origin.left) * (this.size / this.range); // lon => x
    const topOffset = (mapProj[1] - this.origin.top) * (this.size / this.range); // lat => y
    return { leftOffset, topOffset };
  }

  revertLocalProj(tilePoint) {
    const wmtsLeft = tilePoint.x * (this.range / this.size) + this.origin.left;
    const wmtsTop = tilePoint.y * (this.range / this.size) + this.origin.top;
    return [wmtsLeft, wmtsTop];
  }

  setImg(imgData) {
    this.imgUrl = URL.createObjectURL(imgData);
  }

  // async fillPointsElevation() {
  //   for await (const elt of this.points.map(async (tilePoint: TilePoint) => {
  //     const elev = await IgnTileAdapter.requestElevation(tilePoint.geoCoords);
  //     tilePoint.setElevation(elev);
  //   }));
  // }
}