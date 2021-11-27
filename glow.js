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
    canvas: context.canvas
  });

  // WebGL background color
  renderer.setClearColor("#000", 1);

  // Setup your scene
  const scene = new THREE.Scene();

  // Setup a camera
  const SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
	const VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
  
  const camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
  // TODO: test what happens to glow if camera is closer
  camera.position.set(0, 100, 400);
  camera.lookAt(scene.position);

  // Setup camera controller
  const controls = new THREE.OrbitControls(camera, context.canvas);

  // TODO: check what happens with different light
  const light = new THREE.PointLight(0xffffff);
  light.position.set(0, 250, 0);
  scene.add(light);

  // Setup a geometry
  // TODO: check what happens with smaller dimensions
  const spGeometry = new THREE.SphereGeometry(100, 32, 16);

  // Setup a material
  const material = new THREE.MeshBasicMaterial({
    color: "red"
  });

  // Setup a mesh with geometry + material
  const mesh = new THREE.Mesh(spGeometry, material);

  // TODO: uncomment position (but hopefully not important)
  //mesh.position.set(150, 0, -150);
  scene.add(mesh);

  const customMaterial = new THREE.ShaderMaterial({
    uniforms: {
      constant: { value: 0.4 },
      powerOf: { value: 4.4 },
      glowColor: {value: new THREE.Color('hsl(300, 100%, 50%)') },
      // TODO: possibly we need to transform this
      viewVector: { value: camera.position }
    },
    vertexShader: `uniform vec3 viewVector;
    uniform float constant;
    uniform float powerOf;
    varying float intensity;
    void main() 
    {
        vec3 vNormal = normalize( normalMatrix * normal );
      vec3 vNormel = normalize( normalMatrix * viewVector );
      intensity = pow( constant - dot(vNormal, vNormel), powerOf );
      
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }`,
    fragmentShader: `uniform vec3 glowColor;
    varying float intensity;
    void main() 
    {
      vec3 glow = glowColor * intensity;
        gl_FragColor = vec4( glow, 1.0 );
    }`,
    // TODO: try out different values
    // BackSide helps (but not for shader opaque material i quee)
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    transparent: true
  });

  const glow = new THREE.Mesh(spGeometry, customMaterial);
  // TODO: try different values
  glow.scale.multiplyScalar(1.3);
  scene.add(glow);

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
