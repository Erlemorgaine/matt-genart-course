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

  const dotGeom = new THREE.CircleGeometry(1, 32);

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

  points.forEach((point) => {
    const pointMesh = new THREE.Mesh(dotGeom, 
      new THREE.MeshBasicMaterial({
        color: 'white',
        // Default is frontside, so it only colors one face of the circle
        side: THREE.DoubleSide
      }));

      // This also gives a nice effect, it pushes the points outwards
      //pointMesh.position.copy(point).multiplyScalar(1.5);
      pointMesh.position.copy(point);
      pointMesh.scale.setScalar(0.2 * Math.random());

      // This is turning all the meshes towards the center (0, 0, 0) and makes them look flat
      pointMesh.lookAt(new THREE.Vector3());
      scene.add(pointMesh);
  });

  const vertexShader = /* glsl */`
    varying vec2 vUv;
    void main () {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position.xyz, 1.0);
    }
  `;

  const fragmentShader = glsl(/* glsl */`
    #pragma glslify: noise = require('glsl-noise/simplex/3d');

    varying vec2 vUv;
    uniform float time;
    uniform vec3 color;

    void main () {
      // THIS IS ALL SPHERE CODE

      // vec2 center = vec2(0.5, 0.5);
      // vec2 scaledPositions = vUv;
      // scaledPositions.x *= 2.0;
      // vec2 pos = mod(scaledPositions * 8.0, 1.0); // mod = modulo, but it makes sure it's alwyas a value between 0 and 1

      // float dist = distance(pos, center); // distance is built in function of glsl, gives Euclidean distance between 2 coordinates
      
      // // This gives a cool animation effect
      // // float mask = step(0.4 * sin(time * 1.5 + vUv.x * 5.0) + 0.15 * sin(time * 3.5 + vUv.y * 7.0), dist);
      // // gl_FragColor = vec4(mask, 0.5 * sin(time) * vUv.y + 0.3, 0.6 * sin(time) * vUv.x + 0.6, 1.0); 

      // // This also makes a nice, more simple animation
      // //float mask = step(0.25 + sin(time + vUv.x * 5.0) * 0.25, dist);
      
      // // We use the same multiplication here as we used in our modulo (in pos variable)
      // // We floor to revert weird shapes back to circles.
      // // This is becausefloor makes sure to act only on the center point of the circe, instead of on every single pixel of the circle region
      // vec2 noiseInput = floor(scaledPositions * 8.0); 

      // // Use vUv and multiply by other float within vec3 to get crazy effects (optionally change the last multiplification float)
      // // We multiply by a small value, since sometimes the offset can be so large that there will be a clipping effect (you'll see squares)
      // float offset = noise(vec3(noiseInput.xy * 1.0, time * 0.5)) * 0.3;
      // float mask = step(0.25 + offset, dist);

      // mask = 1.0 - mask;
      // vec3 fragColor = mix(color, vec3(0.1, 0.8, 1.0), mask); //BUilt in function that takes two colors and switches between the colors using the mask

      // gl_FragColor = vec4(vec3(fragColor), 1.0); 


      //  THIS IS ICOSAHEDRON CODE
      gl_FragColor = vec4(vec3(color), 1.0); 
    }
  `);

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
