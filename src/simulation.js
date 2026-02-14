import { Block } from './block.js';
import Graph from './graph.js';
import Modal from './modal.js';
import {
  calculateBounceVelocity, calculateInitialHeight, calculateMaxAcceleration
} from './motion.js';
import Renderer from './renderer.js';
import {
  adjustScale, isDataValid, setupSettingsListeners
} from './settings.js';

export default class Simulation {
  constructor(canvas, settings) {
    this.canvas = canvas;
    this.renderer = new Renderer(canvas);

    setupSettingsListeners(this.canvas);

    this.modal = new Modal();

    this.activeGraph = null;

    this.modal.canvas.onmousemove = event => {
      const canvasPos = this.modal.canvas.getBoundingClientRect();
      this.mouseX = event.clientX - canvasPos.x;
    }

    this.positionGraphCanvas = document.querySelector('#position-graph');
    this.positionGraphCtx = this.positionGraphCanvas.getContext('2d');
    this.positionGraphCanvas.onclick = () => {
      this.modal.show();
      this.activeGraph = this.positionGraph;
    }

    this.velocityGraphCanvas = document.querySelector('#velocity-graph');
    this.velocityGraphCtx = this.velocityGraphCanvas.getContext('2d');
    this.velocityGraphCanvas.onclick = () => {
      this.modal.show();
      this.activeGraph = this.velocityGraph;
    }

    this.accelerationGraphCanvas = document.querySelector('#acceleration-graph');
    this.accelerationGraphCtx = this.accelerationGraphCanvas.getContext('2d');
    this.accelerationGraphCanvas.onclick = () => {
      this.modal.show();
      this.activeGraph = this.accelerationGraph;
    }

    this.settings = settings;

    this.running = false;

    this.reset();
  }

  init() {
    const resize = () => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight - 150;
      adjustScale(this.canvas);
    }

    resize();
    window.onresize = resize;

    this.reset();
    this.loop();
  }

  run() {
    this.block.running = true;
    this.startTime = Date.now();
  }

  displayError(value) {
    const error = document.querySelector('.error');
    error.style.display = 'block';
    error.innerHTML = value;
  }

  hideError() {
    const error = document.querySelector('.error');
    error.style.display = 'none';
    error.innerHTML = '';
  }

  pause() {
    if (!this.block || !this.block.running)
      return;

    this.block.running = false;
    this.paused = true;
  }

  continue() {
    const pauseTime = Date.now() - this.endTime
    this.block.motion.shift(pauseTime);
    this.paused = false;
    this.block.running = true;
    this.startTime += pauseTime;
  }

  reset() {
    this.paused = false;

    if (!isDataValid()) {
      this.displayError('Invalid data entered');
      return;
    }

    this.hideError();

    const { length, scale, initialVelocity } = this.settings;
    const maxPos = initialVelocity === 0
      ? length * scale + 40
      : calculateInitialHeight(this.settings) * scale + 40;

    const positionMarker = Math.floor(length * 100) / 100;
    this.positionGraph = new Graph([40, 400], {
      maxPos,
      maxNeg: 0,
      negY: 10,
      xLabel: 't',
      yLabel: 'x',
      scale,
      yMarkers: [
        [maxPos - 40, `${positionMarker}`]
      ]
    });

    const maxVel = Math.max(
      calculateBounceVelocity(this.settings, length),
      initialVelocity
    );
    const velocityMarker = Math.floor(maxVel * 100) / 100;
    this.velocityGraph = new Graph([40, 260], {
      maxPos: maxVel * scale + 40,
      maxNeg: maxVel * scale + 40,
      posY: 200,
      negY: 200,
      xLabel: 't',
      yLabel: 'v',
      scale,
      yMarkers: [
        [maxVel * scale, `${velocityMarker}`],
        [-maxVel * scale, `-${velocityMarker}`]
      ]
    });

    const maxAcc = Math.abs(calculateMaxAcceleration(this.settings));
    const accMarker = Math.floor(maxAcc * 100) / 100;
    this.accelerationGraph = new Graph([40, 120], {
      negY: 300,
      posY: 40,
      maxPos: 0,
      maxNeg: maxAcc * scale + 40,
      scale,
      yMarkers: [
        [-maxAcc * scale, `-${accMarker}`]
      ]
    });

    this.block = new Block(this.settings);
    if (!this.block.willMove())
      this.displayError('The block will not start sliding.');
    if (this.block.willFlyOff())
      this.displayError('The block will fly off the plane.');
  }

  updateTheme() {
    this.renderer.updateColors();
    this.draw();
  }

  loop() {
    const now = Date.now();

    if (!this.block)
      return;
    if (this.block.running) {
      this.endTime = now;
      const elapsed = this.endTime - this.startTime;

      if (this.block.velocityDiscontinuous)
        this.velocityGraph.willBeDiscontinuous();
      if (this.block.accelerationDiscontinuous)
        this.accelerationGraph.willBeDiscontinuous();

      this.positionGraph.addNextPoint(elapsed, this.block.position);
      this.velocityGraph.addNextPoint(elapsed, this.block.velocity);
      this.accelerationGraph.addNextPoint(elapsed, this.block.motion.acceleration);

      this.block.updateMotion(now);
    }

    this.draw();

    window.requestAnimationFrame(this.loop.bind(this));
  }

  draw() {
    this.modal.ctx.clearRect(0, 0, this.modal.canvas.width, this.modal.canvas.height);

    const textColor = this.renderer.textColor;

    this.positionGraphCtx.clearRect(
      0, 0, this.positionGraphCanvas.width, this.positionGraphCanvas.height
    );
    this.positionGraphCtx.scale(0.4, 0.4);
    this.positionGraph.draw(this.positionGraphCtx, [40, 340], textColor);
    this.positionGraphCtx.setTransform(1, 0, 0, 1, 0, 0);

    if (this.activeGraph === this.positionGraph) {
      this.positionGraph.draw(this.modal.ctx, undefined, textColor);
      this.positionGraph.setMousePosition(this.mouseX);
    }

    this.velocityGraphCtx.clearRect(
      0, 0, this.velocityGraphCanvas.width, this.velocityGraphCanvas.height
    );
    this.velocityGraphCtx.scale(0.3, 0.3);
    this.velocityGraph.draw(this.velocityGraphCtx, [40, 250], textColor);
    if (this.activeGraph === this.velocityGraph) {
      this.velocityGraph.draw(this.modal.ctx, undefined, textColor);
      this.velocityGraph.setMousePosition(this.mouseX);
    }
    this.velocityGraphCtx.setTransform(1, 0, 0, 1, 0, 0);

    this.accelerationGraphCtx.clearRect(
      0, 0, this.accelerationGraphCanvas.width, this.accelerationGraphCanvas.height
    );
    this.accelerationGraphCtx.scale(0.4, 0.4);
    this.accelerationGraph.draw(this.accelerationGraphCtx, [40, 80], textColor);
    if (this.activeGraph === this.accelerationGraph) {
      this.accelerationGraph.draw(this.modal.ctx, undefined, textColor);
      this.accelerationGraph.setMousePosition(this.mouseX);
    }
    this.accelerationGraphCtx.setTransform(1, 0, 0, 1, 0, 0);

    this.renderer.clear();

    const ctx = this.renderer.ctx;
    ctx.font = '20px Arial';
    ctx.fillStyle = this.renderer.textColor;
    ctx.fillText('Bounces: ' + this.block.bounces, 30, 40);

    if (this.block.running || this.block.position === 0 || this.paused)
      ctx.fillText('Time: ' + (this.endTime - this.startTime) / 1000 + 's', 30, 70);

    this.renderer.drawPlane(this.settings);
    this.renderer.drawBlock(this.block, this.settings);
  }
}
