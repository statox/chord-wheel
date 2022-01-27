import P5 from 'p5';

export type Ring = {
    labels: string[];
    cellSize: number;
    ratio: number;
    innerDiameter: number;
    outerDiameter: number;
};

export type Wheel = {
    scale: number;
    position: number;
    innerRing: Ring;
    middleRing: Ring;
    outerRing: Ring;
};

export type Tile = {
    vertices: P5.Vector[];
    center: P5.Vector;
    label: string;
    color: string;
    colorHue: number; // 0 -> 360
};

export type WheelTiles = {
    tilesInnerRing: Tile[];
    tilesMiddleRing: Tile[];
    tilesOuterRing: Tile[];
};
