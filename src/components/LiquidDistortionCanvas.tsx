'use client';

import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  // Make plane cover the entire screen
  gl_Position = vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform sampler2D uTexture;
uniform float uTime;
uniform vec2 uMouse;
uniform float uHover;
uniform vec2 uResolution;
uniform vec2 uImageRes;
uniform float uIsDark;
varying vec2 vUv;

uniform float uRevealProgress;

// Classic Perlin noise
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1; i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m ; m = m*m ;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

// object-cover function
vec2 getCoverUv(vec2 uv, vec2 resolution, vec2 texResolution) {
    vec2 s = resolution;
    vec2 i = texResolution;
    float rs = s.x / s.y;
    float ri = i.x / i.y;
    vec2 newRes = rs < ri ? vec2(i.x * s.y / i.y, s.y) : vec2(s.x, i.y * s.x / i.x);
    vec2 offset = (rs < ri ? vec2((newRes.x - s.x) / 2.0, 0.0) : vec2(0.0, (newRes.y - s.y) / 2.0)) / newRes;
    return uv * s / newRes + offset;
}

void main() {
  // Fix aspect ratio for mouse distance
  vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
  
  // get object-cover UVs
  vec2 uv = getCoverUv(vUv, uResolution, uImageRes);
  
  // Calculate distance from mouse (accounting for aspect ratio)
  float dist = distance(vUv * aspect, uMouse * aspect);
  
  // 1. Water surface ripples (Perlin noise)
  float noise = snoise(vUv * 3.0 + uTime * 0.4);
  
  // 2. Concentric wave from mouse
  float wave = sin(dist * 30.0 - uTime * 6.0) * 0.015;
  
  // Localize distortion tightly to the mouse
  float mask = smoothstep(0.4, 0.0, dist);
  
  // Combine displacements
  vec2 displacement = normalize(vUv - uMouse) * wave * mask;
  displacement += vec2(noise * 0.015) * uHover * mask;
  
  // Distort UVs
  vec2 distortedUv = uv + displacement * uHover;
  
  vec4 texColor = texture2D(uTexture, distortedUv);
  
  if (uIsDark > 0.5) {
    texColor.rgb *= 0.15; 
  }
  
  vec4 finalColor = texColor;
  
  // Burn Reveal Logic
  float distFromCenter = distance(vUv * aspect, vec2(0.5) * aspect);
  float maxRadius = 1.5;
  
  // Shift the radius so 0.0 is completely hidden and 1.0 is completely revealed (fixes after-effect)
  float currentRadius = -0.1 + uRevealProgress * (maxRadius + 0.2);
  
  // Finer, more organic edge using two octaves of noise
  float edgeNoise = snoise(vUv * 25.0 - uTime * 0.4) * 0.05 
                  + snoise(vUv * 70.0 - uTime * 0.7) * 0.02;
                  
  float edgeDist = distFromCenter - currentRadius + edgeNoise;
  
  if (edgeDist > 0.0) {
      // Unrevealed area - opaque black (no glowing colors)
      finalColor = vec4(0.0, 0.0, 0.0, 1.0);
  } else {
      // Revealed area - transparent unless hovered
      finalColor.a *= uHover;
      
      // Finer, smaller flying black particles (soot/ash) near the inner edge
      float particleNoise = snoise(vUv * 220.0 + uTime * 2.0);
      if (edgeDist > -0.12 && particleNoise > 0.4) {
          float particleAlpha = smoothstep(0.4, 0.7, particleNoise);
          // Fade particles as they get further from the edge
          float distFade = smoothstep(-0.12, 0.0, edgeDist);
          finalColor = mix(finalColor, vec4(0.0, 0.0, 0.0, 1.0), particleAlpha * distFade);
      }
  }
  
  gl_FragColor = finalColor;
}
`;

const LiquidMesh = ({ src, mousePos, isHovered, isDark, isRevealed, initialReveal }: { src: string, mousePos: { x: number, y: number }, isHovered: boolean, isDark: boolean, isRevealed: boolean, initialReveal: boolean }) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { size } = useThree();
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load(src, (tex) => {
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      setTexture(tex);
    });
  }, [src]);

  const uniforms = useMemo(() => ({
    uTexture: { value: null },
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    uHover: { value: 0 },
    uResolution: { value: new THREE.Vector2(1, 1) },
    uImageRes: { value: new THREE.Vector2(1, 1) },
    uIsDark: { value: isDark ? 1.0 : 0.0 },
    uRevealProgress: { value: initialReveal ? 1.0 : 0.0 }
  }), []);

  useEffect(() => {
    let startTime = performance.now();
    let startVal = materialRef.current?.uniforms.uRevealProgress.value ?? (initialReveal ? 1.0 : 0.0);
    let targetVal = isRevealed ? 1.0 : 0.0;
    
    if (startVal === targetVal) return; // No animation needed

    // cubic bezier easing similar to [0.6, 0.05, 0.15, 1]
    const easeInOut = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    let frameId: number;
    const animate = (time: number) => {
      if (!materialRef.current) return;
      let progress = (time - startTime) / 1600.0; // 1.6s duration
      if (progress >= 1.0) {
        materialRef.current.uniforms.uRevealProgress.value = targetVal;
        return;
      }
      materialRef.current.uniforms.uRevealProgress.value = startVal + (targetVal - startVal) * easeInOut(progress);
      frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [isRevealed]);

  useEffect(() => {
    if (texture && materialRef.current) {
      materialRef.current.uniforms.uTexture.value = texture;
      materialRef.current.uniforms.uImageRes.value.set(texture.image.width, texture.image.height);
    }
  }, [texture]);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      
      // Update resolution
      materialRef.current.uniforms.uResolution.value.set(size.width, size.height);
      
      // Smoothly follow mouse
      const targetMouseX = mousePos.x;
      const targetMouseY = 1.0 - mousePos.y; // WebGL Y is flipped
      
      materialRef.current.uniforms.uMouse.value.x += (targetMouseX - materialRef.current.uniforms.uMouse.value.x) * 0.1;
      materialRef.current.uniforms.uMouse.value.y += (targetMouseY - materialRef.current.uniforms.uMouse.value.y) * 0.1;
      
      // Smooth hover transition
      const targetHover = isHovered ? 1.0 : 0.0;
      materialRef.current.uniforms.uHover.value += (targetHover - materialRef.current.uniforms.uHover.value) * 0.1;
      
      // Update dark mode
      materialRef.current.uniforms.uIsDark.value = isDark ? 1.0 : 0.0;
    }
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2, 1, 1]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={true}
      />
    </mesh>
  );
};

export default function LiquidDistortionCanvas({ src, isHovered, isDark = false, isRevealed = true }: { src: string, isHovered: boolean, isDark?: boolean, isRevealed?: boolean }) {
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  
  const [initialReveal, setInitialReveal] = useState(isRevealed);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const prevIsRevealed = useRef(isRevealed);

  useEffect(() => {
    if (prevIsRevealed.current !== isRevealed) {
      setInitialReveal(prevIsRevealed.current);
      setIsTransitioning(true);
      const timeout = setTimeout(() => {
        setIsTransitioning(false);
      }, 1700);
      prevIsRevealed.current = isRevealed;
      return () => clearTimeout(timeout);
    }
  }, [isRevealed]);

  const needsWebGL = isHovered || isTransitioning;
  
  if (!needsWebGL) {
    if (!isRevealed) {
      return <div className="absolute inset-0 bg-black z-10" />;
    }
    return null;
  }

  return (
    <div 
      className="absolute inset-0 w-full h-full z-10"
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMousePos({
          x: (e.clientX - rect.left) / rect.width,
          y: (e.clientY - rect.top) / rect.height
        });
      }}
    >
      <Canvas camera={{ position: [0, 0, 1] }} gl={{ alpha: true }}>
        <LiquidMesh src={src} mousePos={mousePos} isHovered={isHovered} isDark={isDark} isRevealed={isRevealed} initialReveal={initialReveal} />
      </Canvas>
    </div>
  );
}
