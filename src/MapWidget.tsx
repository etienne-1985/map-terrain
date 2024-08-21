import React, { useCallback, useMemo, useRef, useState } from "react";

// import {
//     BrowserRouter as Router,
//     Route,
//     Switch,
//     useLocation
// } from "react-router-dom";
import "./styles.css";

import { useSpring, animated, config } from 'react-spring'
import { MapNodeType, MapTree } from "./model/MapTree";
import { MapVis, TileMap } from "./MapVis";

// UI layout, map layer, map overlay
/**
 * A widget to show current map
 * Can be included in sidebar or directly on top of rendering canvas
 * @returns 
 */
export const MapWidget = ({ mapTree, maxZoom }) => {
    const [refresh, setRefresh]: any = useState(false);
    const [zoom, setZoom]: any = useState(maxZoom - 1);
    const [maximized, toggleMaximized]: any = useState(false);
    const [flip, set] = useState(false);
    const scaleAnim = useSpring({ scale: maximized ? 0.4 : 1.0 });
    const timeStampRef = useRef(0)
    const nodeRef = useRef(mapTree)
    // const blinkAnim = useSpring({
    //     loop: true,
    //     to: [
    //         { scale: maximized ? 0.55 : 0.98 },
    //         { scale: maximized ? 0.5 : 1 }
    //     ],
    //     from: { scale: maximized ? 0.5 : 1 },
    // })

    const zoomScroll = useCallback((evt) => {
        const timeStampDiff = evt.timeStamp - timeStampRef.current
        if (timeStampDiff > 500) {
            console.log(timeStampDiff)
            timeStampRef.current = evt.timeStamp
            if (evt.deltaY < 0 && zoom < maxZoom) {
                // zoomin
                setZoom(curr => curr + 1)
            } else if (evt.deltaY > 0 && zoom > 0) {
                // zoom out
                setZoom(curr => curr - 1)
            }
        }
    }, [zoom])

    const toggleMaximization = (evt) => {
        // console.log(evt);
        if (evt.button === 1)
            toggleMaximized(!maximized);
    }

    console.log(mapTree)
    // console.log(mapTree);
    let subTree = null;// props.mapTree ? MapTree.getSubTree(zoomLvl, props.mapArea) : null;
    // focusedTree = mapTree;
    // console.log(lut)

    const currentNode = useMemo(() => {
        console.log(`get nodes for zoom level ${zoom} (max: ${maxZoom})`);
        const path = mapTree.getRecursivePath(mapTree, zoom, MapNodeType.TopLeft)
        const node = mapTree.getNodeFromPath(path)
        console.log(path)
        return node
    }, [zoom])

    console.log(currentNode)

    return (<>
        {/* <Routing> */}
        {/* <FillArgs argList={args}> */}
        {/* <h1 style={{ textAlign: "center" }}>MapGen</h1> */}
        {/* <DispArgs args={args} /> */}
        {/* <UsagesDisplay argList={args} usagesRef={usagesRef} /> */}
        {/* <div ref={lutRef}></div> */}
        <MapLayers>
            <TileMapLayer />
            <ElevationLayer />
        </MapLayers>
        <div style={{ width: "1280px", margin: "auto" }} onWheel={(e) => zoomScroll(e)}>
            <div className="mapOverlay" onMouseDown={(e) => toggleMaximization(e)}>
                {/* <animated.div style={{ position: "relative", width: mapSize, transformOrigin: 'top left', ...scaleAnim }} onWheel={(e) => zoomScroll(e)} > */}
                <div style={{ position: "relative" }}>
                    {currentNode && <MapVis mapTree={currentNode} />}
                    <TileMap tiles={currentNode.nodes} />
                </div>
                {/* </animated.div> */}
                <div className="elevationLayer"></div>
            </div>
            {/* <TextureHelper texData={dataTex} size={size} /> */}
            {/* <div className="map3dlayer">
                        <MapRender mapTree={focusedTree} style={{margin: "auto"}}/>
                    </div> */}
        </div>
        {/* </FillArgs> */}
        {/* </Routing> */}
    </>
    )
}

/**
 * Provide zoom scrolling feature for the map
 */
const MapScroller = () => {

}

const ZoomLvlGauge = () => {

}

export const MapLayers = ({ ...props }) => {
    return (<></>)
}

export const TileMapLayer = () => {
    return (<></>)
}

export const ElevationLayer = () => {
    return (<></>)
}

