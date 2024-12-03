import "./style.css";

import * as THREE from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

import { setupCanvasTwo } from "./canvasTwo";

const canvas = document.getElementById("canvas");

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });

renderer.setSize(canvas.clientWidth, canvas.clientHeight);
renderer.shadowMap.enabled = true; // Enable shadow mapping

const cam = new THREE.PerspectiveCamera(
  75,
  canvas.clientWidth / canvas.clientHeight,
  0.1,
  1000
);

cam.position.z = 73;
cam.position.y = 13;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xa6eaff);

const controls = new OrbitControls(cam, renderer.domElement);

const floorGeo = new THREE.PlaneGeometry(300, 300);
const floorMat = new THREE.MeshStandardMaterial({
  color: 0x000000,
  side: THREE.DoubleSide,
});
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = Math.PI / 2;
floor.position.y = -13.5;
floor.receiveShadow = true; // Floor receives shadows
scene.add(floor);

const loader = new GLTFLoader();

let loadedModel; // Global variable to store the loaded model
let rotationsLeft = 0; // Variable to store the number of rotations left

// Load a glTF resource
loader.load(
  // resource URL
  "/scene.gltf",
  // called when the resource is loaded
  function (gltf) {
    loadedModel = gltf.scene; // Store the loaded model

    loadedModel.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true; // Disable shadow casting for the model
        child.receiveShadow = false; // Disable shadow receiving for the model
        child.userData.clickable = true; // Allow the model to be clickable
      }
    });

    // Position the model as needed
    loadedModel.position.set(0, 7, 0);

    scene.add(loadedModel);

    // Add click event listener to the loaded model
    canvas.addEventListener("click", onClick, false);
  },
  // called while loading is progressing
  function (xhr) {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  // called when loading has errors
  function (error) {
    console.log("An error happened");
  }
);

const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 50);
directionalLight.position.set(50, 50, 50);
directionalLight.castShadow = true; // Enable shadows for the light
directionalLight.shadow.mapSize.width = 1024; // Shadow map resolution
directionalLight.shadow.mapSize.height = 1024;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 500;
// Adjust the shadow camera's frustum
directionalLight.shadow.camera.left = -100;
directionalLight.shadow.camera.right = 100;
directionalLight.shadow.camera.top = 100;
directionalLight.shadow.camera.bottom = -10;
scene.add(directionalLight);

const directionalLight2 = new THREE.DirectionalLight(0xffffff, 50);
directionalLight2.position.set(-50, 50, -50);
scene.add(directionalLight2);

function onClick(event) {
  // Calculate mouse position in normalized device coordinates (-1 to +1) for both components
  const mouse = new THREE.Vector2();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Raycaster to detect the clicked object
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, cam);

  const intersects = raycaster.intersectObjects(scene.children, true);

  if (intersects.length > 0) {
    const firstIntersect = intersects[0].object;
    if (firstIntersect.userData.clickable) {
      rotationsLeft = Math.floor(Math.random() * 3) + 2.5; // Random number between 5 and 10 half rotations
    }
  }
}

cam.lookAt(scene.position);

function animate() {
  requestAnimationFrame(animate);

  if (loadedModel && rotationsLeft > 0) {
    const rotationAmount = Math.PI / 90; // Rotate by 2 degrees per frame (increase speed)
    loadedModel.rotation.y += rotationAmount;
    if (loadedModel.rotation.y % Math.PI < rotationAmount) {
      rotationsLeft -= 1; // Decrease the rotations left by 1 when a 180-degree rotation is completed
    }
  }

  controls.update();
  renderer.render(scene, cam);
}

animate();
setupCanvasTwo();
