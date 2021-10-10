// Ensure ThreeJS is in global scope for the 'examples/'
global.THREE = require("three");

// Include any additional ThreeJS examples below
require("three/examples/js/controls/OrbitControls");

const canvasSketch = require("canvas-sketch");

const settings = {
  //dimensions: "A4",
  pixelsPerInch: 72,
  // Make the loop animated
  animate: true,
  // Get a WebGL canvas rather than 2D
  context: "webgl",
};

const sketch = ({ context }) => {
  // Create a renderer
  const renderer = new THREE.WebGLRenderer({
    canvas: context.canvas,
  });

  // WebGL background color
  renderer.setClearColor("#000", 1);

  // Setup a camera
  // Params:
  // field of view, in degrees.The higher the value, the more itll be stretched out
  // Aspect ratio
  // Near, will clip object based on how close it is to the camera
  // Far, will clip object based on how faraway it is from the camera
  const camera = new THREE.PerspectiveCamera(70, 1, 0.01, 100);
  // Setting position of camera from xyz
  camera.position.set(0, 0, -6);
  camera.lookAt(new THREE.Vector3());

  // Setup camera controller, makes it interactive
  const controls = new THREE.OrbitControls(camera, context.canvas);

  // Setup your scene
  const scene = new THREE.Scene();

  // Setup a geometry
  const geometry = new THREE.SphereGeometry(1, 44, 88);

  const textureLoader = new THREE.TextureLoader();
  const splashPaintTexture = textureLoader.load("world-drop.jpg");

  // Setup a material
  const material = new THREE.MeshStandardMaterial({
    // color: "hsl(200, 50%, 70%)",
    // wireframe: true,
    roughness: 1,
    metalness: 0,
    map: splashPaintTexture,
  });

  // Setup a mesh with geometry + material
  const earthMesh = new THREE.Mesh(geometry, material);
  scene.add(earthMesh);

  const planets = [];
  const planetGroup = new THREE.Group();

  for (let i = 0; i < 20; i++) {

    
    const planetMaterial = new THREE.MeshStandardMaterial({
      color: `hsl(${Math.random() * 300}, 50%, 50%)`,
      roughness: 1,
      metalness: 0,
    });

    const odd = i % 2 === 1;

    const planetMesh = new THREE.Mesh(geometry, planetMaterial);
    planetMesh.position.set(
      Math.random() * (odd ? 2.5 : -2.5),
      Math.random() * (odd ? 2 : -2),
      Math.random() * (odd ? 3 : -3)
    );
    planetMesh.scale.setScalar(Math.random() / 2.5);
    planets.push(planetMesh);
    planetGroup.add(planetMesh);
    
  }

  scene.add(planetGroup);

  // We can also add the light to the planet group, or to its own group
  const light = new THREE.PointLight('hsl(0, 100%, 100%)');
  light.position.set(0, 1, -3);

  scene.add(light);

// THis is really cool, it shows where the light is placed
  //scene.add(new THREE.PointLightHelper(light, 0.1));

  // This helps you see the grid and axes
  // scene.add(new THREE.GridHelper(5, 15));
  // scene.add(new THREE.AxesHelper(3));

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
      earthMesh.rotation.x = time * 0.3;
      earthMesh.rotation.y = time * 0.3;
      planetGroup.rotation.y = time * 0.1;
      planets.forEach((planet) => (planet.rotation.x = time * 0.1));

      controls.update();
      renderer.render(scene, camera);
    },
    // Dispose of events & renderer for cleaner hot-reloading
    unload() {
      controls.dispose();
      renderer.dispose();
    },
  };
};

canvasSketch(sketch, settings);
