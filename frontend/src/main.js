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
	new THREE.SphereGeometry(1.08, 64, 64), // slightly larger than earth
	atmosphereMaterial,
);
atmosphere.renderOrder = 1;
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
// Helper: Convert lat/lng to 3D position on globe
function latLngToVector3(lat, lng, radius = 1) {
	const phi = (90 - lat) * (Math.PI / 180);
	const theta = (lng + 180) * (Math.PI / 180);
	return new THREE.Vector3(
		-radius * Math.sin(phi) * Math.cos(theta),
		radius * Math.cos(phi),
		radius * Math.sin(phi) * Math.sin(theta),
	);
}

// ---------------------
// Fetch scenario data and visualize

// Remove old markers/circles before adding new ones
function clearGlobeMarkers() {
	for (let i = globe.children.length - 1; i >= 0; i--) {
		globe.remove(globe.children[i]);
	}
}

// Helper: Create a curved circle (band) on the sphere
function createCurvedCircle({ lat, lng, radius, color, opacity = 1.0 }) {
	const segments = 180;
	const points = [];
	for (let i = 0; i <= segments; i++) {
		const angle = (i / segments) * 2 * Math.PI;
		// Offset each point by the circle's radius from the impact center
		// Find the point at (lat, lng) and then move out by 'radius' km along the local tangent
		// This is done by calculating a new lat/lng at a fixed distance from the center
		// Haversine formula for small circles:
		const earthRadius = 1; // our globe's radius
		const angularRadius = radius / earthRadius; // in radians (radius is in globe units)
		const latRad = THREE.MathUtils.degToRad(lat);
		const lngRad = THREE.MathUtils.degToRad(lng);
		const pointLat = Math.asin(
			Math.sin(latRad) * Math.cos(angularRadius) +
				Math.cos(latRad) * Math.sin(angularRadius) * Math.cos(angle),
		);
		const pointLng =
			lngRad +
			Math.atan2(
				Math.sin(angle) * Math.sin(angularRadius) * Math.cos(latRad),
				Math.cos(angularRadius) - Math.sin(latRad) * Math.sin(pointLat),
			);
		const v = latLngToVector3(
			THREE.MathUtils.radToDeg(pointLat),
			THREE.MathUtils.radToDeg(pointLng),
			1.001, // just above the surface
		);
		points.push(v);
	}
	const curve = new THREE.BufferGeometry().setFromPoints(points);
	const mat = new THREE.LineBasicMaterial({
		color,
		transparent: true,
		opacity,
	});
	return new THREE.Line(curve, mat);
}

function visualizeScenarioOnGlobe({
	impact_coordinates,
	transient_diameter,
	affected_radius,
}) {
	clearGlobeMarkers();
	if (!impact_coordinates) return;
	// Place marker at impact point (as child of globe)
	const markerRadius = 0.012; // slightly smaller for clarity
	const markerGeom = new THREE.SphereGeometry(markerRadius, 16, 16);
	const markerMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
	// Place marker exactly on the surface
	const markerPos = latLngToVector3(
		impact_coordinates.lat,
		impact_coordinates.lng,
		1.0,
	);
	const marker = new THREE.Mesh(markerGeom, markerMat);
	marker.position.copy(markerPos);
	globe.add(marker);

	// Draw transient diameter (crater) as a curved band
	const earthDiameter = 12742; // km
	const craterRadiusKm = transient_diameter / 2;
	const craterRadiusGlobe = craterRadiusKm / (earthDiameter / 2); // in globe units
	if (craterRadiusGlobe > 0) {
		const craterCircle = createCurvedCircle({
			lat: impact_coordinates.lat,
			lng: impact_coordinates.lng,
			radius: craterRadiusGlobe,
			color: 0xffa500,
			opacity: 0.7,
		});
		globe.add(craterCircle);
	}

	// Draw affected diameter (area) as a curved band
	const affectedRadiusKm = affected_radius;
	const affectedRadiusGlobe = affectedRadiusKm / (earthDiameter / 2);
	if (affectedRadiusGlobe > 0) {
		const affectedCircle = createCurvedCircle({
			lat: impact_coordinates.lat,
			lng: impact_coordinates.lng,
			radius: affectedRadiusGlobe,
			color: 0x00ffff,
			opacity: 0.4,
		});
		globe.add(affectedCircle);
	}
}

// Expose for dashboard.html
window.visualizeScenarioOnGlobe = visualizeScenarioOnGlobe;

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
