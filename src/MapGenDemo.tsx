// import { Canvas } from "@react-three/fiber";
import { useEffect, useMemo, useState } from "react";
import { Vector3 } from "three";
// import { ThreeAppDemo } from "../../three-core-modules/apps/ThreeApp";
// import { MapTerrain } from "./MapTerrain";
// import { LutWidget } from "../../misc-tools/LutWidget";
import { MapWidget } from "./MapWidget";
import React from "react";
import { MapArea } from "./model/MapArea";
import { MapNodeType, MapTree } from "./model/MapTree";
import { GeoProj } from "./services/GeoToolkit";
import { QuadtreeUtils } from "./utils/QuadtreeUtils";
import { IgnGeoServiceProvider } from "./services/GeoServices";
import { Rectangle } from "@timohausmann/quadtree-ts";
import * as MapTreeUtils from "./model/MapTree";

export const TILE_ZOOM_LVL = 19;    // the zoom used for tiles

const mapSize = 512;//const MAP_DISPLAY_SIZE = 512;
const POINTS_INIT = [[4.302053, 48.218093], [4.302455, 48.217205], [4.301092, 48.217462]];
const pointSet = POINTS_INIT.map(coords => GeoProj.toMercator(coords));
const mapArea = new MapArea(pointSet);
const TILE_ZOOM_RESOL = 0.2985821417; // m/px for this zoom level
const TILE_SIZE = 256;
const MAX_ZOOM_SCROLL = TILE_ZOOM_LVL - 2;
const DEFAULT_SAMPLING_RES = 15; // how many meter sample data point should be spaced => we will split until
const MAX_SLOPE = 2; // in meters

const mapTreeCfg = {
    x: IgnGeoServiceProvider.origin.left,
    y: -IgnGeoServiceProvider.origin.top,
    width: IgnGeoServiceProvider.resolution * 256,
    height: IgnGeoServiceProvider.resolution * 256,
    maxLevels: 22
}

const rectMapArea = new Rectangle({
    x: mapArea.x,
    y: mapArea.y,
    width: mapArea.width,
    height: mapArea.height,
    data: mapArea
});

/**
 * Tiles selection: click => highlight
 * Choose resolution: UI slider => update mesh wireframe dynamically 
 * Get elevation for selected tiles @ sampling res => real-time terrain elevation animation as we go along data reception
 * Smooth terrain by increasing resolution and interpolation
 * @returns 
 */
export const MapGenDemo = () => {
    // const [mapTree, setMapTree]: any = useState();
    // const [lut, setLut]: any = useState();

    // useEffect(() => {
    //     (async () => {
    //         await mapInit();
    //         // setLut(MapTree.lut);
    //         setMapTree(MapTree.quadtree);
    //         // toggleMaximized(false);     
    //     })();
    // }, []);

    // const mapTree = useMemo(() => new Quadtree(mapTreeCfg), [])
    const mapTree = useMemo(() => new MapTree(mapTreeCfg, rectMapArea), [])
    // mapTree.insert(mapArea);
    mapTree.splitRecursive([], TILE_ZOOM_LVL)
    const elements = mapTree.retrieve(rectMapArea)
    console.log(elements)
    // mapTree.split()
    // select nodes at tile level => leaves
    // const mapTileNodes = MapTree.quadtree ? QuadtreeUtils.collectAllNodes(MapTree.quadtree, mapArea).filter(node => node.level === (TILE_ZOOM_LVL - 1)) : [];
    console.log(mapArea);
    // const camPos = new Vector3(478820, 0, 6143071);
    return (<>
        {/* <LutWidget lut={MapTree.lut} cursorValue={129} style={{ height: mapSize, width: "64px" }} /> */}
        <MapWidget mapTree={mapTree} maxZoom={MAX_ZOOM_SCROLL} />
        {/* <Canvas
            // orthographic
            style={{
                width: 1280,
                height: 720
            }}
        >
            <ThreeAppDemo />
            <MapTerrain />
        </Canvas>  */}
    </>)
}