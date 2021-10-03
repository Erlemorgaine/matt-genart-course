const canvasSketch = require("canvas-sketch");
const { lerp } = require("canvas-sketch-util/math");
const random = require("canvas-sketch-util/random");

const settings = {
  dimensions: [40, 40],
  pixelsPerInch: 300,
  units: "cm"
};

const createGradientStops = (gradient, colorStops) => {
  colorStops.forEach(([position, color]) => gradient.addColorStop(position, color));
}

const sketch = () => {
  const createGrid = () => {
    const points = [];
    const count = 8; // There will be count * count shapes

    // Here we create the params that will be applied to the shapes,
    // and we push them in an object to the array of shapes (points)
    for (let x = 0; x < count; x++) {
      for (let y = 0; y < count; y++) {
        // For now we are working in uv space instead of pixel values

        // TODO: blur, shadown, stroke, better positioning
        const u = Math.abs(random.gaussian()) * x / (count - 1);
        const v = y / (count - 1);

        points.push({
          color:
           random.pick([
             `hsla(
               ${Math.abs(random.noise2D(u, v)) * 40 + 220},
                100%,
                ${random.value() * 10 + (y * 15)}%,
                0.2)`,
              ]),
          barWidth: Math.abs(random.gaussian()) * 3 + 2,
          barHeight: Math.abs(random.gaussian()) * 20,
          position: [u, v],
        });
      }
    }

    return points;
  };

  const points = createGrid();
  const margin = 8;

  return ({ context, width, height }) => {

    // Fill the canvas with a gradient
    const linearGradient = context.createLinearGradient(
      60,
      height,
      width,
      0
    );

    createGradientStops(
      linearGradient,
      [
        [0, "hsla(310, 100%, 50%, 0.3)"],
        [0.33, "hsla(360, 100%, 30%, 0.1)"],
        [0.67, "hsla(60, 100%, 30%, 0.15)"],
        [1, "hsla(220, 100%, 70%, 0.4)"]
      ]
    )

    const radialGradient = context.createRadialGradient(
      width * 0.85,
      height,
      width * 0.25,
      width * 0.5,
      height * 0.5,
      width
    );

    createGradientStops(
      radialGradient,
      [
        [0, "hsla(15, 100%, 50%, 0.4)"],
        [0.5, "hsla(10, 100%, 30%, 0.1)"]
      ]
    )

    context.fillStyle = 'hsl(0, 0%, 0%)';
    context.fillRect(0, 0, width, height);

    context.fillStyle = radialGradient;
    context.fillRect(0, 0, width, height);

    context.fillStyle = linearGradient;
    context.fillRect(0, 0, width, height);

    points.forEach(({ position, barWidth, barHeight, color }) => {
      const [u, v] = position;
      // Lerp takes a min and max, and calculates where a value between 0 and 1 should be within that range
      const x = lerp(0, width, u);
      //const y = lerp(margin, height - margin, v);

      context.save(); // Saves transformation state (all the stuff that comes next)

      context.fillStyle = color;
      context.fillRect(x, height - barHeight + margin, barWidth, barHeight);

      context.restore(); // Restores the canvas to how it was before
    });
  };
};

canvasSketch(sketch, settings);
