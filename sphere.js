const canvasSketch = require("canvas-sketch");
const createShader = require("canvas-sketch-util/shader");
const glsl = require("glslify"); // Tool to write shader, since it's not Javascript

// Setup our sketch
const settings = {
  context: "webgl", // This specifies that its 3d
  animate: true,
  dimensions: [2048, 2048],
  pixelsPerInch: 300,
};

// Your glsl code. Glsl function is necessary to bring in modules later on
const frag = glsl(/* glsl */ `
  precision highp float;

  uniform float time;
  // Variable passed down from js to determine ratio width / height
  uniform float aspectRatio;
  // vec2 means it has an x and y coordinate
  varying vec2 vUv; // This variable comes from webgl, gives us uv coordinates of surface we're drawing on

// This require works because of glslify
  #pragma glslify: noise = require('glsl-noise/simplex/3d');
  #pragma glslify: hsl2rgb = require('glsl-hsl2rgb');

  void main () { // Every shader has to have main function, here the pixel manipulation is done
  // fragColor is a reserverd word in this shader language

// CODE FOR CIRCLE

//   vec3 colorA = sin(time) + vec3(0.8, 0.4, 0.0) + 0.4;
//   vec3 colorB = vec3(0.0, 0.2, 0.8);
//     // Using vec3 in vec4 creates a gradient

//     // Find center of screen
    vec2 center = vUv - 0.5; // subtracts 0.5 from u and v coordinate
    center.x *= aspectRatio; // Shrink center by aspect ratio
//     // Length: magnitude of the vector
     float distanceFromCenter = length(center);

// // Step function: if first arg is less than second arg return 0, else return 1. Basically like ternary operator.
// // Smoothstep: pass low value, then high value, then the value that you have, which should lie between low and high value.
// // If input value is between low and high value, it returns a value between 0 and 1
     
     // ORIGINAL VALUE
     float alpha = step(distanceFromCenter, 0.3); 

// CODE FOR NOISE

    // coordinate * 2 increases noise frequency (so smaller blobs)
    float n = noise(vec3(center.x * 15.0, center.y * 40.0, time / 2.0)); // noise requires an x y z coordinate

    vec3 color1;

  color1 = hsl2rgb(
    1.05 + n * 0.05, // First number sets base color. Making last number smaller results in fewer color variation
    1.0,
    0.6 + n  * 0.15);

     gl_FragColor = vec4(vec3(color1), alpha);
  }
`);

// Your sketch, which simply returns the shader
const sketch = ({ gl }) => {
  // Create the shader and return it
  return createShader({
    // Sets the background color. Transparent works as well, by setting to false
    clearColor:  false, //"hsl(25, 100%, 50%)",
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
