import proj4 from "proj4";

/**
 * Conversion tools
 */
export class GeoProj {
  /**
   * Projects point in mercator
   * [lon/lat] => mercator projection [x,y]
   * @param lonlatCoords [lon/lat] (ex. [4.3, 48.2])
   * @returns [x,y]
   */
  static toMercator(lonlatCoords) {
    return proj4("EPSG:4326", "EPSG:3857", lonlatCoords);
  }

  /**
   * Revert projection
   * mercator proj => [lon,lat]
   * @param mercatCoords [x,y]
   * @returns [lon,lat]
   */
  static revertFromMercator(mercatCoords) {
    return proj4("EPSG:4326", "EPSG:3857").inverse(mercatCoords);
  }
}
