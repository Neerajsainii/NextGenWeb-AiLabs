"use client";

import { Canvas } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import { useMemo, useRef } from "react";
import type { Group } from "three";
import { useFrame } from "@react-three/fiber";

function ParticleCloud() {
  const ref = useRef<Group>(null);
  const positions = useMemo(() => {
    const values = new Float32Array(2000 * 3);
    for (let i = 0; i < 2000 * 3; i += 1) {
      values[i] = (Math.random() - 0.5) * 8;
    }
    return values;
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.getElapsedTime() * 0.07;
    ref.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.2) * 0.2;
  });

  return (
    <group ref={ref}>
      <Points positions={positions} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          size={0.03}
          sizeAttenuation
          depthWrite={false}
          color="#00f5ff"
        />
      </Points>
    </group>
  );
}

export function HeroParticles() {
  return (
    <div className="absolute inset-0 opacity-80">
      <Canvas camera={{ position: [0, 0, 3] }}>
        <ambientLight intensity={0.8} />
        <ParticleCloud />
      </Canvas>
    </div>
  );
}
