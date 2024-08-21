import React, { useEffect, useMemo, useState } from "react";
import { MapTile } from "./model/MapTile";
import { Quadtree, Rectangle } from "@timohausmann/quadtree-ts";

/**
 * Map tree display for a specific zoom and area
 * @param param0 
 * @returns 
 */
export const MapVis = ({ mapTree }: { mapTree: Quadtree<Rectangle> }) => {
    console.log(`[MapTree]`)
    // check if tree was reparented
    let tile: any = mapTree.objects.find(obj => obj instanceof MapTile);
    // const subTiles = mapTree.nodes
    //     .map(node =>
    //         node.objects.find(obj => obj instanceof Tile)
    //     )
    //     .filter(elt => elt);

    let isReparented = !tile;
    // console.log(subTiles);
    console.log({ isReparented })
    console.log(tile)
    return (<>
        {/* <div style={{ height: "512px" }}> */}
        <MapNodeVis currentNode={mapTree} rootNode={mapTree} />
        {/* </div> */}
        {/* <TileDisplay key={"colKey"} tile={tileObj} style={}/> */}
        {/* {isReparented ? <TileMap tiles={subTiles} /> :
            <img src={tile.imgUrl} style={{ width: "100%", height: "100%" }} />} */}
    </>)
};

const MapNodeVis = ({ currentNode, rootNode }: { currentNode: Quadtree<Rectangle>, rootNode: Quadtree<Rectangle> }) => {
    // const [selected, setSelected] = useState(false);
    // console.log(currentNode.bounds);
    const bounds = currentNode.bounds;
    const width = (bounds.width / rootNode.bounds.width) * 100 + "%"
    const height = (bounds.height / rootNode.bounds.height) * 100 + "%";
    const left = ((bounds.x - rootNode.bounds.x) / rootNode.bounds.width) * 100 + "%";
    const top = ((bounds.y - rootNode.bounds.y) / rootNode.bounds.height) * 100 + "%";  // TODO: check if not bottom instead of top

    const dataSample = currentNode.objects[0];
    let bgCol = "#ff000000";    // bydefault transparent = no background
    let color = currentNode.objects.length ? "red" : "black";
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
    // console.log(dataSample)
    // console.log(currentNode)
    const select = (e, isSelected) => {
        // setSelected(isSelected);
    }
    if (currentNode.level === 0 && currentNode.nodes.length === 0) {
        currentNode.split()
    }
    return (<>
        {currentNode.nodes.length ? currentNode.nodes.map((childNode, i) => <MapNodeVis key={`node_lvl${childNode.level}_i${i}`} currentNode={childNode} rootNode={rootNode} />) :
            <div onMouseEnter={e => select(e, true)} onMouseLeave={e => select(e, false)} style={{ width: width, height: height, border: borderStyle, position: "absolute", zIndex: 2, bottom: top, left: left, background: bgCol }} />}
    </>)
}

export const TileMap = ({ tiles }) => {
    const [refresh, setRefresh] = useState(false)
    const mapTiles = useMemo(() => tiles.map(node => new MapTile(node.bounds, node.level)), [tiles])
    // console.log(tiles.map(node => new Tile(node)))
    useEffect(() => {
        const fetchItems = async () => {
            for await (const mapTile of mapTiles) {
                await mapTile.fetchData()
            }
            return mapTiles
        }
        fetchItems().then(mapTiles => {
            // console.log(mapTiles);
            setRefresh(curr => !curr)
        })
    }, [tiles])
    // tiles.forEach(node => console.log(node))
    // mapTiles.forEach(mapTile => console.log(`row:${mapTile.row}, col:${mapTile.col}, x:${mapTile.x}, y:${mapTile.y}`))
    // console.log(tiles)
    return (<>
        <div id='tilesTopRow' style={{ display: "flex" }}>
            {mapTiles.filter((mapTile, i) => i >= 2)
                .map((mapTile: MapTile, i) => {
                    // console.log(mapTile)
                    return <img key={"TilesBottomRow_" + i} src={mapTile.img} style={{ width: "50%", height: "50%" }} />
                })}
        </div>
        <div id='tilesBottomRow' style={{ display: "flex" }}>
            {mapTiles.filter((mapTile, i) => i < 2).reverse()
                .map((mapTile: MapTile, i) => {
                    // console.log(mapTile)
                    return <img key={"TilesTopRow_" + i} src={mapTile.img} style={{ width: "50%", height: "50%" }} />
                })}
        </div>
    </>)
}

export const TileMapVis = ({ mapTree }) => {

}