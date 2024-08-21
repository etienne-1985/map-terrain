import { Quadtree, Rectangle } from "@timohausmann/quadtree-ts";

export type TreePathElement = {
  index: number;
  node: Quadtree<Rectangle>;
}
/*
* Normal node layout
*   +-----+-----+
*   |  2  |  3  |
*   +-----+-----+
*   |  1  |  0  |
*   +-----+-----+
*
* Split layouts types:
*
*  2-nodes-split              4-nodes-split
*   +---------+         +-----------------------+
*   |         |         |           |           |
*   +---------+         +     +-----+-----+     |
*   |  1   0  |         |     |  0  |  1  |     |
*   +---------+         +-----+-----+-----+-----+
*   |  2   3  |         |     |  3  |  2  |     |
*   +---------+         +     +-----+-----+
*   |         |         |           |           |
*   +---------+         +-----------+-----+-----+
*/

const NODE_INDEX_SHIFTING = {
  splitType2: {
    0: 3,
    1: 2,
    2: 1,
    3: 0
  },
  splitType4: {
    0: 2,
    1: 3,
    2: 0,
    3: 1,
  }
}

export class QuadtreeUtils {

  static recursiveSplit(node, depth) {
    if (node.level < depth) {
      if (!node.nodes.length) node.split();
      let nodes = node.nodes.map(childNode => QuadtreeUtils.recursiveSplit(childNode, depth));
      return nodes.reduce((acc, val)=>acc.concat(val))
    } else return [node];
  }

  /**
   * Init tree structure by recursively splitting specific nodes 
   * until max depth level is reached in the tree hierarchy
   * @param node 
   * @param element 
   * @param maxDepth 
   */
  static splitTree(node, element, maxDepth) {
    if (node.level < maxDepth) {
      node.split();
      // tileMap = new TileMap(mapArea, node.level + 1, MapTree.quadtree.bounds.width);
      // MapTree.quadtree.insert(tileMap);
      // let elt = MapTree.getTileNode(node).getCenter();
      // console.log(elt)
      node.insert(element);
      //select child(ren) containing inserted element
      let childIndexes = node.getIndex(element);
      // split selected child if depth allows
      childIndexes.map(index => node.nodes[index])
        .forEach(childNode => QuadtreeUtils.splitTree(childNode, element, maxDepth));
    }
  }

  /**
   * Collect all nodes in the tree containing provided element
   * @param rootNode 
   * @param element 
   * @returns 
   */

  static collectAllNodes = (node: Quadtree<Rectangle>, element: Rectangle) => {
    // not a leaf? => pursue with children
    if (node.nodes.length) {
      const childIndexes = node.nodes.length ? node.getIndex(element) : [];
      // console.log(childIndexes);
      const matching = childIndexes.map(index => node.nodes[index]);
      const descendants = matching.map(childNode => QuadtreeUtils.collectAllNodes(childNode, element));
      return [node, ...descendants.flat()];// add itself to the list + all descendants
    } else {
      // console.log("leaf reached at level " + node.level);
      return [node]
    };
  }

  /**
   * Rebuild new tree by gathering scattered nodes from diverging branches

   * 

   * @param parentNode 
   */
  static rebuildTree = (parentNode, area, branchIndexes) => {
    console.log("make hybrid tree")
    const config = `splitType${branchIndexes.length}`;
    // console.log(`${branchIndexes.length} indexes for level ${parentNode.level} => gather branches in new tree:`);
    const mergeTree = new Quadtree(parentNode.bounds);
    mergeTree.level = parentNode.level + 1;
    // mergeTree.objects = parentNode.objects;
    mergeTree.split();
    // collect childs for each branch
    // let branches = QuadtreeUtils.collectAllNodes(parentNode, area).filter(subNode => subNode.level == (parentNode.level + 1));
    branchIndexes.forEach(branchIndex => {
      // console.log(`Branch #${branchIndex} indexes:`);
      const branchNode = parentNode.nodes[branchIndex];
      const subNodesIndexes = branchNode.getIndex(area);
      // console.log(subNodesIndexes);
      //re-parent nodes in new tree 
      // not forgetting to chage indexes depending on node layout configuration (2 or 4)
      const shiftIndex = NODE_INDEX_SHIFTING[config];
      subNodesIndexes.forEach(childIndex => mergeTree.nodes[shiftIndex[childIndex]] = branchNode.nodes[childIndex]);
      //adjust tree bounds
      const children: any = mergeTree.nodes;
      const bottomLeftChild: any = children[1];
      const bounds = {
        x: bottomLeftChild.bounds.x,
        y: bottomLeftChild.bounds.y,
        width: bottomLeftChild.bounds.width * 2,
        height: bottomLeftChild.bounds.height * 2
      };
      mergeTree.bounds = bounds;
    });
    return mergeTree;
  }



  /**
    * Path in subtree leading to the specified element
    * @param rootNode 
    * @param targetElt 
    * @returns node indices
    */
  static retrievePath = (rootNode: Quadtree, targetNode: Quadtree) => {
    // if (rootNode.retrieve(targetElt).length) {
    //   let nodesIndices: any = [];
    //   let nodeIndex;
    //   let currentNode = rootNode;

    //   // until we reach the deepest node (=leaf)
    //   while (currentNode.nodes.length) {
    //     // look for the index of the next child node containing the object
    //     nodeIndex = currentNode.nodes.findIndex((childNode, i) => childNode.retrieve(targetElt).length);
    //     nodesIndices.push(nodeIndex);
    //     // update current node
    //     currentNode = currentNode.nodes[nodeIndex];
    //   }

    //   // print found path
    //   console.log("Matching path found: " + nodesIndices.reduce((concat, nodeIndex) => concat + " => " + nodeIndex));
    //   return nodesIndices;
    // } else return null;
  }

  /**
   * Get node from path
   * @param path 
   */
  static followPath(rootNode, path) {
    let node = rootNode;
    path.forEach(index => {
      node = node.nodes[index];
    });
    return node;
  }

  static pathToString(treePath) {
    return treePath.slice(1).reduce((concat, elt) => concat + " => " + elt.index, "" + treePath[0].index)
  }

}