import P5 from 'p5';
import Vue from 'vue/dist/vue.js';
import './styles.scss';
import {modulo} from './utils';
import wheel from './wheel-config';
import {drawShape, drawShapeInformation, drawTile, makeTile, makeWheelTiles, rotateWheel} from './wheel-service';

let wheelSize;
let wheelTiles;

const appSettings = {
    shapePosition: 0
};

const rotateWheelClockwise = () => {
    rotateWheel(wheel, true);
    wheelTiles = makeWheelTiles(wheel, wheelSize);
};
const rotateWheelCounterClockwise = () => {
    rotateWheel(wheel, false);
    wheelTiles = makeWheelTiles(wheel, wheelSize);
};

const app = new Vue({
    el: '#controlsDiv',
    data: appSettings,
    methods: {
        rotateWheelClockwise,
        rotateWheelCounterClockwise
    }
});

const sketch = (p5: P5) => {
    function customResizeCanvas() {
        const minDimension = Math.min(p5.windowWidth, p5.windowHeight);
        p5.resizeCanvas(minDimension * 0.8, minDimension * 0.8);
        wheelSize = (minDimension / 2) * 0.75;
        wheelTiles = makeWheelTiles(wheel, wheelSize);
    }

    // The sketch setup method
    p5.setup = () => {
        // Creating and positioning the canvas
        const canvas = p5.createCanvas(1, 1);
        canvas.parent('canvasDiv');
        customResizeCanvas();
        p5.colorMode(p5.HSB);
    };

    // The sketch draw method
    p5.draw = () => {
        p5.background(50);
        p5.translate(p5.width / 2, p5.height / 2);
        wheelTiles.tilesInnerRing.forEach((tile) => drawTile(tile, p5));
        wheelTiles.tilesMiddleRing.forEach((tile) => drawTile(tile, p5));
        wheelTiles.tilesOuterRing.forEach((tile) => drawTile(tile, p5));
        drawShape(
            appSettings.shapePosition,
            wheelTiles.tilesInnerRing,
            wheelTiles.tilesMiddleRing,
            wheelTiles.tilesOuterRing,
            p5
        );
        drawShapeInformation(appSettings.shapePosition, wheel, wheelSize, p5);
    };

    p5.keyPressed = () => {
        if (p5.keyCode === p5.LEFT_ARROW) {
            appSettings.shapePosition = modulo(appSettings.shapePosition - 1, wheelTiles.tilesInnerRing.length);
        }
        if (p5.keyCode === p5.RIGHT_ARROW) {
            appSettings.shapePosition = modulo(appSettings.shapePosition + 1, wheelTiles.tilesInnerRing.length);
        }
        if (p5.keyCode === p5.UP_ARROW) {
            rotateWheelCounterClockwise();
        }
        if (p5.keyCode === p5.DOWN_ARROW) {
            rotateWheelClockwise();
        }
    };

    p5.windowResized = () => {
        customResizeCanvas();
    };
};

new P5(sketch);
