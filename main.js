import './style.css';
import * as THREE from 'three';
import { gsap } from "gsap";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMappingExposure = 0.9;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableZoom= false;
controls.enableDamping = true;
controls.enablePan = false;
controls.enableRotate = false;


const loader360 = new THREE.TextureLoader();
const texture360 = loader360.load('/assets/images/skybox.png');
const sphereGeometry = new THREE.SphereGeometry(100, 32, 32);
sphereGeometry.rotateY(Math.PI / 2);
const sphereMaterial = new THREE.MeshBasicMaterial({ map: texture360, side: THREE.DoubleSide });
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
scene.add(sphere);

const worldLoader = new GLTFLoader();
worldLoader.load(
    '/assets/models/world.glb',
    (gltf) => {
        gltf.scene.position.set(0, 0.8, 0);
        gltf.scene.rotation.y = -Math.PI / 2;
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

        gsap.to(gltf.scene.position, {
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

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.65);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
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


const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let currentIntersect = null;

let components = ["inside", "laces", "outside_1", "outside_2", "outside_3", "sole_bottom", "sole_top"];

const minZoom = 1.5; 
const maxZoom = 3; 

window.addEventListener('wheel', (event) => {
    if (event.deltaY > 0) {
        camera.position.z = Math.min(camera.position.z + 0.1, maxZoom);
    } else {
        camera.position.z = Math.max(camera.position.z - 0.1, minZoom);
    }
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


let highlightedObject = null;


window.addEventListener('click', (event) => {
    
    raycaster.setFromCamera(mouse, camera);

    
    const intersects = raycaster.intersectObjects(scene.children, true);
    const firstIntersect = intersects[0];

    if (firstIntersect && components.includes(firstIntersect.object.name)) {
        
        if (highlightedObject === firstIntersect.object) {
            
            if (highlightedObject.material.emissive) {
                highlightedObject.material.emissive.set(0x000000); 
            }
            highlightedObject = null;
        } else {
            
            if (highlightedObject && highlightedObject.material.emissive) {
                highlightedObject.material.emissive.set(0x000000);
            }
            
            if (firstIntersect.object.material.emissive) {
                firstIntersect.object.material.emissive.set(0x00ff00);
                highlightedObject = firstIntersect.object;
            }
        }
    } else {
    }    
});


window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    if (isMouseDown && shoe) {
        let deltaX = event.clientX - previousMouseX;
        let deltaY = event.clientY - previousMouseY;

        shoe.rotation.y += deltaX * rotationSpeed;
        shoe.rotation.x += deltaY * rotationSpeed;

        previousMouseX = event.clientX;
        previousMouseY = event.clientY;
    }
});


window.addEventListener('mousedown', (event) => {
    isMouseDown = true;
    previousMouseX = event.clientX;
    previousMouseY = event.clientY;
});

window.addEventListener('mouseup', () => {
    isMouseDown = false;
});


const colorPicker = document.getElementById("color-picker");


colorPicker.addEventListener("input", (event) => {
    const selectedColor = event.target.value; 

    
    if (highlightedObject) {
        highlightedObject.material.color.set(selectedColor); 
        highlightedObject.object.material.metalness = 0.9; 
        highlightedObject.object.material.roughness = 0.1; 
    }
});


function animate() {
    scene.rotation.y += 0.007; 
    renderer.render(scene, camera);
}
