import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// ---------------------
// Container & Scene
// ---------------------
const container = document.getElementById("three-container");
const scene = new THREE.Scene();

// ---------------------
// Camera
// ---------------------
const camera = new THREE.PerspectiveCamera(
	75,
	container.clientWidth / container.clientHeight,
	0.1,
	1000,
);
camera.position.z = 3;

// ---------------------
// Renderer
// ---------------------
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

renderer.domElement.style.position = "absolute";
renderer.domElement.style.zIndex = "1";
container.appendChild(renderer.domElement);

// ---------------------
// Controls
// ---------------------
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// ---------------------
// Lighting (balanced + realistic)
// ---------------------

// Sun light
const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
sunLight.position.set(5, 3, 5);
sunLight.castShadow = true;
scene.add(sunLight);

// Soft space bounce
scene.add(new THREE.AmbientLight(0x111822, 0.12));

// Rim light to reveal night side silhouette
const rimLight = new THREE.DirectionalLight(0x6677aa, 0.22);
rimLight.position.set(-5, 0, -5);
scene.add(rimLight);

// ---------------------
// Paths
// ---------------------
const PATHS = window.APP_CONFIG || {
	EARTH_TEXTURE: "/src/assets/earth_texture.jpg",
	SPACE_TEXTURE: "/src/assets/stars_texture.jpg",
	MARKER_IMAGE: "/src/assets/red_circle.png",
};

// ---------------------
// Texture Loader
// ---------------------
const loader = new THREE.TextureLoader();

const earthTexture = loader.load(PATHS.EARTH_TEXTURE);
earthTexture.colorSpace = THREE.SRGBColorSpace;

const spaceTexture = loader.load(PATHS.SPACE_TEXTURE);
spaceTexture.colorSpace = THREE.SRGBColorSpace;

// ---------------------
// Space background sphere
// ---------------------
const space = new THREE.Mesh(
	new THREE.SphereGeometry(50, 64, 64),
	new THREE.MeshBasicMaterial({
		map: spaceTexture,
		side: THREE.BackSide,
	}),
);
scene.add(space);

// ---------------------
// Earth Globe
// ---------------------
const globeGeometry = new THREE.SphereGeometry(1, 64, 64);

const globeMaterial = new THREE.MeshStandardMaterial({
	map: earthTexture,
	roughness: 1,
	metalness: 0,
});

const globe = new THREE.Mesh(globeGeometry, globeMaterial);
globe.castShadow = true;
globe.receiveShadow = true;
scene.add(globe);

// ---------------------
// Atmosphere shell
// ---------------------
const atmosphereMaterial = new THREE.ShaderMaterial({
	vertexShader: `
    varying vec3 vNormal;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
	fragmentShader: `
    varying vec3 vNormal;
    void main() {
      float intensity = pow(0.6 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
      gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity;
    }
  `,
	blending: THREE.AdditiveBlending,
	side: THREE.BackSide,
	transparent: true,
});

const atmosphere = new THREE.Mesh(
	new THREE.SphereGeometry(1.05, 64, 64),
	atmosphereMaterial,
);
scene.add(atmosphere);

// ---------------------
// Resize handling
// ---------------------
window.addEventListener("resize", () => {
	const w = container.clientWidth;
	const h = container.clientHeight;
	renderer.setSize(w, h);
	camera.aspect = w / h;
	camera.updateProjectionMatrix();
});

// ---------------------
// Animate
// ---------------------
function animate() {
	requestAnimationFrame(animate);

	globe.rotation.y += 0.001;
	atmosphere.rotation.y += 0.001;

	controls.update();
	renderer.render(scene, camera);
}
animate();
