import { describe, it, expect } from 'vitest';
import Motion, { calculateAccelerationDown } from '../src/motion.js';

describe('Motion Physics', () => {
  const g = 9.81;

  it('calculates acceleration down the plane correctly (no friction)', () => {
    // 30 degrees, friction 0
    const settings = { gravity: g, friction: 0, angle: Math.PI / 6 };
    // a = -(g * sin(30)) = -g * 0.5
    const acc = calculateAccelerationDown(settings);
    expect(acc).toBeCloseTo(-g * 0.5);
  });

  it('calculates acceleration with friction', () => {
    // 30 degrees, friction 0.1
    const settings = { gravity: g, friction: 0.1, angle: Math.PI / 6 };
    // a = -(g * sin(30) - friction * g * cos(30))
    const expected = -(g * 0.5 - 0.1 * g * Math.cos(Math.PI / 6));
    const acc = calculateAccelerationDown(settings);
    expect(acc).toBeCloseTo(expected);
  });

  it('Motion class calculates distance correctly', () => {
    const settings = { timeSpeed: 1 };
    const motion = new Motion(10, 0, 0, settings); // a=10, pos=0, vel=0
    // d = 0 + 0*t + 0.5*a*t^2
    // at t=1s (1000ms after start)
    const time = motion.start + 1000;
    const dist = motion.calculateDistance(time);
    expect(dist).toBeCloseTo(5); // 0.5 * 10 * 1^2 = 5
  });

  it('Motion class calculates velocity correctly', () => {
    const settings = { timeSpeed: 1 };
    const motion = new Motion(10, 0, 0, settings); // a=10
    // v = v0 + a*t
    const time = motion.start + 2000; // 2s
    const vel = motion.calculateVelocity(time);
    expect(vel).toBeCloseTo(20);
  });
});
