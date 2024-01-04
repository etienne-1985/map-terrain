import { Rect } from "@timohausmann/quadtree-js";
import { Vector3 } from "three";

export interface DataSource {

    getValue(props);

    interpolate(props);

    fetch(props);

    // fromHeightmap() {

    // }

    // // height func
    // fromGenerator() {

    // }

    // // async
    // fromDatasource() {

    // }
}

// data fetch from async source like remote API, file, etc..
interface AsyncDataSource {
    fetchValue(obj);
}

interface InterpolatedData {
    interpolate();
}

/**
 * MathFuncDataSource
 */
export class Generator {

}

/**
 * Provides both async data poll and data interpolation in single datasource interface
 */
export class DataSample implements DataSource, Rect {
    x;
    y;
    width;
    height;

    dataSource;
    dataPoint: Vector3;

    isInterpolated = false;

    static updated = false;
    static count = 0;

    constructor(bounds: Rect, isInterpolated = false) {
        // console.log("[DataSample] create new datasample")
        // get center of sample area
        this.x = bounds.x;
        this.y = bounds.y;
        this.width = bounds.width;
        this.height = bounds.height;
        this.isInterpolated = isInterpolated;
        // this.dataSource = dataSource;
        this.dataPoint = new Vector3(bounds.x + bounds.width / 2, 0, bounds.y + bounds.height / 2);
        DataSample.count++;
    }

    // respect datasource interface
    async getValue() {
        const elev = this.isInterpolated ? this.interpolate(this.dataPoint) : await this.fetch(this.dataPoint);
        DataSample.updated = true;
        return elev;
    }

    /**
     * Default implem to be overrided
     */

    interpolate(data) {
        console.log("[DataSample]  Default implem to be overrided")
        return 0;
    }

    async fetch(data) {
        console.log("[DataSample]  Default implem to be overrided");
        return 0;
    }

}
