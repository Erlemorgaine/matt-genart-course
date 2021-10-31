// Ensure ThreeJS is in global scope for the 'examples/'
global.THREE = require("three");

// Include any additional ThreeJS examples below
require("three/examples/js/controls/OrbitControls");

const canvasSketch = require("canvas-sketch");
const glsl = require('glslify');
const Random = require('canvas-sketch-util/random');

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
  const geometry = new THREE.SphereGeometry(1, 32, 16);

  const baseIcoGeom = new THREE.IcosahedronGeometry(1, 1); // Params: radius, detail. Detail shouldnt be too high poly

  // This is different from the tutorial, which uses the deprecated baseIcoGeom.vertices
  let points = baseIcoGeom.attributes.position.array;

  points = points.reduce((prevVertex, netPoint, index) => {
    const verticesLastIndex = prevVertex.length - 1;

    if (index % 3 === 0) {
      const vertex = new THREE.Vector3(netPoint);
      prevVertex.push(vertex)
    } else if (index % 3 === 1) {
      prevVertex[verticesLastIndex].y = netPoint;
    } else {
      prevVertex[verticesLastIndex].z = netPoint;
    }
    return prevVertex;
  }, [])

  const vertexShader = /* glsl */`
    varying vec2 vUv;
    varying vec3 vPosition;

    void main () {
      vUv = uv;
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position.xyz, 1.0);
    }
  `;

  const fragmentShader = glsl(/* glsl */`
    #pragma glslify: noise = require('glsl-noise/simplex/3d');
    #pragma glslify: aastep = require('glsl-aastep');
    #pragma glslify: random = require('glsl-random');

    varying vec2 vUv;
    varying vec3 vPosition;

    uniform float time;
    uniform vec3 color;
    uniform vec3 points[POINT_COUNT];

    // Introduce rim lighting

    uniform mat4 modelMatrix;

    // It might be more efficient to move this to the vertex shader and then pass it down to the fragment shader, since the vertex shaderknows how to do this in a more optimized way
    float sphereRim (vec3 spherePosition) {
      vec3 normal = normalize(spherePosition.xyz);
      vec3 worldNormal = normalize(mat3(modelMatrix) * normal.xyz);
      vec3 worldPosition = (modelMatrix * vec4(spherePosition, 1.0)).xyz;
      vec3 V = normalize(cameraPosition - worldPosition);
      float rim = 1.0 - max(dot(V, worldNormal), 0.0);
      return pow(smoothstep(0.0, 1.0, rim), 0.5);
    }

    void main () {
      float dist = 100000.0;

      // This is not so efficient, because you loop over all points for every pixel.
      // For a more efficient approach, see repo
      for (int i = 0; i < POINT_COUNT; i++) {
        vec3 p = points[i];
        // Get distance between pixel position and icosahedron point position
        float distPoint = distance(vPosition, p);

        // Set dist to the minimum value of these two, in this case in the end you'll
        // have the distance to the closest icosahedron point
        dist = min(distPoint, dist);
      }

      dist;

      // This gives a blur / noise effect for the circles
      //float mask = aastep(random(vec2(vUv.x)) * 0.2, dist);

      // This sets the circles all to the same size
      // float mask = aastep(0.2, dist);

      float mask = aastep(vUv.y * 0.3, dist);
      mask = 1.0 - mask;

      vec3 fragColor = mix(color, vec3(0.6, 0.8, 1.0), mask);

      // Add rim lighting
      float rim = sphereRim(vPosition);
      fragColor += rim * 0.2;

      gl_FragColor = vec4(vec3(fragColor), 1.0); 

      // This makes sure of not drawing the pixel if condition true
      // Needs THREE.DoubleSide to see through circles / see only circles 
      if (mask < 0.5) discard;
    }
  `);

  // Setup a material
  const material = new THREE.ShaderMaterial({
    defines: {
      POINT_COUNT: points.length
    },
    // This is necessary to make aastep work
    extensions:{
      derivatives: true
    },
    uniforms: {
      time: { value: 0 },
      color: { value: new THREE.Color('tomato') },
      points: { value: points }
    },
    side: THREE.DoubleSide,
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
      mesh.rotation.y = time * 0.25;
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

// We can make this artwork more intersting by looping over the pumpkins and placing them in different positions, different sizes.
// When you do this you can duplicate the materials, but USE THE SAME GEOMETRY!

canvasSketch(sketch, settings);

document.querySelector('body').style.backgroundImage = 'linear-gradient(hsl(330, 50%, 20%), hsl(210, 50%, 20%))'
