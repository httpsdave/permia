'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform float uTime;
uniform vec2 uResolution;
varying vec2 vUv;

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

void main() {
  vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
  
  vec2 p = vUv * 3.0; 
  float t = uTime * 0.03; 
  
  vec2 q = vec2(snoise(p + t), snoise(p + vec2(1.2, 3.4) - t));
  vec2 r = vec2(snoise(p + q * 2.0 + vec2(3.1, 1.7) + t * 0.5), snoise(p + q * 2.0 + vec2(4.2, 8.5) - t * 0.5));
  float f = snoise(p + r * 2.0);
  
  vec3 marbleCol = mix(vec3(0.01, 0.01, 0.01), vec3(0.08, 0.08, 0.08), smoothstep(0.2, 0.8, f));
  float streak = smoothstep(0.85, 1.0, snoise(p + r * 3.0 + t));
  marbleCol += vec3(0.35) * streak;
  
  gl_FragColor = vec4(marbleCol, 1.0);
}
`;

const LoadingMesh = () => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { size } = useThree();

  const uniforms = React.useMemo(() => ({
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2(1, 1) },
  }), []);

  useFrame(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = performance.now() * 0.001;
      materialRef.current.uniforms.uResolution.value.set(size.width, size.height);
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
      />
    </mesh>
  );
};

export function LoadingScreen() {
  const [show, setShow] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'counting' | 'permia' | 'hidden'>('idle');
  const [count, setCount] = useState(0);
  const controls = useAnimation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const hasVisited = sessionStorage.getItem('permia_visited');
    if (!hasVisited) {
      setShow(true);
      sessionStorage.setItem('permia_visited', 'true');
    }
  }, []);

  useEffect(() => {
    if (!show) return;

    // Sequence:
    // 0.0s - 1.5s: idle (just liquid)
    // 1.5s - 2.5s: counting 0 -> 100
    // 2.5s - 3.5s: 'permia' text reveal
    // 3.5s - 4.5s: slide up

    let timeout1 = setTimeout(() => {
      setPhase('counting');
      let currentCount = 0;
      const countInterval = setInterval(() => {
        currentCount += Math.floor(Math.random() * 5) + 3; // Random increments
        if (currentCount >= 100) {
          currentCount = 100;
          clearInterval(countInterval);
        }
        setCount(currentCount);
      }, 30);
    }, 1500);

    let timeout2 = setTimeout(() => {
      setPhase('permia');
    }, 2500);

    let timeout3 = setTimeout(() => {
      controls.start({ y: "-100%", transition: { duration: 1, ease: [0.76, 0, 0.24, 1] } }).then(() => {
        setPhase('hidden');
        setShow(false);
      });
    }, 3500);

    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      clearTimeout(timeout3);
    };
  }, [show, controls]);

  if (!show) return null;

  return (
    <motion.div 
      className="fixed inset-0 z-[100] bg-black pointer-events-none flex items-center justify-center"
      initial={{ y: 0 }}
      animate={controls}
    >
      <div className="absolute inset-0 z-0">
        {mounted && (
          <Canvas camera={{ position: [0, 0, 1] }} gl={{ powerPreference: "high-performance", antialias: false }} dpr={[1, 1.5]}>
            <LoadingMesh />
          </Canvas>
        )}
      </div>
      
      <div className="relative z-10 flex flex-col items-center justify-center font-sans tracking-widest text-[#EFF2ED]">
        <AnimatePresence mode="wait">
          {phase === 'counting' && (
            <motion.div
              key="counter"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-sm font-bold uppercase"
            >
              {count}
            </motion.div>
          )}
          {phase === 'permia' && (
            <motion.div
              key="permia"
              initial={{ clipPath: "inset(100% 0% 0% 0%)", y: 20 }}
              animate={{ clipPath: "inset(0% 0% 0% 0%)", y: 0 }}
              transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
              className="text-base font-bold lowercase tracking-widest"
            >
              permia
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
