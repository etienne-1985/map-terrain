import { Tile } from "./Tile";
import { MapTree } from "./MapTree";
import { MapArea } from "./MapArea";
import { Vector2 } from "three";
import { IgnGeoServiceProvider } from "../services/GeoServices";
import { Quadtree, Rectangle } from "@timohausmann/quadtree-ts";

/**
 * Storing map tiles in datastruct
 */
export class TileMap {
  nodes = [];
  tiles = [];
  colIndexes = {};
  rowIndexes = {};

  tilesIndex = {}; // tiles' struct organized in ROWS:COLS
  outerBounds: Rectangle; // extended area bounds
  tileRange;

  /**
   * 
   * @param nodes a list of nodes in the tree representing the map at a specific zoom level
   */
  constructor(nodes) {
    let firstElt = nodes[0];
    console.log("[TileMap] new instance level " + firstElt.level);
    // process tilemap nodes to assign a tile to each one
    this.tiles = this.nodes.map((node: Quadtree) => new Tile(node));
    // this.processMapNodes();
    // this.x = bounds.x;
    // this.y = bounds.y;
    // this.width = bounds.width;
    // this.height = bounds.height;
    // const area: Rect = { x: 0, y: 0, width: 0, height: 0 };
    // mapArea.convexAreaPoints.forEach((pt) => this.addMapPoint(pt));
    // this.finalize();
  }

  static getTileCoordsFromNode(node: Quadtree<Rectangle>) {
    const middle = new Vector2(node.x + node.width / 2, node.y + node.height / 2);
    const mapTileCenter = new Vector2().fromArray(MapArea.mapProj(middle.toArray()));
    const col = Math.floor(mapTileCenter.x / node.width); //lon
    const row = Math.floor(mapTileCenter.x / node.height); // lat
    const zoom = node.level
    const tileCoords = { col, row, zoom }
    console.log(tileCoords)
    return tileCoords
  }

  static getTile(tileCoords) {
    let tile = TileMap.tiles[tileCoords.zoom]?.[tileCoords.row]?.[tileCoords.col]
    if(!tile){
      tile = IgnGeoServiceProvider.getTileImgUrl(tileCoords.col, tileCoords.row, tileCoords.zoom);
      const tilesRows = TileMap.tiles[tileCoords.zoom] || {}
      const tilesCols = tilesRows[tileCoords.row] || {}
      tilesCols = 
      if(!TileMap.tiles[tileCoords.zoom]) TileMap.tiles[tileCoords.zoom] = {}
      if(!TileMap.tiles[tileCoords.row]) TileMap.tiles[tileCoords.row] = {}
      if(!TileMap.tiles[tileCoords.row]) TileMap.tiles[tileCoords.row] = {}
    }
  }

  static getTileFromNode(node: Quadtree) {
    const tileCoords = TileMap.getTileCoordsFromNode(node)
    
  }

  /*********************DEPRECATED***********************/

  static getTileCoords(tile: Tile) {
    const tileRange = tile.width;
    const mapTileCenter = new Vector2().fromArray(MapArea.mapProj(tile.getCenter().toArray()));
    const tileCol = Math.floor(mapTileCenter.x / tileRange); // lon
    const tileRow = Math.floor(mapTileCenter.y / tileRange); // lat
    return {
      tileCol,
      tileRow,
    };
  }

  /**
   * Simple index looking function
   * */
  look({ tileRow, tileCol }) {
    return this.tilesIndex?.[tileRow]?.[tileCol];
  }

  /**
   * Find the matching tile which given point belongs to
   * returns ref to instance if exists or empty obj if not found
   * @param geoCoords
   */
  findTile(mapProj) {
    // convert point coords to tile coords
    // const tileCoords: any = this.getMapTileCoords(mapProj);
    // this.rowIndexes[tileCoords.tileRow] = {};
    // this.colIndexes[tileCoords.tileCol] = {};
    // // look if corresponding tile exists and returns it
    // // otherwise returns an empty object
    // let tile = this.look(tileCoords);
    // return tile ? tile : new Tile(1, 2, 3);
    return null;
  }

  /**
   * Register a new tile in the index
   * @param tileObj the new tile obj to register
   * @returns
   */
  register(tile) {
    const { row, col } = tile;
    if (!this.tilesIndex[row]) this.tilesIndex[row] = {};
    if (!this.tilesIndex[row][col]) this.tilesIndex[row][col] = tile;
    tile.registered = true;
    console.log(`new tile registered at row: ${row}, col: ${col}`);
    return tile;
  }

  getRows(zoom) {
    return Object.keys(this.tilesIndex).map(
      (rowKey) => this.tilesIndex[rowKey]
    );
  }

  getRowCols(zoom, rowKey) {
    return Object.keys(this.tilesIndex[rowKey]).map(
      (colKey) => this.tilesIndex[rowKey][colKey]
    );
  }

  /**
   * complete the map area with missing tiles to make it square
   */
  finalize() {
    console.log("[TileMap] finalization");
    let colIndices = Object.keys(this.colIndexes)
      .map((key) => parseInt(key))
      .sort((a, b) => a - b);
    colIndices.reduce((prev, next) => {
      let curr = prev;
      while (curr++ < next) this.colIndexes[curr] = {};
      return next;
    });
    // console.log(this.colIndexes);
    let rowIndices = Object.keys(this.rowIndexes)
      .map((rowKey) => parseInt(rowKey))
      .sort((a, b) => a - b);
    rowIndices.reduce((prev, next) => {
      let curr = prev;
      while (curr <= next) {
        let colTiles = { ...this.colIndexes };
        //   Object.keys(this.colIndexes).forEach(
        //     (colKey) =>
        //       (colTiles[colKey] = TilesManager.findOrPreCache({
        //         zoom: this.zoomLvl,
        //         row: curr,
        //         col: colKey,
        //       }))
        //   );
        this.rowIndexes[curr++] = colTiles;
      }
      return next;
    });
    // console.log(this.rowIndexes);
    // now final map characs are known, init quadtree
    const rowMin = rowIndices[0];
    const colMin = colIndices[0];
    const rowCount = Object.keys(this.rowIndexes).length;
    const colCount = Object.keys(this.colIndexes).length;

    this.x = MapTree.bounds.x + colMin * this.tileRange;
    this.y = MapTree.bounds.y + rowMin * this.tileRange;
    this.width = rowCount * this.tileRange;
    this.height = colCount * this.tileRange;

    // const mapOrig = { x: 0, y: 0 };
    this.outerBounds = {
      x: MapTree.bounds.x + colMin * this.tileRange,
      y: MapTree.bounds.y + rowMin * this.tileRange,
      width: rowCount * this.tileRange,
      height: colCount * this.tileRange,
    };
    // this.quadtree = new Quadtree(this.mapBounds, 15, 6);
    // console.log(this.quadtree);
    console.log("[TileMap] final bounds:");
    console.log(this.outerBounds);
  }

  /**
   * Dump tile's data: image
   * Retrieve points elevations
   *
   */
  async retrieveTiles() {
    // console.log(this.tilesIndex);
    // Rows
    for await (const dummy of Object.keys(this.rowIndexes).map(
      async (rowKey) => {
        // console.log("processing row: " + rowKey);
        let tileRow = this.rowIndexes[rowKey];

        // Tiles
        for await (const tileObj of Object.keys(tileRow).map(async (colKey) => {
          // console.log(`   col:${colKey}`);
          const tileCoords = {
            tileRow: parseInt(rowKey),
            tileCol: parseInt(colKey),
            tileRange: this.tileRange,
            // zoomLvl: this.zoomLvl,
          };
          let tile: Tile = this.look(tileCoords);
          // tile = tile ? tile : this.register(new Tile(0));
          this.rowIndexes[rowKey][colKey] = tile;
          let imgData = await IgnGeoServiceProvider.retrieveTileImg(tile);
          tile.setImg(imgData);
          this.tiles.push(tile);
          return tile.imgData;
          // this.tiles[rowKey][colKey]=tileImg;
        })) {
          // console.log(tileObj)
        }
      }
    ));
    console.log("Done Tile Dump");
  }

}
