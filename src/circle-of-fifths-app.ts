import P5 from 'p5';
import Vue from 'vue/dist/vue.js';
import './styles.scss';
import {modulo} from './utils';
import wheel from './wheel-config';
import {drawShape, drawShapeInformation, drawTile, makeTile, makeWheelTiles, rotateWheel} from './wheel-service';

const sketch = (p5: P5) => {
    // The sketch setup method
    p5.setup = () => {
        // Creating and positioning the canvas
        const canvas = p5.createCanvas(1, 1);
        canvas.parent('canvasDiv');
    };
};
new P5(sketch);
