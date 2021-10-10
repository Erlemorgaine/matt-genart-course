const canvasSketch = require("canvas-sketch");
const { lerp } = require("canvas-sketch-util/math");
const random = require("canvas-sketch-util/random");

const settings = {
  dimensions: [2048, 1536],
  pixelsPerInch: 300,
};

const sketch = () => {
  const createGrid = () => {
    const points = [];
    const count = 6;

    for (let x = 0; x < count; x++) {
      for (let y = 0; y < count; y++) {
        // For now we are working in uv space instead of pixel values
        const u = x / (count - 1);
        const v = y / (count - 1);
        points.push({
          color:
            x === 3 && y === 3
              ? "hsla(35, 100%, 50%, 0.6)"
              : random.pick([
                  `hsla(${Math.abs(random.noise2D(u, v)) * 40 + 180}, 100%, ${
                    random.value() * 100
                  }%, ${Math.abs(random.noise2D(u, v))})`,
                ]),
          radius: Math.abs(random.gaussian()) * 0.005,
          rotation: random.noise2D(u, v),
          position: [u, v],
          fillSymbol: ["︑"][0],
        });
      }
    }

    return points;
  };

  const points = createGrid().filter(() => random.value() > 0.5);
  const margin = 30;

  return ({ context, width, height }) => {
    // Fill the canvas with white
    const linearGradient = context.createLinearGradient(
      1000,
      height + 500,
      width - 20,
      0
    );

    linearGradient.addColorStop(0, "hsl(200, 100%, 0%)");
    linearGradient.addColorStop(0.33, "hsl(200, 100%, 50%)");
    linearGradient.addColorStop(0.67, "hsl(200, 100%, 100%)");
    linearGradient.addColorStop(1, "hsl(200, 100%, 50%)");

    const radialGradient = context.createLinearGradient(
      width / 2,
      height / 2,
      width / 4,
      width / 2,
      height / 2,
      width
    );

    radialGradient.addColorStop(0, "hsla(160, 100%, 50%, 0.4)");
    radialGradient.addColorStop(0.5, "hsla(170, 100%, 30%, 0.4)");

    context.fillStyle = linearGradient;
    context.fillRect(0, 0, width, height);

    context.fillStyle = radialGradient;
    context.fillRect(0, 0, width, height);

    points.forEach(({ position, radius, color, rotation }) => {
      const [u, v] = position;
      const x = lerp(margin, width - margin, u);
      const y = lerp(margin, height - margin, v);

      context.save(); // Saves transformation state (all the stuff that comes next)

      // context.beginPath();
      // context.arc(x, y, radius * width, 0, Math.PI * 2, false);

      context.beginPath();
      context.moveTo(random.gaussian() * x, random.gaussian() * y);
      context.quadraticCurveTo(
        random.gaussian() * width,
        random.gaussian() * height,
        random.gaussian() * width + 1000,
        random.gaussian() * height + 1000
      );
      context.strokeStyle = ""; // transparent
      context.stroke();

      context.fillStyle = color;
      context.fill();
      context.translate(x, y); // We need this to rotate from the grid point instead of from 0, 0. This sets the origin point
      context.rotate(rotation);
      context.restore(); // Restores the canvas to how it was before
    });
  };
};

canvasSketch(sketch, settings);
