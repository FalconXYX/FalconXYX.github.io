var container = document.getElementById("three-container");
var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); // Transparent background
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

container.appendChild(renderer.domElement);

window.addEventListener("resize", onWindowResize, false);

function onWindowResize() {
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
}

var camera = new THREE.PerspectiveCamera(
  35,
  container.clientWidth / container.clientHeight,
  1,
  500
);
var scene = new THREE.Scene();
var cameraRange = 3;

var mouse = new THREE.Vector2();
var polygonSpacing = 0.6;

function onMouseMove(event) {
  const rect = container.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / container.clientHeight) * 2 + 1;
}
container.addEventListener("mousemove", onMouseMove, false);

var modularGruop = new THREE.Object3D();
scene.add(modularGruop);

//------------------------------------------------------------- INIT
function init() {
  const vertexShader = `
    varying vec3 vNormal;
    varying vec3 vPosition;

    void main() {
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    varying vec3 vNormal;
    varying vec3 vPosition;

    uniform vec3 lightDirection;
    uniform vec3 color1;
    uniform vec3 color2;

    void main() {
      float gradient = (vPosition.y + 1.0) / 2.0;
      vec3 baseColor = mix(color1, color2, gradient);

      float lightIntensity = max(dot(vNormal, lightDirection), 0.0);
      vec3 litColor = baseColor * lightIntensity;

      gl_FragColor = vec4(litColor, 1.0);
    }
  `;

  const material = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    uniforms: {
      lightDirection: { value: new THREE.Vector3(1, 1, 1).normalize() },
      color1: { value: new THREE.Color(0.803, 0.125, 0.247) }, // Gradient color 1
      color2: { value: new THREE.Color(0.141, 0.365, 0.627) }, // Gradient color 2
    },
  });

  const positions = [
    { y: polygonSpacing, scale: 0.3 },
    { y: 0, scale: 0.3 },
    { y: -polygonSpacing, scale: 0.3 },
  ];

  for (var i = 0; i < 3; i++) {
    var geometry = new THREE.IcosahedronGeometry(1);

    var cube = new THREE.Mesh(geometry, material);
    cube.castShadow = true;
    cube.receiveShadow = true;

    cube.scale.set(positions[i].scale, positions[i].scale, positions[i].scale);
    cube.position.set(0, positions[i].y, 0);

    cube.rotation.x = Math.random() * Math.PI * 2;
    cube.rotation.z = Math.random() * Math.PI * 2;

    modularGruop.add(cube);
  }
}

//------------------------------------------------------------- CAMERA
camera.position.set(0, 0, cameraRange);
var ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

var directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
directionalLight.position.set(5, 5, 5);
directionalLight.castShadow = true;
scene.add(directionalLight);

//------------------------------------------------------------- RENDER
var uSpeed = 0.1;

function animate() {
  requestAnimationFrame(animate);

  modularGruop.rotation.y -= (-mouse.x * 4 + modularGruop.rotation.y) * uSpeed;

  for (var i = 0, l = modularGruop.children.length; i < l; i++) {
    var newCubes = modularGruop.children[i];
    newCubes.rotation.y += 0.008;
  }

  camera.lookAt(scene.position);
  renderer.render(scene, camera);
}

animate();
init();
