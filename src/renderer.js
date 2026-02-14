import { drawArrow } from './drawUtils.js';

export default class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.updateColors();
  }

  updateColors() {
    const style = getComputedStyle(document.body);
    this.planeColor = style.getPropertyValue('--plane-color').trim() || '#e0e0e0';
    this.blockColor = style.getPropertyValue('--block-color').trim() || 'black';
    this.textColor = style.getPropertyValue('--text-color').trim() || 'black';
  }

  clear() {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawPlane(settings) {
    const ctx = this.ctx;
    const transform = ctx.getTransform();

    const { length, angle, scale } = settings;

    const height = scale * length * Math.sin(angle);
    const xLength = scale * length * Math.cos(angle);

    const [x, y] = [100, 100];

    ctx.translate(x, y);

    ctx.beginPath();
    ctx.moveTo(0, height);
    ctx.lineTo(xLength, 0);
    ctx.lineTo(xLength, height);
    ctx.closePath();

    ctx.fillStyle = this.planeColor;
    ctx.fill();

    ctx.strokeStyle = this.textColor;
    ctx.fillStyle = this.textColor;

    ctx.beginPath();
    ctx.moveTo(0, height);
    ctx.lineTo(-scale / 2 * Math.sin(angle), height - scale / 2 * Math.cos(angle));
    ctx.stroke();

    ctx.setTransform(transform);
  }

  drawBlock(block, settings) {
    const ctx = this.ctx;
    const transform = ctx.getTransform();

    const { length, angle, displayVectors, blockSize, scale } = settings;
    const height = scale * length * Math.sin(angle);

    ctx.translate(100, 100);
    ctx.translate(0, height);
    ctx.rotate(-angle);

    ctx.fillStyle = this.blockColor;

    ctx.fillRect(block.position, 0, blockSize * scale, -blockSize * scale);

    if (displayVectors) {
      const vectorX = block.position + blockSize * scale / 2;
      const vectorY = -blockSize * scale / 2;
      drawArrow(ctx, vectorX, vectorY, block.velocity, 'red', 'v');
      drawArrow(ctx, vectorX, vectorY + 5, block.motion.acceleration, 'blue', 'a');
    }

    ctx.setTransform(transform);
  }
}
