import { Rect } from "@timohausmann/quadtree-js";
import { Vector2 } from "three";
import { IgnGeoServiceProvider } from "../services/GeoServices";
import { DataSample } from "./DataSources";

/** 
 * Manages map covered area from points
 */
export class MapArea implements Rect {
  // Bounds
  x = 0;
  y = 0;
  height = 0;
  width = 0;
  // 
  center = new Vector2(this.x, this.y);
  radius = 0;
  // stats
  minHeight;
  maxHeight;
  // points convex area
  convexAreaPoints = [];

  /**
   * no input => default center
   * single point => center as point
   * multiple point => center = barycenter
   * @param pointsArr 
   */
  constructor(pointsArr, isMercator = true) {
    if (!isMercator) {
      console.log("not implemented yet => TODO perform conversion to mercator");
      return;
    }
    pointsArr.forEach((pointElt) => this.addPoint(pointElt));
    console.log("[MapArea] New map area with center and radius");
  }


  /**
   * webm proj => map frame
   * return wmts or geosys coords
   * @param mercproj 
   * @param zoomLvl
   */
  static mapProj(mercproj) {
    // let proj = GeoConvHelper.toMercator(geoCoords);
    // let tilesArr = this.geoPoints.map((coord) => {
    // in WMTS, y axis is top to bottom
    return [
      mercproj[0] - IgnGeoServiceProvider.origin.left,
      IgnGeoServiceProvider.origin.top - mercproj[1],
    ];
  }

  /**
   *  map frame proj to webm proj
   */
  static revertMapProj(mapProj) {
    // revert to absolute mercator
    const mercatProj = [
      IgnGeoServiceProvider.origin.left + mapProj[0],
      IgnGeoServiceProvider.origin.top - mapProj[1], // TODO: check if correct
    ];
    // mercator to lon/lat system
    return mercatProj;
  }

  /**
   * add point to expand area
   * @param coords point coords in mercator
   */
  addPoint(coords) {
    // look for an existing tile or create one
    // const mapProj = MapArea.mapProj(coords);
    // const pointVect = new Vector2().fromArray(mapProj);
    const pointVect = new Vector2().fromArray(coords);
    this.convexAreaPoints.push(pointVect);
    this.extendArea(pointVect);
  }

  extendArea(point: Vector2) {
    this.x = point.x < this.x || !this.x ? point.x : this.x;
    this.y = point.y < this.y || !this.y ? point.y : this.y;
    const min = new Vector2(this.x, this.y);
    // const max = this.convexAreaPoints.reduce((max, val) => ({
    //   x: val.x > max.x ? val.x : max.x,
    //   y: val.y > max.y ? val.y : max.y
    // }))
    // this.width = max.x - min.x;
    // this.height = max.y - min.y;
    const height = (point.x - this.x);
    const width = (point.y - this.y);
    this.height = height > this.height ? height : this.height;
    this.width = width > this.width ? width : this.width;
    this.center = new Vector2(this.x + this.width / 2, this.y + this.height / 2);
  }

  /**
   * The center of the map e.g. barycenter of convex points
   * @returns 
   */
  barycenter() {
    console.log("map center: ")
    console.log(this.center)
    // update map center and radius accordingly
    const sum: Vector2 = this.convexAreaPoints
      .reduce((sum, elt) => sum.add(elt), new Vector2());
    let barycenter = sum.divideScalar(this.convexAreaPoints.length);
    const mapRadius = barycenter.clone().sub(this.convexAreaPoints[0]).length();
    console.log({ barycenter });
    this.radius = mapRadius;
    return barycenter;
  }

  contains(bounds: Rect) {
    const max = {
      x: this.x + this.width,
      y: this.y + this.height
    }

    const check = (pt: Vector2) => (pt.x > this.x && pt.x < max.x) && (pt.y > this.y && pt.y < max.y);

    // check at least 1 point belongs to the area
    let points = [new Vector2(bounds.x, bounds.y),
    new Vector2(bounds.x + bounds.width, bounds.y),
    new Vector2(bounds.x, bounds.y + bounds.height),
    new Vector2(bounds.x + bounds.width, bounds.y + bounds.height)];

    return points.find(pt => check(pt));;
  }

  findMinMax(samples) {
    // init with first elt
    this.minHeight = samples[0].elev;
    this.maxHeight = samples[0].elev;
    samples.forEach((dataSample: DataSample) => {
      this.minHeight = dataSample.dataPoint.y < this.minHeight ? dataSample.dataPoint.y : this.minHeight;
      this.maxHeight = dataSample.dataPoint.y > this.maxHeight ? dataSample.dataPoint.y : this.maxHeight;
    })
  }
}
