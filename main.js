import './style.css';
import * as THREE from 'three';
import { gsap } from "gsap";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { VignetteShader } from 'three/examples/jsm/shaders/VignetteShader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';

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

const stats = new Stats();
stats.showPanel(0); 
document.body.appendChild(stats.dom);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableZoom = false;
controls.enableDamping = true;
controls.enablePan = false;
controls.enableRotate = false;

const hdrLoader = new RGBELoader();
hdrLoader.load('assets/images/world.hdr', function (texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture; 
    scene.background = texture;
});

const textureLoader = new THREE.TextureLoader();
const texture360 = textureLoader.load('/assets/images/skybox.png');
const sphereGeometry = new THREE.SphereGeometry(100, 32, 32);
sphereGeometry.rotateY(Math.PI / 2);
const sphereMaterial = new THREE.MeshBasicMaterial({ map: texture360, side: THREE.DoubleSide });
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
scene.add(sphere);

const worldLoader = new GLTFLoader();
worldLoader.load(
    '/assets/models/world1.glb',
    (gltf) => {
        gltf.scene.position.set(0, 0.8, 0);
        gltf.scene.rotation.y = -Math.PI / 2;
        scene.add(gltf.scene);
        gltf.scene.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = false;
                child.receiveShadow = true;
            }
        });
    }
);

const shoeLoader = new GLTFLoader();
let shoe;
let shoeLoaded = false;

shoeLoader.load(
    '/assets/models/swearshoe.glb',
    (gltf) => {
        shoe = gltf.scene;
        shoe.name = 'shoe';
        shoe.scale.set(5, 5, 5);
        shoe.position.set(0, 3, 0);
        shoe.rotation.y = Math.PI / 2;
        scene.add(shoe);

        gltf.scene.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = false;
            }
        });

        gsap.to(gltf.scene.position, {
            y: 3.2,
            duration: 2,
            repeat: -1,
            yoyo: true,
            ease: 'power2.inOut',
        });

        shoeLoaded = true;

        window.shoe = shoe;
        window.shoeLoaded = true;
    },
    undefined,
    (error) => {
        console.error(error);
    }
);


const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xe0ffff, 2.5);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
directionalLight.position.set(0, 10, 0);
scene.add(directionalLight);

const pointLight1 = new THREE.PointLight(0xffffff, 10);
pointLight1.position.set(4, 5, 0);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0xffffff, 10);
pointLight2.position.set(-4, 5, 0);
scene.add(pointLight2);

const pointLight3 = new THREE.PointLight(0xffffff, 20);
pointLight3.position.set(-8.2, 1.5, 4.7);
scene.add(pointLight3);

const pointLight4 = new THREE.PointLight(0xffffff, 20);
pointLight4.position.set(3, 5, -7.8);
scene.add(pointLight4);

const pointLight5 = new THREE.PointLight(0xffffff, 20);
pointLight5.position.set(1.5, 5, -7.8);
scene.add(pointLight5);

const pointLight6 = new THREE.PointLight(0xffffff, 20);
pointLight6.position.set(-3, 5, -7.8);
scene.add(pointLight6);

camera.position.z = 2;
camera.position.y = 3.5;
camera.rotation.x = -0.2;

function hideMenu() {
    gsap.to("#menu-content", {
        opacity: 0,
        duration: 0.2,
        ease: "power2.in"
    });
}

function showMenu() {
    gsap.to("#menu-content", {
        opacity: 1,
        duration: 0.2,
        ease: "power2.in"
    });
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});


const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

let components = ["inside", "laces", "outside_1", "outside_2", "outside_3", "sole_bottom", "sole_top"];

const minZoom = 1.5; 
const maxZoom = 3; 

let isMouseDown = false;
let previousMouseX = 0;
let previousMouseY = 0;
let rotationSpeed = 0.30;
let shoeSpeed = 0.005;

window.addEventListener('mousedown', (event) => {
    isMouseDown = true;
    previousMouseX = event.clientX;
    previousMouseY = event.clientY;
});

let highlightedObject = null;


function resetObjectMaterial(object) {
    if (object.material.emissive) object.material.emissive.set(0x000000);
    if (object.material.wireframe !== undefined) object.material.wireframe = false;
}

function highlightObject(object) {
    if (object.material.emissive) object.material.emissive.set(0x00ff00);
    if (object.material.wireframe !== undefined) object.material.wireframe = true;
}

window.addEventListener('click', (event) => {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    const firstIntersect = intersects[0];

    if (firstIntersect && components.includes(firstIntersect.object.name)) {
        if (highlightedObject === firstIntersect.object) {
            resetObjectMaterial(highlightedObject);
            rotationSpeed = 0.30;
            highlightedObject = null;
            hideMenu();
            gsap.to(camera.position, {
                duration: 0.5,
                x: 0,
                y: 3.5,
                z: 2
            })
        } else {
            if (highlightedObject) resetObjectMaterial(highlightedObject);
            highlightObject(firstIntersect.object);
            rotationSpeed = 0.01;
            highlightedObject = firstIntersect.object;
            showMenu();
            
            gsap.to(camera.position, {
                duration: 0.5,
                x: firstIntersect.object.position.x,
                y: firstIntersect.object.position.y + 3.5,
                z: firstIntersect.object.position.z + 1.2,
            });
        }
    }
});



window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    if (isMouseDown && shoe) {
        let deltaX = event.clientX - previousMouseX;
        let deltaY = event.clientY - previousMouseY;

        shoe.rotation.y += deltaX * shoeSpeed;  
        shoe.rotation.x += deltaY * shoeSpeed;  

        previousMouseX = event.clientX;
        previousMouseY = event.clientY;
    }
});

window.addEventListener('mouseup', () => {
    isMouseDown = false;
});

const colorPicker = document.getElementById("color-picker");

const materialSelector = document.getElementById("material-selector");

let selectedColor = null; 
let selectedMaterial = null;

const loadScaledTexture = (url, scaleFactor) => {
    const texture = textureLoader.load(url);
    texture.repeat.set(scaleFactor, scaleFactor);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    return texture;
};

const scaleFactor = 3; 

const denimMaterial = new THREE.MeshStandardMaterial({
    normalMap: loadScaledTexture('assets/materials/denim/denim_normal.jpg', scaleFactor),
    roughnessMap: loadScaledTexture('assets/materials/denim/denim_roughness.jpg', scaleFactor),
    roughness: 0.8,
    metalness: 0.2,
});

const rubberMaterial = new THREE.MeshStandardMaterial({
    normalMap: loadScaledTexture('assets/materials/rubber/rubber_normal.jpg', scaleFactor),
    roughnessMap: loadScaledTexture('assets/materials/rubber/rubber_roughness.jpg', scaleFactor),
    roughness: 0.8,
    metalness: 0,
});

const leatherMaterial = new THREE.MeshStandardMaterial({
    normalMap: loadScaledTexture('assets/materials/leather/leather_normal.jpg', scaleFactor),
    roughnessMap: loadScaledTexture('assets/materials/leather/leather_roughness.jpg', scaleFactor),
    roughness: 0.8,
    metalness: 0,
});

const materialOptions = {
    leather: leatherMaterial,
    fabric: new THREE.MeshStandardMaterial({ color: 0x808080, roughness: 0.9, metalness: 0.1 }),
    rubber: rubberMaterial,
    metal: new THREE.MeshStandardMaterial({  roughness: 0.05, metalness: 1 }),
    denim: denimMaterial,
};

function resetWireframeAndEmissive() {
    if (highlightedObject) {
        highlightedObject.material.wireframe = false;
        highlightedObject.material.emissive.set(0x000000);
    }
}

colorPicker.addEventListener("input", (event) => {
    selectedColor = event.target.value;
    if (highlightedObject) {
        resetWireframeAndEmissive();  
        highlightedObject.material.color.set(selectedColor);

        
        if (selectedMaterial) {
            highlightedObject.material = selectedMaterial.clone();
            highlightedObject.material.color.set(selectedColor); 
        }
    }
});

materialSelector.addEventListener("change", (event) => {
    selectedMaterial = materialOptions[event.target.value];
    if (highlightedObject) {
        resetWireframeAndEmissive();  
        highlightedObject.material = selectedMaterial.clone();
        highlightedObject.material.name = event.target.value;
        
        if (selectedColor) {
            highlightedObject.material.color.set(selectedColor);
        }
    }
});



const resetBtn = document.getElementById('reset-btn');

const defaultMaterials = {
    inside: new THREE.MeshStandardMaterial({ color: 0xffffff }),
    laces: new THREE.MeshStandardMaterial({ color: 0xffffff }),
    outside_1: new THREE.MeshStandardMaterial({ color: 0xFFFFFF }),
    outside_2: new THREE.MeshStandardMaterial({ color: 0xFFFFFF }),
    outside_3: new THREE.MeshStandardMaterial({ color: 0xFFFFFF }),
    sole_bottom: new THREE.MeshStandardMaterial({ color: 0xffffff }),
    sole_top: new THREE.MeshStandardMaterial({ color: 0xffffff }),
};

resetBtn.addEventListener('click', () => {
    if (shoe) {
        shoe.traverse((child) => {
            if (child.isMesh && defaultMaterials[child.name]) {
                child.material = defaultMaterials[child.name];
                child.material.emissive.set(0x000000); 
                child.material.wireframe = false; 
            }
        });
    }
});

const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const vignettePass = new ShaderPass(VignetteShader);
vignettePass.uniforms['offset'].value = 1;
vignettePass.uniforms['darkness'].value = 0.8;
composer.addPass(vignettePass);

let lastTime = 0;

function animate(time) {
    stats.begin();

    const deltaTime = (time - lastTime) / 1000;  
    lastTime = time;

    
    scene.rotation.y += rotationSpeed * deltaTime;

    renderer.render(scene, camera);
    composer.render();
    stats.end();
}
export { shoeLoaded, shoe };

