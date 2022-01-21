import P5 from 'p5';
import {Wheel, Ring, Tile, WheelTiles} from './wheel-types';
import {modulo} from './utils';

/*
 * TODO: Work out the math to replace the magic numbers by accurate coefficients
 */

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
        p5.textStyle(p5.BOLD);
        p5.text(tile.label, tile.center.x - p5.textWidth(tile.label) / 2, tile.center.y);
        p5.textStyle(p5.NORMAL);
    }
};

export const drawShapeInformation = (position: number, wheel: Wheel, p5: P5) => {
    p5.textSize(0.04);
    p5.push();
    p5.rotate(position * ((2 * p5.PI) / 12));

    const referencePos = new P5.Vector();
    referencePos.x = 0;
    referencePos.y = -wheel.innerRing.innerDiameter;

    // Key marker
    const keyText = 'Key';
    p5.text(keyText, referencePos.x - p5.textWidth(keyText) / 2, referencePos.y * 0.8);

    // Degrees markers
    const markerPos = new P5.Vector();
    markerPos.y = -wheel.innerRing.innerDiameter * 1.04;
    const Itext = 'I';
    p5.text(Itext, markerPos.x - p5.textWidth(Itext) / 2, markerPos.y);

    p5.push();
    p5.rotate(-(2 * p5.PI) / 12);
    const IVtext = 'IV';
    p5.text(IVtext, markerPos.x - p5.textWidth(IVtext) / 2, markerPos.y);
    p5.pop();

    p5.push();
    p5.rotate((2 * p5.PI) / 12);
    const Vtext = 'V';
    p5.text(Vtext, markerPos.x - p5.textWidth(Vtext) / 2, markerPos.y);
    p5.pop();

    markerPos.y = -wheel.middleRing.innerDiameter * 1.02;
    const IIItext = 'III';
    p5.text(IIItext, markerPos.x - p5.textWidth(IIItext) / 2, markerPos.y);

    p5.push();
    p5.rotate(-(2 * p5.PI) / 24);
    const IItext = 'II';
    p5.text(IItext, markerPos.x - p5.textWidth(IItext) / 2, markerPos.y);
    p5.pop();

    p5.push();
    const VItext = 'V I';
    p5.rotate((2 * p5.PI) / 24);
    p5.text(VItext, markerPos.x - p5.textWidth(VItext) / 2, markerPos.y);
    p5.pop();

    const VIItext = 'V II°';
    markerPos.y = -wheel.outerRing.innerDiameter * 1.015;
    p5.text(VIItext, markerPos.x - p5.textWidth(VIItext) / 2, markerPos.y);
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
