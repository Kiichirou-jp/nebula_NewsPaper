export const paperVertexShader = `
varying vec2 vUv;
varying float vNoise;
uniform float uTime;
uniform float uProgress;

// Simple Pseudo Random
float random (vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233)))*43758.5453123);
}

// Noise function
float noise (in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

void main() {
    vUv = uv;
    vec3 pos = position;

    // Digital Wave / Glitch effect
    float distortion = sin(pos.y * 10.0 + uTime * 5.0) * 0.05 * uProgress;
    pos.x += distortion;

    // Disintegration effect
    // Use blocky noise for digital feel?
    // For now, keep continuous noise but change displacement vector
    float n = noise(pos.xy * 5.0 + uTime * 0.2); 
    vNoise = n;

    // Instead of exploding outward, "upload" upwards and separate
    vec3 lift = vec3(0.0, 1.0, 0.5); // Up and back
    pos += lift * uProgress * n * 5.0; // Lift pieces up

    // Glitch/jitter
    pos.x += (random(uv + uTime) - 0.5) * 0.1 * uProgress;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

export const paperFragmentShader = `
varying vec2 vUv;
varying float vNoise;
uniform sampler2D uTexture;
uniform float uProgress;
uniform float uTime;

void main() {
    vec4 texColor = texture2D(uTexture, vUv);

    // Digital Dissolve Threshold
    float threshold = uProgress * 1.8; // Speed up slightly
    float edge = 0.05;

    // "Data" grid effect overlay on dissolve
    float grid = step(0.9, fract(vUv.x * 50.0)) + step(0.9, fract(vUv.y * 50.0));
    
    if(vNoise < threshold - edge) discard;

    // Edge glow (Digital Energy)
    if(vNoise < threshold) {
        // Cyan / White energy
        float intensity = (threshold - vNoise) / edge;
        // texColor.rgb = mix(vec3(0.0, 1.0, 1.0), vec3(1.0), intensity); 
        texColor.rgb = vec3(0.2, 0.8, 1.0) * 2.0; // Bright Cyan
        texColor.a = 1.0;
    }

    // Slight tech overlay during transition
    if(uProgress > 0.0) {
        if(grid > 0.5 && vNoise < threshold + 0.2) {
             texColor.rgb += vec3(0.0, 0.5, 1.0) * 0.5;
        }
    }

    // Old paper yellowing removed for gray texture
    // vec3 sepia = vec3(1.2, 1.0, 0.8);
    // texColor.rgb *= sepia;

    gl_FragColor = texColor;
}
`;

export const particleVertexShader = `
uniform float uTime;
uniform float uMix;
uniform float uPixelRatio;

attribute vec3 initialPos;
attribute vec3 targetPos;
attribute float aRandom;

varying float vAlpha;
varying vec3 vColor;
uniform vec3 uColor1;
uniform vec3 uColor2;

// Cubic Bezier Ease
float easeInOutCubic(float x) {
    return x < 0.5 ? 4.0 * x * x * x : 1.0 - pow(-2.0 * x + 2.0, 3.0) / 2.0;
}

void main() {
    // Stagger animation based on random attribute
    float progress = smoothstep(0.0, 1.0, (uMix * 1.5) - (aRandom * 0.5));
    progress = clamp(progress, 0.0, 1.0);
    progress = easeInOutCubic(progress);

    // Morph positions
    vec3 pos = mix(initialPos, targetPos, progress);

    // Add some noise/turbulence during transition
    float noise = sin(uTime * 5.0 + aRandom * 10.0) * sin(progress * 3.14);
    pos += noise * 0.5;

    // Rotation for the Eye mode
    if(progress > 0.8) {
        float angle = uTime * 0.2 * (1.0 + aRandom * 0.5);
        float s = sin(angle);
        float c = cos(angle);
        // Rotate around Y axis
        float nx = pos.x * c - pos.z * s;
        float nz = pos.x * s + pos.z * c;
        pos.x = nx;
        pos.z = nz;
    }

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Size attenuation
    gl_PointSize = (4.0 + aRandom * 3.0) * uPixelRatio * (15.0 / -mvPosition.z);

    // Color mix: Text(Black) -> Energy(Red)
    vColor = mix(uColor1, uColor2, progress * progress); // Turns redder as it forms eye

    // Opacity control
    vAlpha = 1.0;
    // Fade in particles as paper fades out
    if(uMix < 0.1) vAlpha = uMix * 10.0;
}
`;

export const particleFragmentShader = `
varying float vAlpha;
varying vec3 vColor;

void main() {
    // Circular particle
    float r = distance(gl_PointCoord, vec2(0.5));
    if(r > 0.5) discard;

    // Soft edge
    float glow = 1.0 - (r * 2.0);
    glow = pow(glow, 1.5);

    gl_FragColor = vec4(vColor, vAlpha * glow);
}
`;
