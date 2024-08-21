import { MapTile } from "./MapTile";
import Quadtree, { Rectangle } from "@timohausmann/quadtree-ts";
// import { TILE_ZOOM_LVL } from "./apps/MapWidget";

/**
 * Map.quadtree
 *          |
 *        Tile.quadtree
 *                 |
 *                block
 */

export const recursiveSplit = (node, target, depth) => {
  console.log(`current depth: ${node.level}`)
  if (node.level <= depth && node.nodes.length === 0) {
    node.split()
    const matchingIndexes = node.getIndex(target)
    console.log(`next node indexes:`, matchingIndexes)
    const childNodes = matchingIndexes.map(index => node.nodes[index])
    childNodes.forEach(n => recursiveSplit(n, target, depth))
  }
}

export const populate = (node, target, depth) => {

}

export enum MapNodeType {
  TopLeft = 'topLeft',
  TopRight = 'topRight',
  BottomLeft = 'bottomLeft',
  BottomRight = 'bottomRight'
}

/**
 * Map partitionning in quadtree structure
 * automatic map levels, dynamic splitting, ..
 * Each non-empty node in the tree has an associated tile element 
 * THis represents the covered area at corresponding zoom level
 * MapTree takes a MapArea as input, and assign and instanciate TileMaps
 */
export class MapTree extends Quadtree<Rectangle> {
  mapTarget
  nodesDataLookup = {}
  // quadtreeRoot: Quadtree<Rectangle>

  constructor(config, mapTarget) {
    super(config);
    console.log(`[MapTree::constructor] `)
    this.mapTarget = mapTarget
    // this.quadtreeRoot = new Quadtree<Rectangle>(config)
  }

  static printPath(nodePath) {
    return 'root' + nodePath.reduce((acc, val) => `${acc} -> ${val}`, '')
  }

  getNodeFromPath(nodePath) {
    console.log(`[MapTree::getNodeFromPath] ${MapTree.printPath(nodePath)} `)
    const matchingNode = nodePath.reduce((node, index) => node.nodes[index], this)
    return matchingNode
  }

  getRecursivePath(currentNode, depth, nodeType: MapNodeType) {

    if (currentNode.level < depth && currentNode.nodes.length !== 0) {
      const matchingIndexes = currentNode.getIndex(this.mapTarget)
      console.log(matchingIndexes)
      const selectedIndex = matchingIndexes[0]
      const selectedNode = currentNode.nodes[selectedIndex]
      return [selectedIndex, ...this.getRecursivePath(selectedNode, depth, nodeType)]
    }
    return []
  }

  split() {
    if (!this.nodes.length) {
      super.split()
      this.nodes.forEach(child => {
        console.log(child)
      })
    } else {
      console.warn(`[MapTree] node can't be split more than one time`)
    }
  }

  splitRecursive(nodePath = [], depth) {
    // const pathStr = nodePath.reduce((acc, val) => `${acc} --> ${val}`, '')
    const currentNode = this.getNodeFromPath(nodePath);
    if (currentNode.level <= depth && currentNode.nodes.length === 0) {
      currentNode.split()
      const matchingIndexes = currentNode.getIndex(this.mapTarget)
      console.log(`next node indexes:`, matchingIndexes)
      const childPathes = matchingIndexes
        .map(index => [...nodePath, index])
        .forEach(path => this.splitRecursive(path, depth))
    }
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
      subtrees = childIndexes.map(nodeIndex => MapTree.getNodes(node.nodes[nodeIndex], level, area))
        .reduce((acc, val) => acc.concat(val))
      // node = node.nodes.find((child: Quadtree) => child.objects.length)
      // handle multiple branch case
      // node = childIndexes.length > 1 ? QuadtreeUtils.rebuildTree(node, area, childIndexes) : node.nodes[childIndexes[0]];
    } else { subtrees = [node] }
    return subtrees;
  }

  getCenter() {

  }

  get tile() {
    // this.tile = this.tile || new MapTile(this.bounds, zoom)
    const tile = new MapTile(this.bounds, zoom)
    return tile //this.tile
  }

  get root() {
    return MapTree.root
  }

  set root(val) {
    MapTree.root = val
  }

}
