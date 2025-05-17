// Selective Three.js imports instead of the entire library
import { 
  Scene,
  PerspectiveCamera, 
  WebGLRenderer,
  TextureLoader,
  AmbientLight,
  DirectionalLight,
  MeshPhongMaterial,
  SphereGeometry,
  Mesh,
  ClampToEdgeWrapping,
  LinearFilter
} from 'three';

// Import only the necessary astronomy functions
import { 
  Observer, 
  Equator, 
  SiderealTime, 
  Libration, 
  MoonPhase, 
  KM_PER_AU 
} from 'astronomy-engine';
import './style.css';

// Paris coordinates
const parisLat = 48.8566;  // degrees north
const parisLon = 2.3522;   // degrees east
const observer = new Observer(parisLat, parisLon, 0);

const baseDate = new Date();
let currentDate = new Date(baseDate);

// Constants for calculations
const KM = 1.0 / 100000;
const AU = KM / KM_PER_AU;

// Set up scene, camera, and renderer
const scene = new Scene();
const camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// Add basic lighting
const ambientLight = new AmbientLight(0x333333);
scene.add(ambientLight);

// Using a significantly brighter directional light
const directionalLight = new DirectionalLight(0xFFFFFF, 4);
scene.add(directionalLight);

let moon; // Reference to the moon mesh

// Calculate parallactic angle of the Moon
function calculateParallacticAngle(date, observer) {
    // Get equatorial coordinates of the Moon
    const equ = Equator('Moon', date, observer, true, true);
    
    // Calculate hour angle in radians
    const hourAngle = SiderealTime(date, observer.longitude) - equ.ra;
    
    // Convert latitude and declination to radians
    const latRad = observer.latitude * Math.PI / 180;
    const decRad = equ.dec * Math.PI / 180;
    const haRad = hourAngle * 15 * Math.PI / 180; // 15 deg per hour
    
    // Calculate parallactic angle
    const numerator = Math.sin(haRad);
    const denominator = Math.tan(latRad) * Math.cos(decRad) - Math.sin(decRad) * Math.cos(haRad);
    
    // Calculate parallactic angle in degrees
    const parallacticAngle = Math.atan2(numerator, denominator) * 180 / Math.PI;
    
    return parallacticAngle;
}

function updateScene() {
    if (!moon) return;
    
    // Get current moon position
    const moonPosition = Libration(currentDate);
    
    // Calculate parallactic angle
    const parallacticAngle = calculateParallacticAngle(currentDate, observer);
    
    // Update moon rotation
    moon.rotation.y = (-moonPosition.elon - 90) * Math.PI / 180;
    moon.rotation.x = moonPosition.elat * Math.PI / 180;
    
    // Update camera position
    camera.position.set(0, 0, moonPosition.dist_km * KM);
    camera.rotation.z = parallacticAngle * Math.PI / 180;
    camera.lookAt(moon.position);
    
    // Update light based on moon phase
    const phase = MoonPhase(currentDate);
    directionalLight.position.set(Math.sin(phase * Math.PI / 180) * AU, 0, -Math.cos(phase * Math.PI / 180) * AU);
    
    // Render the scene
    renderer.render(scene, camera);
}

// Load textures
const textureLoader = new TextureLoader();
Promise.all([
    new Promise((resolve) => {
        textureLoader.load('/assets/moon-texture.webp', (texture) => {
            resolve({ colorTexture: texture });
        });
    }),
    new Promise((resolve) => {
        textureLoader.load('/assets/moon-elevation.webp', (texture) => {
            texture.wrapS = ClampToEdgeWrapping;
            texture.wrapT = ClampToEdgeWrapping;
            texture.minFilter = LinearFilter;
            texture.magFilter = LinearFilter;
            resolve({ heightMap: texture });
        });
    })
]).then((results) => {
    const colorTexture = results[0].colorTexture;
    const heightMap = results[1].heightMap;
    
    const moonMaterial = new MeshPhongMaterial({
        map: colorTexture,
        bumpMap: heightMap,
        bumpScale: 4.0,
        shininess: 0,
    });

    // Create moon
    const moonGeometry = new SphereGeometry(1, 64, 64);

    // Create moon mesh
    moon = new Mesh(moonGeometry, moonMaterial);
    scene.add(moon);
    
    // Initial scene update
    updateScene();
});

// Set up slider functionality
const slider = document.getElementById('time-slider');
slider.addEventListener('input', () => {
    // Calculate new date based on slider position
    const dayOffset = parseFloat(slider.value);
    currentDate = new Date(baseDate.getTime() + dayOffset * 24 * 60 * 60 * 1000);
    
    // Update the date display
    document.getElementById('date-display').textContent = currentDate.toLocaleString();
    
    // Recalculate moon position and update the scene
    updateScene();
});

// Update the date display initially
document.getElementById('date-display').textContent = currentDate.toLocaleString();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    updateScene();
});
