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
  //const geometry = new THREE.BoxGeometry(1, 1, 1);
  const geometry = new THREE.SphereGeometry(1, 32, 32);

  const meshes = [];

  const fragmentShader = glslify(`
  varying vec2 vUv;

   uniform vec3 color;
   uniform float playhead;
   uniform float time;

   #pragma glslify: noise = require('glsl-noise/simplex/3d');

    void main () {
      float offset = 1.0 * noise(vec3(vUv.xy * 4.0, time / 2.0));

      gl_FragColor = vec4(vec3(color * vUv.x + offset), 1.0);
    }
  `);

  // DOing pos.xyz in vec4 times something > 1.0 makes it more spiky
  const vertexShader = glslify(`
  varying vec2 vUv;

  uniform float playhead;

  #pragma glslify: noise = require('glsl-noise/simplex/4d');

    void main () {
      vUv = uv;
      vec3 pos = position.xyz;

      // * 0.1 makes outer surface more round we scaled down the noice values
      // We can duplicate this with different valuesto make more interesting textures
      pos += 0.1 * normal * noise(vec4(pos.xyz * 4.0, playhead));
      pos += 0.5 * normal * noise(vec4(pos.xyz * 10.0, playhead));

      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `);

  // Setup multiple meshes with geometry + material
  for (let i = 0; i < 1; i++) {
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
        playhead: { value: 0 },
        color: {
          value: new THREE.Color(`hsl(${Math.random() * 360}, 100%, 50%)`), // If i want to remove shader and return to normal, simply place color in 'color' property above roughness
        },
      },
      roughness: 0.75,
      flatShading: true,
    });

    const mesh = new THREE.Mesh(geometry, material);

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
      const zoom = 2.0;

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
    render({ playhead, time }) {
      // controls.update();
      scene.rotation.y = Math.sin(time) + 0.75;

      meshes.forEach((mesh) => {
        mesh.material.uniforms.time.value = time;
        mesh.material.uniforms.playhead.value = playhead;
      });

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
