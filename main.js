import './style.css';
import * as THREE from 'three';
import { gsap } from "gsap";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

controls.enableDamping = true;
controls.enableZoom = false;
controls.enablePan = false;
controls.enableRotate = false; 


const loader360 = new THREE.TextureLoader();
const texture360 = loader360.load('/assets/images/envimage.png');
const sphereGeometry = new THREE.SphereGeometry(50, 32, 32);
sphereGeometry.rotateY(Math.PI / 2);
const sphereMaterial = new THREE.MeshBasicMaterial({ map: texture360, side: THREE.DoubleSide });
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
scene.add(sphere);


const swearLoader = new GLTFLoader();
swearLoader.load('/assets/models/swear.glb', (gltf) => {
  gltf.scene.traverse((child) => {
      if (child.isMesh) {
          child.material = new THREE.MeshStandardMaterial({ color: 0x7cfc00, emissive: 0x7cfc00 });
      }
  });

  gltf.scene.position.y = 6.5;
  gltf.scene.position.z = -6;
  gltf.scene.scale.set(10, 10, 10);
  scene.add(gltf.scene);

  gsap.to(gltf.scene.rotation, {
    x: Math.PI * 2,
    duration: 5,
    repeat: -1,
    ease: "none",
  });
}, undefined, (error) => {
    console.error(error);
});


const loader = new GLTFLoader();
loader.load(
    '/assets/models/barrel.glb',
    (gltf) => {
        gltf.scene.position.set(0, 0.8, 0);
        scene.add(gltf.scene);
        gltf.scene.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
    }
);


const shoeLoader = new GLTFLoader();
let shoe;
shoeLoader.load(
    '/assets/models/swearshoe.glb',
    (gltf) => {
        shoe = gltf.scene;
        shoe.scale.set(5, 5, 5);
        shoe.position.set(0, 3, 0);
        shoe.rotation.y = Math.PI / 2;
        scene.add(shoe);

        gltf.scene.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        
        const floatingAnim = gsap.to(gltf.scene.position, {
            y: 3.2,
            duration: 2,
            repeat: -1,
            yoyo: true,
            ease: 'power2.inOut',
        });
    },
    undefined,
    (error) => {
        console.error(error);
    }
);


const planeGeometry = new THREE.PlaneGeometry(20, 20, 5);
const planeMaterial = new THREE.ShadowMaterial({ opacity: 0.2 });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
plane.receiveShadow = true;
scene.add(plane);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

//add a directional light right above the shoe model with helper and cast shadows
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
directionalLight.shadow.camera.near = 0.1;
directionalLight.shadow.camera.far = 100;
directionalLight.shadow.camera.left = -10;
directionalLight.shadow.camera.right = 10;
directionalLight.shadow.camera.top = 10;
directionalLight.shadow.camera.bottom = -10;
directionalLight.position.set(0, 10, 0);
scene.add(directionalLight);

camera.position.z = 2.5;
camera.position.y = 3.5;
camera.rotation.x = -0.2;

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});


let isMouseDown = false;
let previousMouseX = 0;
let previousMouseY = 0;
let rotationSpeed = 0.005;


window.addEventListener('mousedown', (event) => {
    isMouseDown = true;
    previousMouseX = event.clientX;
    previousMouseY = event.clientY;
});

window.addEventListener('mousemove', (event) => {
    if (isMouseDown && shoe) {
        let deltaX = event.clientX - previousMouseX;
        let deltaY = event.clientY - previousMouseY;

        
        shoe.rotation.y += deltaX * rotationSpeed;
        shoe.rotation.x += deltaY * rotationSpeed;

        
        previousMouseX = event.clientX;
        previousMouseY = event.clientY;
    }
});

window.addEventListener('mouseup', () => {
    isMouseDown = false;
});

function animate() {
    renderer.render(scene, camera);
}
