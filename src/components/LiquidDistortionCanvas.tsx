'use client';

import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// Suppress THREE.Clock deprecation warning caused by react-three-fiber internal usage
if (typeof window !== 'undefined') {
  const originalWarn = console.warn;
  console.warn = (...args) => {
    if (args[0] && typeof args[0] === 'string' && args[0].includes('THREE.Clock: This module has been deprecated')) {
      return;
    }
    originalWarn.apply(console, args);
  };
}

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
  
  // Procedural Dark Liquid Marble
  vec3 marbleCol = vec3(0.0);
  if (uRevealProgress < 1.0 || uIsDark > 0.5) {
      vec2 p = vUv * 3.0; // Zoomed in slightly for larger, calmer waves
      float t = uTime * 0.03; // Drastically slowed down
      float d = distance(vUv * aspect, uMouse * aspect);
      float m = smoothstep(0.5, 0.0, d);
      p += normalize(vUv - uMouse) * sin(d * 20.0 - uTime * 2.0) * 0.1 * uHover * m;
      p += vec2(snoise(vUv * 5.0 + uTime * 0.5)) * 0.05 * uHover * m;

      vec2 q = vec2(snoise(p + t), snoise(p + vec2(1.2, 3.4) - t));
      vec2 r = vec2(snoise(p + q * 2.0 + vec2(3.1, 1.7) + t * 0.5), snoise(p + q * 2.0 + vec2(4.2, 8.5) - t * 0.5));
      float f = snoise(p + r * 2.0);
      
      // More blackness, fewer particles/liquid elements
      marbleCol = mix(vec3(0.01, 0.01, 0.01), vec3(0.08, 0.08, 0.08), smoothstep(0.2, 0.8, f));
      
      float streak = smoothstep(0.85, 1.0, snoise(p + r * 3.0 + t));
      marbleCol += vec3(0.35) * streak;
  }
  
  if (edgeDist > 0.0) {
      // Unrevealed area - show dark liquid marble
      finalColor = vec4(marbleCol, 1.0);
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

const textureCache = new Map<string, THREE.Texture>();

const LiquidMesh = ({ src, mousePos, isHovered, isDark, isRevealed, initialReveal }: { src: string, mousePos: { x: number, y: number }, isHovered: boolean, isDark: boolean, isRevealed: boolean, initialReveal: boolean }) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { size } = useThree();
  const [texture, setTexture] = useState<THREE.Texture | null>(() => textureCache.get(src) || null);

  useEffect(() => {
    if (!textureCache.has(src)) {
      const loader = new THREE.TextureLoader();
      loader.load(src, (tex) => {
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        textureCache.set(src, tex);
        setTexture(tex);
      });
    }
  }, [src]);

  const uniforms = useMemo(() => ({
    uTexture: { value: null },
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(mousePos.x, 1.0 - mousePos.y) },
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
      
      const duration = targetVal === 0.0 ? 600.0 : 1600.0; // Faster unreveal
      let progress = (time - startTime) / duration;
      
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
      // Use performance.now() to bypass internal R3F state.clock initialization warning
      materialRef.current.uniforms.uTime.value = performance.now() * 0.001;
      
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

export default function LiquidDistortionCanvas({ src, isHovered, isDark = false, isRevealed = true, isVisible = true }: { src: string, isHovered: boolean, isDark?: boolean, isRevealed?: boolean, isVisible?: boolean }) {
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [hasMovedCursor, setHasMovedCursor] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isHovered) {
      setHasMovedCursor(false);
    }
  }, [isHovered]);
  
  const [isTransitioningState, setIsTransitioning] = useState(false);
  const prevIsRevealed = useRef(isRevealed);
  
  const isTransitioning = isTransitioningState || prevIsRevealed.current !== isRevealed;

  useEffect(() => {
    if (prevIsRevealed.current !== isRevealed) {
      setIsTransitioning(true);
      const timeoutDuration = isRevealed ? 1700 : 700;
      const timeout = setTimeout(() => {
        setIsTransitioning(false);
      }, timeoutDuration);
      prevIsRevealed.current = isRevealed;
      return () => clearTimeout(timeout);
    }
  }, [isRevealed]);

  const needsWebGL = isVisible && (isHovered || isTransitioning || !isRevealed);
  const activeHover = isHovered && hasMovedCursor;
  
  return (
    <>
      {!isRevealed && !needsWebGL && (
        <div className="absolute inset-0 bg-black z-10" />
      )}
      <div 
        ref={containerRef}
        className={`absolute inset-0 w-full h-full z-10 ${needsWebGL ? 'block' : 'hidden'}`}
        onMouseMove={(e) => {
          setHasMovedCursor(true);
          const rect = e.currentTarget.getBoundingClientRect();
          setMousePos({
            x: (e.clientX - rect.left) / rect.width,
            y: (e.clientY - rect.top) / rect.height
          });
        }}
      >
        {mounted && needsWebGL && (
          <Canvas camera={{ position: [0, 0, 1] }} gl={{ alpha: true, antialias: false, powerPreference: "high-performance" }} dpr={[1, 1.5]}>
            <LiquidMesh 
              src={src} 
              mousePos={mousePos} 
              isHovered={activeHover} 
              isDark={isDark} 
              isRevealed={isRevealed} 
              initialReveal={prevIsRevealed.current} 
            />
          </Canvas>
        )}
      </div>
    </>
  );
}
