// Ensure ThreeJS is in global scope for the 'examples/'
global.THREE = require("three");

// Include any additional ThreeJS examples below
require("three/examples/js/controls/OrbitControls");

const canvasSketch = require("canvas-sketch");

const settings = {
  // Make the loop animated
  animate: true,
  // Get a WebGL canvas rather than 2D
  context: "webgl"
};

const sketch = ({ context }) => {
  // Create a renderer
  const renderer = new THREE.WebGLRenderer({
    canvas: context.canvas,
    alpha: true
  });

  // WebGL background color
  //renderer.setClearColor("#000", 1);

  // Setup a camera
  const camera = new THREE.PerspectiveCamera(50, 1, 0.01, 100);
  camera.position.set(0, 0, -4);
  camera.lookAt(new THREE.Vector3());

  // Setup camera controller
  const controls = new THREE.OrbitControls(camera, context.canvas);

  // Setup your scene
  const scene = new THREE.Scene();

  // Setup a geometry
  const geometry = new THREE.SphereGeometry(1, 64, 32);

  const vertexShader = /* glsl */`
    varying vec2 vUv;
    void main () {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position.xyz, 1.0);
    }
  `;

  const fragmentShader = /* glsl */`
    varying vec2 vUv;
    uniform float time;
    uniform vec3 color;

    void main () {
      vec2 center = vec2(0.5, 0.5);
      vec2 scaledPositions = vUv;
      scaledPositions.x *= 2.0;
      vec2 pos = mod(scaledPositions * 8.0, 1.0); // mod = modulo, but it makes sure it's alwyas a value between 0 and 1

      float dist = distance(pos, center); // distance is built in function of glsl, gives Euclidean distance between 2 coordinates
      
      // This gives a cool animation effect
      // float mask = step(0.4 * sin(time * 1.5 + vUv.x * 5.0) + 0.15 * sin(time * 3.5 + vUv.y * 7.0), dist);
      // gl_FragColor = vec4(mask, 0.5 * sin(time) * vUv.y + 0.3, 0.6 * sin(time) * vUv.x + 0.6, 1.0); 

      float mask = step(0.25 + sin(time + vUv.x * 5.0) * 0.25, dist);
      mask = 1.0 - mask;
      vec3 fragColor = mix(color, vec3(0.1, 0.8, 1.0), mask); //BUilt in function that takes two colors and switches between the colors using the mask

      gl_FragColor = vec4(vec3(fragColor), 1.0); 
    }
  `;

  // Setup a material
  const material = new THREE.ShaderMaterial({
    // wireframe: true
    uniforms: {
      time: { value: 0 },
      color: { value: new THREE.Color('tomato') } // This is just an example, im not using it
    },
    vertexShader,
    fragmentShader
  });

  // Setup a mesh with geometry + material
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  // draw each frame
  return {
    // Handle resize events here
    resize({ pixelRatio, viewportWidth, viewportHeight }) {
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(viewportWidth, viewportHeight, false);
      camera.aspect = viewportWidth / viewportHeight;
      camera.updateProjectionMatrix();
    },
    // Update & render your scene here
    render({ time }) {
      material.uniforms.time.value = time;
      controls.update();
      renderer.render(scene, camera);
    },
    // Dispose of events & renderer for cleaner hot-reloading
    unload() {
      controls.dispose();
      renderer.dispose();
    }
  };
};

canvasSketch(sketch, settings);

document.querySelector('body').style.backgroundImage = 'linear-gradient(hsl(330, 50%, 20%), hsl(210, 50%, 20%))'
