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
    <Sphere ref={ref} args={[1, 64, 64]} scale={1.18}>
      <MeshDistortMaterial color="#7c3aed" distort={0.3} speed={1.6} roughness={0.3} />
    </Sphere>
  );
}

export function FloatingOrb() {
  return (
    <div className="relative h-64 w-full overflow-hidden rounded-2xl sm:h-72">
      <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_center,transparent_45%,rgba(5,5,16,0.85)_100%)]" />
      <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 4.8], fov: 55 }}>
        <ambientLight intensity={0.8} />
        <pointLight intensity={1.3} position={[2, 3, 4]} color="#00f5ff" />
        <Orb />
      </Canvas>
    </div>
  );
}
