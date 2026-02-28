/**
 * Complete Three.js scene setup for Sri Yantra.
 */

import * as THREE from "three";
import { createSriYantra3DGroup } from "./geometry.js";
import { getMaterialPreset, type SacredMaterialSet } from "./materials.js";

export interface SceneOptions {
  materialPreset?: "gold" | "copper" | "crystal";
  extrusionDepth?: number;
  cameraPosition?: [number, number, number];
  background?: string;
  ambientIntensity?: number;
  autoRotate?: boolean;
}

/**
 * Create a complete Three.js scene with Sri Yantra geometry and lighting.
 */
export function createSriYantraScene(options: SceneOptions = {}): {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  group: THREE.Group;
} {
  const {
    materialPreset = "gold",
    extrusionDepth = 0.02,
    cameraPosition = [0, -0.3, 1.8],
    background,
    ambientIntensity = 0.4,
  } = options;

  const scene = new THREE.Scene();

  if (background) {
    scene.background = new THREE.Color(background);
  }

  // Camera
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(...cameraPosition);
  camera.lookAt(0, 0, 0);

  // Lighting
  const ambient = new THREE.AmbientLight(0xfff5e6, ambientIntensity);
  scene.add(ambient);

  const keyLight = new THREE.DirectionalLight(0xffffff, 1.0);
  keyLight.position.set(2, 3, 4);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0xe6f0ff, 0.3);
  fillLight.position.set(-2, -1, 2);
  scene.add(fillLight);

  // Sri Yantra
  const materials = getMaterialPreset(materialPreset);
  const group = createSriYantra3DGroup(materials, { extrusionDepth });
  scene.add(group);

  return { scene, camera, group };
}
