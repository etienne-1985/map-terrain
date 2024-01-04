// import { Canvas } from "@react-three/fiber";
import { useEffect, useState } from "react";
import { Vector3 } from "three";
// import { ThreeAppDemo } from "../../three-core-modules/apps/ThreeApp";
// import { MapTerrain } from "./MapTerrain";
// import { LutWidget } from "../../misc-tools/LutWidget";
import { MapWidget } from "./MapWidget";
import React from "react";
import { MapArea } from "./model/MapArea";
import { MapTree } from "./model/MapTree";
import { GeoProj } from "./services/GeoToolkit";
import { QuadtreeUtils } from "./utils/QuadtreeUtils";

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

export const mapInit = async () => {
    console.log("Populating: Init tree structure from map area");
    MapTree.populate(MapTree.quadtree, mapArea, TILE_ZOOM_LVL);
    await MapTree.retrieveMapData(MapTree.quadtree);
    // console.log("Sampling: create data samples");
    let selectedNodes = QuadtreeUtils.collectAllNodes(MapTree.quadtree, mapArea).filter(node => node.level === TILE_ZOOM_LVL);
    // for await (const promise of selectedNodes.map(node => MapTree.autoSampling(DEFAULT_SAMPLING_RES, MAX_SLOPE, mapArea, node)));
    selectedNodes.forEach(tileNode => {
        // TODO: assign an heightmap
        console.log(tileNode)
    });
    console.log(selectedNodes);
    // select nodes at sampling level => new leaves
    // selectedNodes = QuadtreeUtils.collectAllNodes(MapTree.quadtree, mapArea).filter(node => node.level === TILE_ZOOM_LVL + 3);
    // console.log(selectedNodes.length);
    // let samples = selectedNodes.map(node => node.objects[0]);
    // await MapTree.gatherSamplesData(samples);
    // console.log("Done gathering all data")
    // mapArea.findMinMax(samples);
    // console.log(`area height min ${mapArea.minHeight} max: ${mapArea.maxHeight}`)
    // // for await (const promise of samples.map((dataSample: DataSample)=>dataSample.getElevation()))
    // const lut = new Lut("rainbow", 512);
    // lut.setMin(mapArea.minHeight - 2);
    // lut.setMax(mapArea.maxHeight + 2);
    // MapTree.lut = lut;
}

/**
 * Tiles selection: click => highlight
 * Choose resolution: UI slider => update mesh wireframe dynamically 
 * Get elevation for selected tiles @ sampling res => real-time terrain elevation animation as we go along data reception
 * Smooth terrain by increasing resolution and interpolation
 * @returns 
 */
export const MApp = () => {
    const [mapTree, setMapTree]: any = useState();
    // const [lut, setLut]: any = useState();

    useEffect(() => {
        (async () => {
            await mapInit();
            // setLut(MapTree.lut);
            setMapTree(MapTree.quadtree);
            // toggleMaximized(false);     
        })();
    }, []);

    const mapConfig = {
        mapArea,
        mapTree,
        mapSize,
        maxZoomScroll: TILE_ZOOM_LVL - 1
    }

    // select nodes at tile level => leaves
    // const mapTileNodes = MapTree.quadtree ? QuadtreeUtils.collectAllNodes(MapTree.quadtree, mapArea).filter(node => node.level === (TILE_ZOOM_LVL - 1)) : [];
    console.log(MapTree.quadtree);
    // const camPos = new Vector3(478820, 0, 6143071);
    return (<>
        {/* <LutWidget lut={MapTree.lut} cursorValue={129} style={{ height: mapSize, width: "64px" }} /> */}
        <MapWidget {...mapConfig} />
        {/* <Canvas
            // orthographic
            style={{
                width: 1280,
                height: 720
            }}
        >
            <ThreeAppDemo />
            <MapTerrain />
        </Canvas> */}
    </>)
}