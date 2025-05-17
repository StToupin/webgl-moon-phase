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
  LinearFilter,
  Texture,
} from 'three';
import { Libration, MoonPhase, KM_PER_AU } from 'astronomy-engine';
import { currentDate } from './date';
import { location } from './location';
import { calculateParallacticAngle } from './utils';

// Constants for calculations
const KM = 1.0 / 100000;
const AU = KM / KM_PER_AU;

export type SceneObjects = {
  scene: Scene;
  camera: PerspectiveCamera;
  renderer: WebGLRenderer;
  moon: Mesh<SphereGeometry, MeshPhongMaterial> | null;
  directionalLight: DirectionalLight;
};

export function updateScene(objects: SceneObjects): void {
  if (!objects.moon) return;

  // Get current moon position
  const moonPosition = Libration(currentDate);

  // Calculate parallactic angle
  const parallacticAngle = calculateParallacticAngle(currentDate, location);

  // Update moon rotation
  objects.moon.rotation.y = ((-moonPosition.elon - 90) * Math.PI) / 180;
  objects.moon.rotation.x = (moonPosition.elat * Math.PI) / 180;

  // Update camera position
  objects.camera.position.set(0, 0, moonPosition.dist_km * KM);
  objects.camera.rotation.z = (parallacticAngle * Math.PI) / 180;
  objects.camera.lookAt(objects.moon.position);

  // Update light based on moon phase
  const phase = MoonPhase(currentDate);
  objects.directionalLight.position.set(
    Math.sin((phase * Math.PI) / 180) * AU,
    0,
    -Math.cos((phase * Math.PI) / 180) * AU
  );

  // Render the scene
  objects.renderer.render(objects.scene, objects.camera);
}

async function loadTextures(): Promise<{ colorTexture: Texture; elevationTexture: Texture }> {
  const textureLoader = new TextureLoader();
  const colorTexture = await textureLoader.load('/assets/moon-texture.webp');
  const elevationTexture = await textureLoader.load('/assets/moon-elevation.webp');
  elevationTexture.wrapS = ClampToEdgeWrapping;
  elevationTexture.wrapT = ClampToEdgeWrapping;
  elevationTexture.minFilter = LinearFilter;
  elevationTexture.magFilter = LinearFilter;
  return { colorTexture, elevationTexture };
}

export async function initScene(): Promise<SceneObjects> {
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
  const directionalLight = new DirectionalLight(0xffffff, 4);
  scene.add(directionalLight);

  let moon: Mesh<SphereGeometry, MeshPhongMaterial> | null = null; // Reference to the moon mesh

  const { colorTexture, elevationTexture } = await loadTextures();
  const moonMaterial = new MeshPhongMaterial({
    map: colorTexture,
    bumpMap: elevationTexture,
    bumpScale: 4.0,
    shininess: 0,
  });
  const moonGeometry = new SphereGeometry(1, 64, 64);
  moon = new Mesh(moonGeometry, moonMaterial);
  scene.add(moon);

  const sceneObjects: SceneObjects = { scene, camera, renderer, moon, directionalLight };

  // Handle window resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    updateScene(sceneObjects);
  });

  return sceneObjects;
}
