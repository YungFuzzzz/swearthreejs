import './style.css'
import * as THREE from 'three';
import { gsap } from "gsap";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);


const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);


//360 image
const loader360 = new THREE.TextureLoader();
const texture360 = loader360.load('/assets/images/envimage.png');
const sphereGeometry = new THREE.SphereGeometry(50, 32, 32);
sphereGeometry.rotateY(Math.PI / 2);
const sphereMaterial = new THREE.MeshBasicMaterial({ map: texture360, side: THREE.DoubleSide });
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
scene.add(sphere);

//swear model
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

//barrel model
const loader = new GLTFLoader();
loader.load(
    '/assets/models/barrel.glb',
    (gltf) => {
        gltf.scene.position.set(0, 1.3, 0);
        scene.add(gltf.scene);
        //cast shadow
        gltf.scene.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        const fireLight = new THREE.PointLight(0xff4500, 100);
        fireLight.position.set(0, 0.8, 0);
        scene.add(fireLight);

        const fireFlicker = () => {
          fireLight.intensity = Math.random() * 10 + 50;
      };
      setInterval(fireFlicker, 100);
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
//recieve shadow
plane.receiveShadow = true;
scene.add(plane);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
directionalLight.position.set(-3, 3, 3);
directionalLight.castShadow = true;

directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 50;

directionalLight.shadow.camera.left = -15;
directionalLight.shadow.camera.right = 15;
directionalLight.shadow.camera.top = 15;
directionalLight.shadow.camera.bottom = -15;

//const directionalLightHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
//scene.add(directionalLightHelper);

scene.add(directionalLight);
camera.position.z = 2.5;
camera.position.y = 3.5;
camera.rotation.x = -0.2;

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
    renderer.render(scene, camera);
}