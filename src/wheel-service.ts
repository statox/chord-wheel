import P5 from 'p5';
import {Wheel, Ring, Tile, WheelTiles} from './wheel-types';
import {modulo} from './utils';

/*
 * TODO: Work out the math to replace the magic numbers by accurate coefficients
 */

export const makeTile = (ring: Ring, labelIndex: number, wheelPosition: number, scale: number): Tile => {
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
    ].map((v) => v.mult(scale));
    const center = position
        .copy()
        .setMag(innerDiameter + (outerDiameter - innerDiameter) / 2)
        .mult(scale);

    const offsetColor = (wheelPosition * 360) / ring.labels.length;
    const colorAngle = (modulo(labelIndex + wheelPosition, ring.labels.length) * 360) / ring.labels.length;

    return {
        vertices,
        center,
        label: ring.labels[labelIndex],
        color: `hsb(${colorAngle}, 50%, 80%)`,
        colorHue: colorAngle
    };
};

export const makeWheelTiles = (wheel: Wheel, scale: number): WheelTiles => {
    const tilesInnerRing = wheel.innerRing.labels.map((_, i) => makeTile(wheel.innerRing, i, wheel.position, scale));
    const tilesMiddleRing = wheel.middleRing.labels.map((_, i) =>
        makeTile(wheel.middleRing, i, wheel.position * 2, scale)
    );
    const tilesOuterRing = wheel.outerRing.labels.map((_, i) => makeTile(wheel.outerRing, i, wheel.position, scale));

    return {
        tilesInnerRing,
        tilesMiddleRing,
        tilesOuterRing
    };
};

export const drawTile = (tile: Tile, p5: P5) => {
    p5.strokeWeight(2);
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
    p5.textSize(13);
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

    for (const tile of selectedTiles) {
        p5.strokeWeight(3);
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
        p5.textSize(13);
        p5.textStyle(p5.BOLD);
        p5.text(tile.label, tile.center.x - p5.textWidth(tile.label) / 2, tile.center.y);
        p5.textStyle(p5.NORMAL);
    }
};

export const drawShapeInformation = (position: number, wheel: Wheel, scale: number, p5: P5) => {
    p5.textSize(10);
    p5.push();
    p5.rotate(position * ((2 * p5.PI) / 12));

    p5.fill(250);
    p5.circle(0, 0, wheel.innerRing.innerDiameter * 2 * scale);
    p5.fill(0);

    const referencePos = new P5.Vector();
    referencePos.x = 0;
    referencePos.y = -wheel.innerRing.innerDiameter * scale;

    /*
     * Key marker
     */
    const arrowText = '▲';
    p5.text(arrowText, referencePos.x - p5.textWidth(arrowText) / 2, referencePos.y * 0.9);
    const keyText = 'Key';
    p5.text(keyText, referencePos.x - p5.textWidth(keyText) / 2, referencePos.y * 0.75);

    /*
     * Signature markers
     */
    const signaturePos = new P5.Vector();
    const signatures = ['♯', '♯♯', '♯♯♯', '♯♯♯♯', '7♭/5♯', '6♭/6♯', '5♭/7♯', '♭♭♭♭', '♭♭♭', '♭♭', '♭'];
    signaturePos.y = -wheel.innerRing.innerDiameter * 0.85 * scale;
    p5.push();
    for (const signature of signatures) {
        p5.rotate((2 * p5.PI) / 12);
        p5.text(signature, -p5.textWidth(signature) / 2, signaturePos.y);
    }
    p5.pop();

    /*
     * Degrees markers
     */
    // I
    const markerPos = new P5.Vector();
    markerPos.y = -wheel.innerRing.innerDiameter * 1.04 * scale;
    const Itext = 'I';
    p5.text(Itext, markerPos.x - p5.textWidth(Itext) / 2, markerPos.y);

    const typePos = new P5.Vector();
    typePos.y = -wheel.innerRing.outerDiameter * 0.9 * scale;
    const tItext = 'maj7,maj9';
    p5.text(tItext, typePos.x - p5.textWidth(tItext) / 2, typePos.y);

    // IV
    p5.push();
    p5.rotate(-(2 * p5.PI) / 12);
    const IVtext = 'IV';
    p5.text(IVtext, markerPos.x - p5.textWidth(IVtext) / 2, markerPos.y);
    const tIVtext = 'maj7,maj9';
    p5.text(tIVtext, typePos.x - p5.textWidth(tIVtext) / 2, typePos.y);
    p5.pop();

    // V
    p5.push();
    p5.rotate((2 * p5.PI) / 12);
    const Vtext = 'V';
    p5.text(Vtext, markerPos.x - p5.textWidth(Vtext) / 2, markerPos.y);
    const tVtext = '7,9,11,sus4,13';
    p5.text(tVtext, typePos.x - p5.textWidth(tVtext) / 2, typePos.y);
    p5.pop();

    markerPos.y = -wheel.middleRing.innerDiameter * 1.02 * scale;
    typePos.y = -wheel.middleRing.outerDiameter * 0.95 * scale;

    // III
    const IIItext = 'III';
    p5.text(IIItext, markerPos.x - p5.textWidth(IIItext) / 2, markerPos.y);
    const tIIItext = 'm7';
    p5.text(tIIItext, typePos.x - p5.textWidth(tIIItext) / 2, typePos.y);

    p5.push();
    p5.rotate(-(2 * p5.PI) / 24);
    const IItext = 'II';
    p5.text(IItext, markerPos.x - p5.textWidth(IItext) / 2, markerPos.y);
    const tIItext = 'm7,m9';
    p5.text(tIItext, typePos.x - p5.textWidth(tIItext) / 2, typePos.y);
    p5.pop();

    p5.push();
    const VItext = 'V I';
    p5.rotate((2 * p5.PI) / 24);
    p5.text(VItext, markerPos.x - p5.textWidth(VItext) / 2, markerPos.y);
    const tVItext = 'm7,m9';
    p5.text(tVItext, typePos.x - p5.textWidth(tVItext) / 2, typePos.y);
    p5.pop();

    const VIItext = 'V II°';
    markerPos.y = -wheel.outerRing.innerDiameter * 1.015 * scale;
    typePos.y = -wheel.outerRing.outerDiameter * 0.96 * scale;

    p5.text(VIItext, markerPos.x - p5.textWidth(VIItext) / 2, markerPos.y);
    const tVIItext = 'm7♭5';
    p5.text(tVIItext, typePos.x - p5.textWidth(tVIItext) / 2, typePos.y);
};

export const rotateWheel = (wheel: Wheel, clockwise: boolean) => {
    if (clockwise) {
        wheel.position--;
        wheel.innerRing.labels.unshift(wheel.innerRing.labels.pop());
        wheel.middleRing.labels.unshift(wheel.middleRing.labels.pop());
        wheel.middleRing.labels.unshift(wheel.middleRing.labels.pop());
        wheel.outerRing.labels.unshift(wheel.outerRing.labels.pop());
        return;
    }

    wheel.position++;
    wheel.innerRing.labels.push(wheel.innerRing.labels.shift());
    wheel.middleRing.labels.push(wheel.middleRing.labels.shift());
    wheel.middleRing.labels.push(wheel.middleRing.labels.shift());
    wheel.outerRing.labels.push(wheel.outerRing.labels.shift());
};
