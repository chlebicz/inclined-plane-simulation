import { drawArrow, drawDottedLine } from './drawUtils.js';

const defaultOptions = {
  posX: 400,
  negX: 20,
  posY: 300,
  negY: 200,
  xLabel: 'x',
  yLabel: 'y',
  scale: 1,
  yMarkers: [],
  maxPos: 100,
  maxNeg: 100
};

export default class Graph {
  constructor(pos, options = defaultOptions, data = []) {
    this.pos = pos;
    this.data = data;
    this.options = { ...defaultOptions, ...options };
    this.discontinuities = [];
    this.mouseX = 0;
  }

  addNextPoint(x, y) {
    this.data.push({ x, y });
    this.data = this.data.slice(-this.options.posX);

    if (this.discontinuous) {
      this.discontinuous = false;
      this.discontinuities.push(x);
    }
  }

  setMousePosition(x) {
    this.mouseX = x;
  }

  reset() {
    this.data = [];
  }

  willBeDiscontinuous() {
    this.discontinuous = true;
  }

  draw(ctx, [x, y] = this.pos, color = 'black') {
    const transform = ctx.getTransform();

    ctx.translate(x, y);

    const {
      posX, negX, posY, negY, xLabel, yLabel, scale,
      maxPos, maxNeg
    } = this.options;

    // axes
    drawArrow(ctx, -negX, 0, posX + negX, color, xLabel);

    ctx.rotate(-Math.PI / 2);
    drawArrow(ctx, -negY, 0, posY  + negY, color, yLabel);
    ctx.rotate(Math.PI / 2);

    const factor = Math.min(posY / maxPos, negY / maxNeg);
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;

    // We only want to draw the time marker once per second.
    // Assuming xMarker is time in milliseconds.
    let lastDrawnSecond = -1;

    for (let i = 0; i < this.data.length; ++i) {
      const point = this.data[i];
      const value = point.y * factor;
      const xMarker = point.x;
      const currentSecond = Math.floor(xMarker / 1000);

      if (this.mouseX - x === i) {
        ctx.fillRect(i, -value, 5, 5);
        const xText = Math.floor(xMarker / 10) / 100;
        const yText = Math.floor(value / factor / scale * 100) / 100;
        ctx.fillText(`(${xText}, ${yText})`, i, -value);
      }

      // Draw X-axis marker only when we enter a new second (and it's not the very beginning if that's preferred, but keeping similiar logic)
      if (currentSecond > lastDrawnSecond) {
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(i, -5);
        ctx.lineTo(i, 5);
        ctx.stroke();
        ctx.fillText(`${currentSecond}`, i, 20);

        lastDrawnSecond = currentSecond;

        ctx.beginPath();
        if (i !== 0)
          ctx.moveTo(i - 1, -this.data[i - 1].y * factor);
      }

      if (this.discontinuities.includes(xMarker) && i !== 0) {
        const previousValue = this.data[i - 1].y * factor;

        ctx.lineTo(i - 1, -previousValue);
        ctx.stroke();

        drawDottedLine(
          ctx,
          i - 1, -previousValue,
          i - 1, -value
        );

        ctx.beginPath();
        ctx.moveTo(i, -value);
        continue;
      }

      if (value > posY || value < -negY) {
        ctx.stroke();
        ctx.beginPath();
        continue;
      }

      ctx.lineTo(i, -value);
    }
    ctx.stroke();

    for (const [pos, label] of this.options.yMarkers) {
      ctx.beginPath();
      const value = pos * factor;
      ctx.moveTo(-5, -value);
      ctx.lineTo(5, -value);
      ctx.stroke();
      ctx.fillText(label, 7, -value);
    }

    ctx.setTransform(transform);
  }
}
