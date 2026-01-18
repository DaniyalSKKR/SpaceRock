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
	window.innerWidth / window.innerHeight,
	0.1,
	1000
);
camera.position.z = 3;

// ---------------------
// Renderer
// ---------------------
const renderer = new THREE.WebGLRenderer({ antialias: true });
// renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);

window.addEventListener("load", () => {
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
	renderer.setSize(container.clientWidth, container.clientHeight);

	camera.aspect = container.clientWidth / container.clientHeight;
	camera.updateProjectionMatrix();
});

// ---------------------
// Orbit Controls
// ---------------------
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// ---------------------
// Lighting
// ---------------------
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5);
scene.add(light);

// ---------------------
// Canvas texture for globe
// ---------------------
const canvas = document.createElement("canvas");
canvas.width = 2048;
canvas.height = 1024;
const ctx = canvas.getContext("2d");

// Create Three.js texture immediately
const dynamicTexture = new THREE.CanvasTexture(canvas);

// Load Earth image
const earthImg = new Image();
earthImg.src = "/static/textures/earth_texture.jpg";
earthImg.onload = () => {
	// Draw Earth immediately
	ctx.drawImage(earthImg, 0, 0, canvas.width, canvas.height);
	dynamicTexture.needsUpdate = true; // show the texture in Three.js
};

// ---------------------
// Globe
// ---------------------
const globeGeometry = new THREE.SphereGeometry(1, 64, 64);
const globeMaterial = new THREE.MeshStandardMaterial({ map: dynamicTexture });
const globe = new THREE.Mesh(globeGeometry, globeMaterial);
scene.add(globe);

// ---------------------
// Raycaster + Mouse
// ---------------------
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// ---------------------
// Marker Image
// ---------------------
const markerImg = new Image();
markerImg.src = "/static/textures/red_circle.png";

// ---------------------
// Click handler → draw marker
// ---------------------
window.addEventListener("click", (event) => {
	mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

	raycaster.setFromCamera(mouse, camera);
	const intersects = raycaster.intersectObject(globe);

	if (!intersects.length) return;

	// Get UV coordinates
	const uv = intersects[0].uv;
	const x = uv.x * canvas.width;
	const y = (1 - uv.y) * canvas.height; // flip Y for canvas

	// Draw marker image centered at clicked position
	const markerSize = 32; // adjust size
	ctx.drawImage(
		markerImg,
		x - markerSize / 2,
		y - markerSize / 2,
		markerSize,
		markerSize
	);

	// Update Three.js texture
	dynamicTexture.needsUpdate = true;
});

// ---------------------
// Handle window resize
// ---------------------
window.addEventListener("resize", () => {
	const width = container.clientWidth;
	const height = container.clientHeight;

	renderer.setSize(width, height);
	camera.aspect = width / height;
	camera.updateProjectionMatrix();
});

// ---------------------
// Animate
// ---------------------
function animate() {
	requestAnimationFrame(animate);
	globe.rotation.y += 0.001;
	controls.update();
	renderer.render(scene, camera);
}
animate();
