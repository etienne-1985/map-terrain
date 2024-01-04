import React from "react";
import Quadtree from "@timohausmann/quadtree-js";
import { Tile } from "./model/Tile";

/**
 * Map tree display for a specific zoom and area
 * @param param0 
 * @returns 
 */
export default ({ mapTree }: { mapTree: Quadtree }) => {
    console.log(`[MapTree]`)
    // check if tree was reparented
    let tile: any = mapTree.objects.find(obj => obj instanceof Tile);
    const subTiles = mapTree.nodes
        .map(node =>
            node.objects.find(obj => obj instanceof Tile)
        )
        .filter(elt => elt);

    let isReparented = !tile;
    // console.log(subTiles);
    console.log({ isReparented })
    return (<>
        <MapNodeVis currentNode={mapTree} rootNode={mapTree} />
        {/* <TileDisplay key={"colKey"} tile={tileObj} style={}/> */}
        {isReparented ? <TileMap tiles={subTiles} /> :
            <img src={tile.imgUrl} style={{ width: "100%", height: "100%" }} />}
    </>)
};

const MapNodeVis = ({ currentNode, rootNode }: { currentNode: Quadtree, rootNode: Quadtree }) => {
    // const [selected, setSelected] = useState(false);
    // console.log(currentNode.bounds);
    const bounds = currentNode.bounds;
    const width = (bounds.width / rootNode.bounds.width) * 100 + "%"
    const height = (bounds.height / rootNode.bounds.height) * 100 + "%";
    const left = ((bounds.x - rootNode.bounds.x) / rootNode.bounds.width) * 100 + "%";
    const top = ((bounds.y - rootNode.bounds.y) / rootNode.bounds.height) * 100 + "%";  // TODO: check if not bottom instead of top

    const dataSample = currentNode.objects[0];
    let bgCol = "#ff000000";    // bydefault transparent = no background
    let color = "black";
    // const color = currentNode.level > (TILE_ZOOM_LVL + 1) ? "#00000064" : "black";
    let borderStyle = "1px solid " + color;
    // borderStyle = selected || currentNode.level < (TILE_ZOOM_LVL + 3) ? "1px solid " + color : "";
    // let elev;
    // if (dataSample instanceof DataSample) {
    //     elev = dataSample.elev;
    //     let col = elev ? MapTree.lut.getColor(elev) : null;
    //     bgCol = col ? "#" + col.getHexString() + "77" : bgCol;
    //     // console.log(elev);
    //     color = elev ? "black" : "red"
    //     // borderStyle = dataSample.elev ? "1px solid green": "1px solid red"
    // }
    console.log(dataSample)
    const select = (e, isSelected) => {
        // setSelected(isSelected);
    }

    return (<>
        {currentNode.nodes.length ? currentNode.nodes.map((childNode, i) => <MapNodeVis key={`node_lvl${childNode.level}_i${i}`} currentNode={childNode} rootNode={rootNode} />) :
            <div onMouseEnter={e => select(e, true)} onMouseLeave={e => select(e, false)} style={{ width: width, height: height, border: borderStyle, position: "absolute", zIndex: 2, bottom: top, left: left, background: bgCol }} />}
    </>)
}

const TileMap = ({ tiles }) => {

    return (<>
        <div id='tilesTopRow' style={{ display: "flex" }}>
            {tiles.filter((tile, i) => i >= 2)
                .map((tile: Tile, i) => {
                    console.log(tile)
                    return <img key={"TilesBottomRow_" + i} src={tile.imgUrl} style={{ width: "50%", height: "50%" }} />
                })}
        </div>
        <div id='tilesBottomRow' style={{ display: "flex" }}>
            {tiles.filter((tile, i) => i < 2).reverse()
                .map((tile: Tile, i) => {
                    console.log(tile)
                    return <img key={"TilesTopRow_" + i} src={tile.imgUrl} style={{ width: "50%", height: "50%" }} />
                })}
        </div>
    </>)
} 