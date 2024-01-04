import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

// import {
//     BrowserRouter as Router,
//     Route,
//     Switch,
//     useLocation
// } from "react-router-dom";
import "./styles.css";

import { useSpring, animated, config } from 'react-spring'
import MapVis from "./MapVis";
import { MapTree } from "./model/MapTree";

// UI layout, map layer, map overlay
/**
 * A widget to show current map
 * Can be included in sidebar or directly on top of rendering canvas
 * @returns 
 */
export const MapWidget = ({ ...props }) => {
    const maxZoomScroll = props.maxZoomScroll
    const [zoomLvl, setZoomLvl]: any = useState(maxZoomScroll - 1);
    const [maximized, toggleMaximized]: any = useState(false);
    const [flip, set] = useState(false);
    const scaleAnim = useSpring({ scale: maximized ? 0.4 : 1.0 });
    // const blinkAnim = useSpring({
    //     loop: true,
    //     to: [
    //         { scale: maximized ? 0.55 : 0.98 },
    //         { scale: maximized ? 0.5 : 1 }
    //     ],
    //     from: { scale: maximized ? 0.5 : 1 },
    // })

    const zoomScroll = useCallback((evt) => {
        if (evt.deltaY < 0 && zoomLvl < maxZoomScroll) {
            // zoomin
            setZoomLvl(zoomLvl + 1)
        } else if (evt.deltaY > 0 && zoomLvl > 0) {
            // zoom out
            setZoomLvl(zoomLvl - 1)
        }
    }, [zoomLvl])

    const toggleMaximization = (evt) => {
        // console.log(evt);
        if (evt.button === 1)
            toggleMaximized(!maximized);
    }

    console.log(`zoom level ${zoomLvl} (max: ${maxZoomScroll})`);
    // console.log(mapTree);
    let subTree = props.mapTree ? MapTree.getSubTree(zoomLvl, props.mapArea) : null;
    // focusedTree = mapTree;
    // console.log(lut)

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
        <div style={{ width: "1280px", margin: "auto" }}>
            <div className="mapOverlay" onMouseDown={(e) => toggleMaximization(e)}>
                <animated.div style={{ position: "relative", width: props.mapSize, transformOrigin: 'top left', ...scaleAnim }} onWheel={(e) => zoomScroll(e)} >
                {subTree && <MapVis mapTree={subTree} />}
                </animated.div>
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

