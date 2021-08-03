const canvasSketch = require("canvas-sketch");
const createShader = require("canvas-sketch-util/shader");
const glsl = require("glslify"); // Tool to write shader, since it's not Javascript

// Setup our sketch
const settings = {
  context: "webgl", // This specifies that its 3d
  animate: true,
};

// Your glsl code. Glsl function is necessary to bring in modules later on
const frag = glsl(/* glsl */ `
  precision highp float;

  uniform float time;
  // Variable passed down from js to determine ratio width / height
  uniform float aspectRatio;
  // vec2 means it has an x and y coordinate
  varying vec2 vUv; // This variable comes from webgl, gives us uv coordinates of surface we're drawing on

  void main () { // Every shader has to have main function, here the pixel manipulation is done
  // fragColor is a reserverd word in this shader language
  // Vec4 syntax: r, g, b, alpha
  // gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); // You NEED to put a decimal point if they're floats, otherwise it might error
  // Gradient example: vec3(vUv.x, vUv.x + 0.2, vUv.x + 0.3)
  // vec with 1 value fills all 3 params with that value
  // vec3 color = vec3(sin(time) + 1.0 * vUv.x); // Time is in seconds, sin(time) is between -1 and 1

  vec3 colorA = sin(time) + vec3(0.8, 0.4, 0.0) + 0.4;
  vec3 colorB = vec3(0.0, 0.2, 0.8);
    // Using vec3 in vec4 creates a gradient

    // Find center of screen
    vec2 center = vUv - 0.5; // subtracts 0.5 from u and v coordinate
    center.x *= aspectRatio; // Shrink center by aspect ratio
    // Length: magnitude of the vector
    float distanceFromCenter = length(center);

// Step function: if first arg is less than second arg return 0, else return 1. Basically like ternary operator.
// Smoothstep: pass low value, then high value, then the value that you have, which should lie between low and high value.
// If input value is between low and high value, it returns a value between 0 and 1
    float alpha = smoothstep(0.355, 0.350, distanceFromCenter); 

  // Mix is a glsl function, you can specify the colors you want to mix between. Its like lerp, with min max and value between 0-1 that gives value in between
    vec3 color = mix(colorA, colorB, vUv.x + vUv.y * sin(time));
    gl_FragColor = vec4(color, alpha); // Use alpha to create circle
  }
`);

// Your sketch, which simply returns the shader
const sketch = ({ gl }) => {
  // Create the shader and return it
  return createShader({
    // Sets the background color. Transparent works as well, by setting to false
    clearColor: "white",
    // Pass along WebGL context
    gl,
    // Specify fragment and/or vertex shader strings
    frag,
    // Specify additional uniforms to pass down to the shaders
    uniforms: {
      // A uniform is a variable from js inside of our shader
      // Expose props from canvas-sketch
      time: ({ time }) => time,
      aspectRatio: ({ width, height }) => width / height,
    },
  });
};

canvasSketch(sketch, settings);
