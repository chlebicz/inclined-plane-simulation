export const drawArrow = (ctx, x, y, length, color = 'black', label) => {
  const transform = ctx.getTransform();

  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + length, y);
  ctx.stroke();
  ctx.strokeStyle = 'black';

  ctx.fillStyle = color;
  ctx.beginPath();

  ctx.translate(x + length, y);
  ctx.scale(Math.sign(length), Math.sign(length));
  ctx.moveTo(10, 0);
  ctx.lineTo(0, -10);
  ctx.lineTo(0, 10);

  ctx.closePath();

  ctx.fill();

  ctx.scale(Math.sign(length), Math.sign(length));
  if (label) {
    ctx.font = '20px Arial';
    ctx.fillText(label, 20, 10);
  }

  ctx.fillStyle = 'black';

  ctx.setTransform(transform);
};

export const drawDottedLine = (ctx, x1, y1, x2, y2) => {
  ctx.save();
  ctx.setLineDash([2, 3]); // 2px line, 3px gap
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
};
