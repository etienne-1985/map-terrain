import Quadtree, { Rect } from "@timohausmann/quadtree-js";
import { MapArea } from "./MapArea";
import { Tile } from "./Tile";
import { IgnGeoServiceProvider } from "../services/GeoServices";
import { QuadtreeUtils } from "../utils/QuadtreeUtils";
// import { TILE_ZOOM_LVL } from "./apps/MapWidget";

/**
 * Map.quadtree
 *          |
 *        Tile.quadtree
 *                 |
 *                block
 */

/**
 * Map tree partitionning in quadtree structure
 * automatic map levels, dynamic splitting, ..
 * Each non-empty node in the tree has an associated tile element 
 * THis represents the covered area at corresponding zoom level
 * MapTree takes a MapArea as input, and assign and instanciate TileMaps
 */
export class MapTree /*extends Quadtree*/ {
  static bounds: Rect = {
    x: IgnGeoServiceProvider.origin.left,
    y: -IgnGeoServiceProvider.origin.top,
    width: IgnGeoServiceProvider.resolution * 256,
    height: IgnGeoServiceProvider.resolution * 256,
  };
  // root node
  static quadtree = new Quadtree(
    MapTree.bounds,
    15,
    22 // zoom level count
  );

  static lut;

  /**
   * Init tree hierarchy and populate with nodes' data 
   * @param node current node (first call starts with root node)
   * @param mapArea the area of the map
   * @param depthLevel max split level
   */
  static populate(node: Quadtree, mapArea: MapArea, depthLevel: number) {
    // QuadtreeUtils.splitTree(MapTree.quadtree, mapArea, depthLevel);
    // assign a tile to the current node element
    // if (node.level < TILE_ZOOM_LVL) 
    //   node.insert(new Tile(node));
    if (node.level < depthLevel) {
      node.insert(new Tile(node));
      node.split();
      node.insert(mapArea);
      //select child(ren) containing inserted element
      let childIndexes = node.getIndex(mapArea);
      // split selected child if depth allows
      childIndexes.map(index => node.nodes[index])
        .forEach(childNode => MapTree.populate(childNode, mapArea, depthLevel));
    }
  }

  static update(node: Quadtree, mapArea: MapArea, depthLevel: number) {

  }

  /**
   * Retrieve map data at each level in the tree
   * @param node 
   */
  static async retrieveMapData(node) {
    // process each object of the node
    for await (const dummy of node.objects.map(async (obj) => {
      if (obj instanceof Tile) {
        let imgData = await IgnGeoServiceProvider.retrieveTileImg(obj);
        obj.setImg(imgData);
        // console.log(imgData);
      }
    }));

    // trigger data retrieval for children
    for await (const dummy of node.nodes.map(async (child) => {
      await MapTree.retrieveMapData(child);
    }));
  }

  /**
   * Focus tree on a specific area at specified zoom level
   * return a new tree
   * @param focusLevel 
   * @param focusedArea 
   */
  static getSubTree(level, area) {
    let node = MapTree.quadtree;
    while (node.level < level) {
      const childIndexes = node.getIndex(area);
      // node = node.nodes.find((child: Quadtree) => child.objects.length)
      // handle multiple branch case
      if (!node.nodes.length) node.split();
      node = childIndexes.length > 1 ? QuadtreeUtils.rebuildTree(node, area, childIndexes) : node.nodes[childIndexes[0]];
    }
    return node;
  }

  /**
   * Focus tree on a specific area at specified zoom level
   * return one or several subtrees depending on if area overlaps with one or several nodes
   * @param focusLevel 
   * @param focusedArea 
   */
   static getNodes(node, level, area) {
     let subtrees;
    if (node.level < level) {
      console.log("split tree")
      const childIndexes = node.getIndex(area);
      if (!node.nodes.length) node.split();
      subtrees = childIndexes.map(nodeIndex=>MapTree.getNodes(node.nodes[nodeIndex], level, area)) 
      .reduce((acc, val)=>acc.concat(val))
      // node = node.nodes.find((child: Quadtree) => child.objects.length)
      // handle multiple branch case
      // node = childIndexes.length > 1 ? QuadtreeUtils.rebuildTree(node, area, childIndexes) : node.nodes[childIndexes[0]];
    } else {subtrees=[node]}
    return subtrees;
  }

}
