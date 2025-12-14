import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { config } from './constants';
import { paperVertexShader, paperFragmentShader, particleVertexShader, particleFragmentShader } from './shaders';
import { createNewspaperTexture } from './webgl/textureGenerator';
import { setupScene } from './webgl/sceneSetup';
import './style.css';

gsap.registerPlugin(ScrollTrigger);

// --- 1. SETUP ---
const canvasContainer = document.getElementById("canvas-container");
const { scene, camera, renderer } = setupScene(canvasContainer);

// --- 2. OBJECTS ---

// A. Newspaper
const paperTexture = createNewspaperTexture();
const paperGeometry = new THREE.PlaneGeometry(14, 14, 128, 128);

const paperUniforms = {
    uTime: { value: 0 },
    uTexture: { value: paperTexture },
    uProgress: { value: 0 },
    uNoiseScale: { value: 3.0 },
};

const paperMaterial = new THREE.ShaderMaterial({
    uniforms: paperUniforms,
    transparent: true,
    side: THREE.DoubleSide,
    vertexShader: paperVertexShader,
    fragmentShader: paperFragmentShader,
});

const paperMesh = new THREE.Mesh(paperGeometry, paperMaterial);
scene.add(paperMesh);

// B. Particle System (The Eye)
const particleCount = config.particleCount;
const particlesGeo = new THREE.BufferGeometry();

const posArray = new Float32Array(particleCount * 3);
const initialPosArray = new Float32Array(particleCount * 3);
const targetPosArray = new Float32Array(particleCount * 3);
const randomArray = new Float32Array(particleCount);

// 1. Initial State: Scattered grid matching the paper plane
for (let i = 0; i < particleCount; i++) {
    const x = (Math.random() - 0.5) * 14;
    const y = (Math.random() - 0.5) * 14;
    const z = (Math.random() - 0.5) * 0.5;

    initialPosArray[i * 3] = x;
    initialPosArray[i * 3 + 1] = y;
    initialPosArray[i * 3 + 2] = z;

    posArray[i * 3] = x;
    posArray[i * 3 + 1] = y;
    posArray[i * 3 + 2] = z;

    randomArray[i] = Math.random();
}

// 2. Target State: Mathematical Mechanical Eye
for (let i = 0; i < particleCount; i++) {
    let x, y, z;

    // 70% Torus Knot (Iris), 30% Sphere (Pupil)
    if (i < particleCount * 0.7) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 2.5 + Math.random() * 1.5;
        const depth = (Math.random() - 0.5) * 1.5;

        x = Math.cos(angle) * radius;
        y = Math.sin(angle) * radius;
        z = depth;
    } else {
        const phi = Math.acos(-1 + 2 * Math.random());
        const theta = Math.sqrt(particleCount * Math.PI) * phi;
        const r = 1.2;

        x = r * Math.cos(theta) * Math.sin(phi);
        y = r * Math.sin(theta) * Math.sin(phi);
        z = r * Math.cos(phi);
        z += 0.5; // Pupil forward
    }

    targetPosArray[i * 3] = x;
    targetPosArray[i * 3 + 1] = y;
    targetPosArray[i * 3 + 2] = z;
}

particlesGeo.setAttribute("position", new THREE.BufferAttribute(posArray, 3));
particlesGeo.setAttribute("initialPos", new THREE.BufferAttribute(initialPosArray, 3));
particlesGeo.setAttribute("targetPos", new THREE.BufferAttribute(targetPosArray, 3));
particlesGeo.setAttribute("aRandom", new THREE.BufferAttribute(randomArray, 1));

const particleMaterial = new THREE.ShaderMaterial({
    uniforms: {
        uTime: { value: 0 },
        uMix: { value: 0 },
        uColor1: { value: new THREE.Color(config.colors.ink) },
        uColor2: { value: new THREE.Color(config.colors.accent) },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
    },
    transparent: true,
    depthWrite: false,
    vertexShader: particleVertexShader,
    fragmentShader: particleFragmentShader,
});

const particleSystem = new THREE.Points(particlesGeo, particleMaterial);
scene.add(particleSystem);


// --- 3. ANIMATION \u0026 SCROLL ---

// Sync Scroll with WebGL uniforms
// We map the scroll progress (0 to 1) to our animation phases
// Total height is roughly 400vh (4 sections)

function updateScrollLogic() {
    const totalHeight = document.body.scrollHeight - window.innerHeight;
    const scrollY = window.scrollY;
    const progress = Math.min(scrollY / totalHeight, 1);

    // Normalized scroll for GL logic (0.0 - 1.0)
    // We want the transformation to happen primarily in the first section/transition

    // 1. Paper Disintegration (0.0 -> 0.3)
    const paperPhase = Math.min(progress * 3.3, 1.0);
    paperMaterial.uniforms.uProgress.value = paperPhase;

    paperMesh.rotation.y = scrollY * 0.0005;
    paperMesh.rotation.z = -0.1 + scrollY * 0.0002;

    // 2. Particle Formation (0.2 -> 0.6)
    const particlePhase = Math.min(Math.max((progress - 0.2) * 2.5, 0), 1.0);
    particleMaterial.uniforms.uMix.value = particlePhase;

    // 3. Camera Movement
    if (progress < 0.5) {
        camera.position.z = 15 + progress * 10;
    } else {
        const zoomIn = (progress - 0.5) * 2.0;
        camera.position.z = 25 - zoomIn * 15;
    }

    camera.position.y = (progress - 0.5) * -5;
    camera.lookAt(0, 0, 0);
}

// Render Loop
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const time = clock.getElapsedTime();

    paperMaterial.uniforms.uTime.value = time;
    particleMaterial.uniforms.uTime.value = time;

    updateScrollLogic(); // Run every frame for smooth updates or stick to scroll event

    renderer.render(scene, camera);
}


// --- 4. Content Animations (GSAP) ---
// Animate text elements when they come into view

document.querySelectorAll('.section').forEach((section, index) => {
    // Skip empty hero section
    if (index === 0) return;

    const h2 = section.querySelector('h2');
    const body = section.querySelector('.article-body');

    gsap.to(h2, {
        scrollTrigger: {
            trigger: section,
            start: "top 60%",
            toggleActions: "play none none reverse"
        },
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power2.out"
    });

    gsap.to(body, {
        scrollTrigger: {
            trigger: section,
            start: "top 50%",
            toggleActions: "play none none reverse"
        },
        opacity: 1,
        y: 0,
        duration: 1,
        delay: 0.2,
        ease: "power2.out"
    });
});


// --- 5. INITIALIZATION ---

window.onload = () => {
    const loader = document.getElementById("loader");
    const progress = document.getElementById("progress-fill");

    let p = 0;
    const interval = setInterval(() => {
        p += Math.random() * 10;
        if (p >= 100) {
            p = 100;
            clearInterval(interval);

            setTimeout(() => {
                gsap.to(loader, {
                    opacity: 0,
                    duration: 1,
                    onComplete: () => loader.style.display = "none",
                });
                animate();
            }, 500);
        }
        progress.style.width = p + "%";
    }, 100);
};
