"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { MeshDistortMaterial, Sphere } from "@react-three/drei";
import { useRef } from "react";
import type { Mesh } from "three";

function Orb() {
  const ref = useRef<Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.getElapsedTime() * 0.4;
  });

  return (
    <Sphere ref={ref} args={[1, 64, 64]} scale={1.4}>
      <MeshDistortMaterial color="#7c3aed" distort={0.3} speed={1.6} roughness={0.3} />
    </Sphere>
  );
}

export function FloatingOrb() {
  return (
    <div className="h-64 w-full">
      <Canvas camera={{ position: [0, 0, 4] }}>
        <ambientLight intensity={0.8} />
        <pointLight intensity={1.3} position={[2, 3, 4]} color="#00f5ff" />
        <Orb />
      </Canvas>
    </div>
  );
}
