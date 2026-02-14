// Height multiplier (position on the plane) that the block will reach after a bounce
export const calculateDistanceMultiplier = ({ friction, angle, energy }) =>
  (energy * Math.sin(angle) - friction * Math.cos(angle)) / (Math.sin(angle) + friction * Math.cos(angle));

// Height reached by the block released with initial velocity from the start of the plane
export const calculateInitialHeight = ({ friction, angle, gravity, initialVelocity }) =>
  initialVelocity ** 2 / (2 * gravity * Math.sin(angle) + 2 * friction * gravity * Math.cos(angle));

// Check if the block will fly off the plane with the given initial velocity
export const willFlyOff = ({ friction, angle, gravity, blockSize, length, initialVelocity }) =>
  calculateInitialHeight({ friction, angle, gravity, initialVelocity }) + blockSize > length;

// Velocity of the block after a bounce
export const calculateBounceVelocity = ({ gravity, friction, angle, energy }, length) =>
  Math.sqrt(2 * energy * gravity * length * Math.sin(angle) - 2 * friction * gravity * length * Math.cos(angle));

// Acceleration of the block down the plane
export const calculateAccelerationDown = ({ gravity, friction, angle }) =>
  -(gravity * Math.sin(angle) - friction * gravity * Math.cos(angle));

// Acceleration of the block up the plane
export const calculateAccelerationUp = ({ gravity, friction, angle }) =>
  -(gravity * Math.sin(angle) + friction * gravity * Math.cos(angle));

// Check if the block will start sliding down
export const willMove = ({ gravity, friction, angle }) =>
  gravity * Math.sin(angle) > friction * gravity * Math.cos(angle);

export const calculateMaxAcceleration = calculateAccelerationUp;

// Uniformly accelerated motion
export default class Motion {
  constructor(acceleration, initialPosition, initialVelocity, settings) {
    this.start = Date.now();
    this.acceleration = acceleration;
    this.initialPosition = initialPosition;
    this.initialVelocity = initialVelocity;
    this.settings = settings;
  }

  calculateVelocity(time) {
    const { timeSpeed } = this.settings;
    const timeElapsed = (time - this.start) / 1000 * timeSpeed;
    return (this.initialVelocity + this.acceleration * timeElapsed);
  }

  calculateDistance(time) {
    const { timeSpeed } = this.settings;
    const timeElapsed = (time - this.start) / 1000 * timeSpeed;
    return (this.initialPosition + this.initialVelocity * timeElapsed + this.acceleration / 2 * timeElapsed ** 2);
  }

  shift(by) {
    this.start += by;
  }
}
