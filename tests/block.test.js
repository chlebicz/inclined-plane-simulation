import { describe, it, expect } from 'vitest';
import { Block } from '../src/block.js';

describe('Block Logic', () => {
  it('initializes at top of plane if initial velocity is 0', () => {
    const mockSettings = {
       initialVelocity: 0,
       angle: Math.PI / 6, // 30 deg
       length: 10,
       blockSize: 1,
       scale: 1,
       gravity: 10,
       friction: 0,
       displayVectors: false,
       timeSpeed: 1,
       energy: 1
    };
    const block = new Block(mockSettings);
    // position = scale * (length - blockSize) = 1 * (10 - 1) = 9
    expect(block.position).toBe(9);
    expect(block.velocity).toBe(0);
  });

  it('initializes at bottom if initial velocity > 0', () => {
    const mockSettings = {
       initialVelocity: 5,
       angle: Math.PI / 6,
       length: 10,
       blockSize: 1,
       scale: 1,
       gravity: 10,
       friction: 0,
       displayVectors: false,
       timeSpeed: 1,
       energy: 1
    };
    const block = new Block(mockSettings);
    expect(block.position).toBe(0);
    expect(block.velocity).toBe(5);
  });
});
