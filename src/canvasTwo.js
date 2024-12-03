import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export function setupCanvasTwo() {
  function getRandomNumber() {
    return Math.random() * Math.floor(10);
  }

  function getMinusToPlus() {
    return Math.random() < 0.5 ? -1 : 1;
  }

  function setToRandomPosition(obj) {
    obj.position.set(
      getRandomNumber() * getMinusToPlus(),
      getRandomNumber() * getMinusToPlus(),
      getRandomNumber() - 21
    );
  }

  const canvas = document.getElementById("canvas_two");

  const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });

  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.shadowMap.enabled = true;

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

  const textureLoader = new THREE.TextureLoader();

  // Load the texture and apply it to the plane material
  textureLoader.load(
    "/textures/stone.jpg",
    function (texture) {
      const floorGeo = new THREE.PlaneGeometry(300, 300);
      const floorMat = new THREE.MeshStandardMaterial({
        map: texture,
        side: THREE.DoubleSide,
        roughness: 0.9,
        metalness: 0.1,
      });

      const floor = new THREE.Mesh(floorGeo, floorMat);
      floor.rotation.x = Math.PI / 2;
      floor.position.y = -13.5;
      floor.receiveShadow = true;
      scene.add(floor);
    },
    undefined,
    function (error) {
      console.error("An error occurred while loading the texture:", error);
    }
  );

  textureLoader.load(
    "/textures/water.jpg",
    function (texture) {
      const waterMat = new THREE.MeshStandardMaterial({
        map: texture,
        side: THREE.DoubleSide,
        metalness: 0.9,
        roughness: 0.1,
      });

      // Create cubes once the texture is loaded and applied
      const geo = new THREE.BoxGeometry(1, 1, 7);
      const cubeNumber = 250;
      for (let i = 0; i < cubeNumber; i++) {
        const cube = new THREE.Mesh(geo, waterMat);
        setToRandomPosition(cube);
        cube.castShadow = true;
        scene.add(cube);
      }
    },
    undefined,
    function (error) {
      console.error("An error occurred while loading the texturre", error);
    }
  );

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 10);
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

  const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight2.position.set(-50, 50, -50);
  scene.add(directionalLight2);

  console.log(scene.children);

  function animate() {
    requestAnimationFrame(animate);
    controls.update();

    // Rotate the cubes
    scene.children.forEach((child) => {
      if (child.isMesh && child.geometry.type === "BoxGeometry") {
        child.translateZ(0.1);
        if (child.position.z >= 13) {
          setToRandomPosition(child);
        }
      }
    });

    renderer.render(scene, cam);
  }

  animate();
}
