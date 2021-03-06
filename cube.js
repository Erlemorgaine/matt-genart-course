// Ensure ThreeJS is in global scope for the 'examples/'
global.THREE = require("three");

// Include any additional ThreeJS examples below
require("three/examples/js/controls/OrbitControls");

const canvasSketch = require("canvas-sketch");

const { OrthographicCamera } = require("three");

const glslify = require("glslify");

const settings = {
  // Make the loop animated
  animate: true,
  // Get a WebGL canvas rather than 2D
  context: "webgl",
  pixelsPerInch: 300,
  attributes: { antialias: true },
};

const sketch = ({ context }) => {
  // Create a renderer
  const renderer = new THREE.WebGLRenderer({
    canvas: context.canvas,
  });

  // WebGL background color
  renderer.setClearColor("#000", 1);

  // Setup a camera
  // const camera = new THREE.PerspectiveCamera(50, 1, 0.01, 100);
  // camera.position.set(3, 2, -3);
  // camera.lookAt(new THREE.Vector3());

  const camera = new OrthographicCamera();

  // Setup camera controller
  // const controls = new THREE.OrbitControls(camera, context.canvas);

  // Setup your scene
  const scene = new THREE.Scene();

  // Setup a geometry
  // COmmented line is for cubes
  const geometry = new THREE.BoxGeometry(1, 1, 1);

  const meshes = [];

  const fragmentShader = `
  varying vec2 vUv;

   uniform vec3 color;

    void main () {
      gl_FragColor = vec4(vec3(color * (vUv.x + 0.5)), 1.0);
    }
  `;

  const vertexShader = glslify(`
  varying vec2 vUv;

  uniform float time;

  #pragma glslify: noise = require('glsl-noise/simplex/4d');

    void main () {
      vUv = uv;
      vec3 pos = position.xyz;
      pos += normal * noise(vec4(position.xyz, time));
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `);

  // Setup multiple meshes with geometry + material
  for (let i = 0; i < 40; i++) {
    // Setup a material.
    // - When you do BasicMaterial, it will work without lighting in the scene
    // - MeshPhysicalMaterial adds lighting
    // ShaderMaterial
    // RawShaderMaterial is for more advanced uses, if you don't want Three.js to do anything helpful
    const material = new THREE.ShaderMaterial({
      fragmentShader,
      vertexShader,
      uniforms: {
        time: { value: 0 },
        color: {
          value: new THREE.Color(`hsl(${180 + Math.random() * 200}, 100%, ${(Math.random() * 50 + 20).toFixed(0)}%)`), // If i want to remove shader and return to normal, simply place color in 'color' property above roughness
        },
      },
      roughness: 0.75,
      flatShading: true,
    });

    const mesh = new THREE.Mesh(geometry, material);

    mesh.position.set(
      Math.random() * 2 - 1,
      Math.random() - 1,
      Math.random() - 1
    );

    // TO MANIPULATE SCALES of xyz, add mesh.scale.set (like mesh)

    mesh.scale.multiplyScalar(Math.random() * 0.2); // will multiply x, y, z by same number value
    scene.add(mesh);
    meshes.push(mesh);
  }

  // Add lighting to the whole scene. Without this, the PhysicalMaterial won't show

  scene.add(new THREE.AmbientLight(`hsl(200, 0%, 60%)`));

  // Takes care of lighting differently for different planes of the cube
  //const light = new THREE.PointLight('#45caf7', 1, 25) // color, intensity, distance
  const light = new THREE.DirectionalLight("hsl(360, 80%, 50%)", 1);
  light.position.set(2, 2, -4);
  scene.add(light);

  // draw each frame
  return {
    // Handle resize events here
    resize({ pixelRatio, viewportWidth, viewportHeight }) {
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(viewportWidth, viewportHeight, false);

      // This is all boilerplate for the orthographic camera
      const aspect = viewportWidth / viewportHeight;

      // Ortho zoom
      const zoom = 1.0;

      // Bounds
      camera.left = -zoom * aspect;
      camera.right = zoom * aspect;
      camera.top = zoom;
      camera.bottom = -zoom;

      // Near/Far
      camera.near = -100;
      camera.far = 100;

      // Set position & look at world center
      camera.position.set(zoom, zoom, zoom);
      camera.lookAt(new THREE.Vector3());

      // Update the camera
      camera.updateProjectionMatrix();
    },
    // Update & render your scene here
    render({ time }) {
      // controls.update();
      scene.rotation.y = Math.sin(time) + 0.75;

      meshes.forEach((mesh) => (mesh.material.uniforms.time.value = time));

      renderer.render(scene, camera);
    },
    // Dispose of events & renderer for cleaner hot-reloading
    unload() {
      // controls.dispose();
      renderer.dispose();
    },
  };
};

canvasSketch(sketch, settings);
