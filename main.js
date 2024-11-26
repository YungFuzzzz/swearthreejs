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

const hdrLoader = new RGBELoader();
hdrLoader.load('assets/images/hansapplatz_4k.hdr', function (texture) {
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

const directionalLight = new THREE.DirectionalLight(0xe0ffff, 5);
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
            if (highlightedObject.material.wireframe !== undefined) {
                highlightedObject.material.wireframe = false; 
            }
            highlightedObject = null;
        } else {
            
            if (highlightedObject && highlightedObject.material.emissive) {
                highlightedObject.material.emissive.set(0x000000); 
            }
            if (highlightedObject && highlightedObject.material.wireframe !== undefined) {
                highlightedObject.material.wireframe = false; 
            }
    
            
            if (firstIntersect.object.material.emissive) {
                firstIntersect.object.material.emissive.set(0x00ff00); 
            }
            if (firstIntersect.object.material.wireframe !== undefined) {
                firstIntersect.object.material.wireframe = true; 
            }
    
            
            highlightedObject = firstIntersect.object;
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
const applyChangesButton = document.getElementById("apply-customization");
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
    metal: new THREE.MeshStandardMaterial({ roughness: 0.1, metalness: 1 }),
    denim: denimMaterial,  
  };

colorPicker.addEventListener("input", (event) => {
    selectedColor = event.target.value;
});

materialSelector.addEventListener("change", (event) => {
    selectedMaterial = materialOptions[event.target.value];
});

applyChangesButton.addEventListener('click', () => {
    if (highlightedObject) {
      if (selectedMaterial) {
        highlightedObject.material = selectedMaterial.clone();
        highlightedObject.material.color.set(selectedColor);
      } else {
        highlightedObject.material.color.set(selectedColor);
      }
    }
  });

window.addEventListener('wheel', (event) => {
    if (event.deltaY > 0) {
        camera.position.z = Math.min(camera.position.z + 0.1, maxZoom);
    } else {
        camera.position.z = Math.max(camera.position.z - 0.1, minZoom);
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

function animate() {
    scene.rotation.y += 0.007; 
    renderer.render(scene, camera);
    composer.render();
}
