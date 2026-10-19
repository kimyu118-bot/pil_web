// Three.js와 공식 물결 노멀 텍스처로, 높이가 있는 파동을 만든다.
import * as THREE from "three";

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const normalMapUrl = "https://cdn.jsdelivr.net/npm/three@0.170.0/examples/textures/waternormals.jpg";

const waveVertexShader = `
uniform float uTime;
uniform float uStrength;
varying vec2 vUv;
varying float vHeight;
varying vec3 vNormal;

void main() {
    vUv = uv;
    vec3 moved = position;

    float firstWave = sin(position.x * 0.72 + uTime * 0.7);
    float secondWave = sin(position.y * 0.48 - uTime * 0.5);
    float thirdWave = sin((position.x * 0.3 + position.y * 0.36) + uTime * 0.35);
    float height = (firstWave * 0.5 + secondWave * 0.32 + thirdWave * 0.22) * uStrength;
    moved.z = height;

    float slopeX = cos(position.x * 0.72 + uTime * 0.7) * 0.72 * 0.5;
    slopeX += cos((position.x * 0.3 + position.y * 0.36) + uTime * 0.35) * 0.3 * 0.22;
    float slopeY = cos(position.y * 0.48 - uTime * 0.5) * 0.48 * 0.32;
    slopeY += cos((position.x * 0.3 + position.y * 0.36) + uTime * 0.35) * 0.36 * 0.22;
    vNormal = normalize(vec3(-slopeX * uStrength, -slopeY * uStrength, 1.0));
    vHeight = height;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(moved, 1.0);
}
`;

const waveFragmentShader = `
uniform sampler2D uNormals;
uniform float uTime;
varying vec2 vUv;
varying float vHeight;
varying vec3 vNormal;

void main() {
    vec2 flowUv = vUv * 3.0 + vec2(uTime * 0.03, uTime * 0.02);
    vec3 detail = texture2D(uNormals, flowUv).xyz * 2.0 - 1.0;
    vec3 normal = normalize(vNormal + detail * 0.35);
    vec3 lightDirection = normalize(vec3(-0.25, 0.55, 0.85));
    float light = clamp(dot(normal, lightDirection), 0.0, 1.0);
    float crest = smoothstep(-0.15, 0.85, vHeight);
    vec3 deepColor = vec3(0.45, 0.58, 0.44);
    vec3 crestColor = vec3(0.86, 0.91, 0.84);
    vec3 color = mix(deepColor, crestColor, crest);
    color *= 0.72 + light * 0.45;
    float shine = pow(max(dot(reflect(-lightDirection, normal), vec3(0.0, 0.0, 1.0)), 0.0), 16.0);
    color += vec3(1.0, 0.98, 0.94) * shine * 0.35;
    gl_FragColor = vec4(color, 0.96);
}
`;

function startWaveBackground() {
    const waveHost = document.getElementById("wave-background");
    if (!waveHost) return;

    try {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 80);
        camera.position.set(0.4, 3.6, 8.5);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
        renderer.setClearColor(0x000000, 0);
        waveHost.appendChild(renderer.domElement);

        const waveNormals = new THREE.TextureLoader().load(normalMapUrl);
        waveNormals.wrapS = THREE.RepeatWrapping;
        waveNormals.wrapT = THREE.RepeatWrapping;
        waveNormals.colorSpace = THREE.LinearSRGBColorSpace;

        const waveMaterial = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uStrength: { value: 0.7 },
                uNormals: { value: waveNormals }
            },
            vertexShader: waveVertexShader,
            fragmentShader: waveFragmentShader,
            transparent: true,
            depthWrite: false
        });
        waveMaterial.toneMapped = false;

        const waveSurface = new THREE.Mesh(new THREE.PlaneGeometry(22, 14, 140, 90), waveMaterial);
        waveSurface.rotation.x = -Math.PI / 2.15;
        waveSurface.position.set(5.6, -1.15, 0.2);
        scene.add(waveSurface);

        function resizeWave() {
            const width = waveHost.clientWidth;
            const height = Math.max(waveHost.clientHeight, 1);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        }

        window.addEventListener("resize", resizeWave);
        resizeWave();

        const clock = new THREE.Clock();
        let elapsedTime = 0;

        function drawWave() {
            requestAnimationFrame(drawWave);
            const frameSeconds = Math.min(clock.getDelta(), 0.05);
            if (!prefersReducedMotion) {
                elapsedTime += frameSeconds;
                waveMaterial.uniforms.uTime.value = elapsedTime;
                camera.position.x = 0.4 + Math.sin(elapsedTime * 0.08) * 0.25;
            }
            camera.lookAt(2.4, -0.35, -1.2);
            renderer.render(scene, camera);
        }

        drawWave();
    } catch (error) {
        console.error(error);
    }
}

startWaveBackground();
