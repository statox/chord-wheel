import P5 from 'p5';
import {Wheel, Ring, Tile, WheelTiles} from './wheel-types';
import {modulo} from './utils';

export const makeTile = (ring: Ring, labelIndex: number): Tile => {
    if (labelIndex < 0 || labelIndex >= ring.labels.length) {
        throw new Error(`OOB labelIndex: ${labelIndex}`);
    }
    const {cellSize, innerDiameter, outerDiameter, ratio} = ring;

    const position = new P5.Vector();
    position.x = 0;
    position.y = -outerDiameter / 2;

    const cellAngle = labelIndex * cellSize * ratio;
    position.rotate(cellAngle);

    const offsetAngle = cellSize / 2;
    // TODO: Work out the math to replace 1.02 by the real coefficient
    const vertices = [
        position.copy().rotate(-offsetAngle).setMag(innerDiameter), // Bottom left
        position.copy().rotate(-offsetAngle).setMag(outerDiameter), // Top left
        position.copy().setMag(outerDiameter * 1.02), // Top middle
        position.copy().rotate(offsetAngle).setMag(outerDiameter), // Top right
        position.copy().rotate(offsetAngle).setMag(innerDiameter), // Bottom right
        position.copy().setMag(innerDiameter * 1.02) // Bottom middle
    ];
    const center = position.copy().setMag(innerDiameter + (outerDiameter - innerDiameter) / 2);

    const colorAngle = (labelIndex * 360) / ring.labels.length;

    return {
        vertices,
        center,
        label: ring.labels[labelIndex],
        color: `hsb(${colorAngle}, 50%, 80%)`,
        colorHue: colorAngle
    };
};

export const makeWheelTiles = (wheel: Wheel): WheelTiles => {
    const tilesInnerRing = wheel.innerRing.labels.map((_, i) => makeTile(wheel.innerRing, i));
    const tilesMiddleRing = wheel.middleRing.labels.map((_, i) => makeTile(wheel.middleRing, i));
    const tilesOuterRing = wheel.outerRing.labels.map((_, i) => makeTile(wheel.outerRing, i));

    return {
        tilesInnerRing,
        tilesMiddleRing,
        tilesOuterRing
    };
};

export const drawTile = (tile: Tile, p5: P5) => {
    p5.strokeWeight(0.01);
    p5.stroke([0, 0, 0, 0.5]);
    p5.fill(`hsb(${tile.colorHue}, 50%, 60%)`);

    const [bottomLeft, topLeft, topMiddle, topRight, bottomRight, bottomMiddle] = tile.vertices;
    p5.beginShape();
    p5.vertex(bottomLeft.x, bottomLeft.y);
    p5.vertex(topLeft.x, topLeft.y);
    p5.quadraticVertex(topMiddle.x, topMiddle.y, topRight.x, topRight.y);
    p5.vertex(topRight.x, topRight.y);
    p5.vertex(bottomRight.x, bottomRight.y);
    p5.quadraticVertex(bottomMiddle.x, bottomMiddle.y, bottomLeft.x, bottomLeft.y);
    p5.endShape();

    p5.noStroke();
    p5.fill(0);
    p5.textSize(0.05);
    p5.text(tile.label, tile.center.x - p5.textWidth(tile.label) / 2, tile.center.y);
};

export const drawShape = (
    position: number,
    tilesInnerRing: Tile[],
    tilesMiddleRing: Tile[],
    tilesOuterRing: Tile[],
    p5: P5
) => {
    const selectedTiles = [
        tilesInnerRing[modulo(position - 1, tilesInnerRing.length)],
        tilesInnerRing[modulo(position, tilesInnerRing.length)],
        tilesInnerRing[modulo(position + 1, tilesInnerRing.length)],

        tilesMiddleRing[modulo(2 * position - 1, tilesMiddleRing.length)],
        tilesMiddleRing[modulo(2 * position, tilesMiddleRing.length)],
        tilesMiddleRing[modulo(2 * position + 1, tilesMiddleRing.length)],

        tilesOuterRing[modulo(position, tilesOuterRing.length)]
    ];

    // p5.scale(1.1);
    for (const tile of selectedTiles) {
        p5.strokeWeight(0.01);
        p5.stroke([0, 0, 0, 1]);
        p5.fill(`hsb(${tile.colorHue}, 60%, 90%)`);
        const [bottomLeft, topLeft, topMiddle, topRight, bottomRight, bottomMiddle] = tile.vertices;
        p5.beginShape();
        p5.vertex(bottomLeft.x, bottomLeft.y);
        p5.vertex(topLeft.x, topLeft.y);
        p5.quadraticVertex(topMiddle.x, topMiddle.y, topRight.x, topRight.y);
        p5.vertex(topRight.x, topRight.y);
        p5.vertex(bottomRight.x, bottomRight.y);
        p5.quadraticVertex(bottomMiddle.x, bottomMiddle.y, bottomLeft.x, bottomLeft.y);
        p5.endShape();

        p5.noStroke();
        p5.fill(0);
        p5.textSize(0.05);
        p5.text(tile.label, tile.center.x - p5.textWidth(tile.label) / 2, tile.center.y);
    }
};

export const rotateWheel = (wheel: Wheel, clockwise: boolean) => {
    if (clockwise) {
        wheel.innerRing.labels.unshift(wheel.innerRing.labels.pop());
        wheel.middleRing.labels.unshift(wheel.middleRing.labels.pop());
        wheel.middleRing.labels.unshift(wheel.middleRing.labels.pop());
        wheel.outerRing.labels.unshift(wheel.outerRing.labels.pop());
        return;
    }

    wheel.innerRing.labels.push(wheel.innerRing.labels.shift());
    wheel.middleRing.labels.push(wheel.middleRing.labels.shift());
    wheel.middleRing.labels.push(wheel.middleRing.labels.shift());
    wheel.outerRing.labels.push(wheel.outerRing.labels.shift());
};
