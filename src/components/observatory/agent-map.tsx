"use client";

import * as React from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Billboard, Line, Text } from "@react-three/drei";
import * as THREE from "three";

const nodes = [
  { label: "AI Agent", position: [-1.9, 0.85, 0.25], color: "#73e7ff" },
  { label: "Wallet", position: [1.45, 1.05, -0.35], color: "#9effc9" },
  { label: "Risk Engine", position: [0.15, -0.05, 0.75], color: "#ff7a59" },
  { label: "Verifier", position: [-1.25, -1.15, -0.25], color: "#ffd166" },
  { label: "Payment Rail", position: [1.7, -1.0, 0.35], color: "#9b8cff" },
  { label: "Smart Contract", position: [0.0, 1.75, -0.7], color: "#f3f7ef" },
] as const;

const edges = [
  [0, 2],
  [1, 2],
  [2, 3],
  [2, 4],
  [3, 5],
  [4, 5],
  [0, 5],
  [1, 4],
] as const;

function NodeSphere({
  label,
  position,
  color,
  index,
}: {
  label: string;
  position: readonly [number, number, number];
  color: string;
  index: number;
}) {
  const ref = React.useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.scale.setScalar(1 + Math.sin(t * 1.8 + index) * 0.08);
  });

  return (
    <group position={position}>
      <mesh ref={ref}>
        <sphereGeometry args={[0.095, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.2}
          roughness={0.25}
          metalness={0.3}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.19, 32, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.12} />
      </mesh>
      <Billboard position={[0, -0.28, 0]}>
        <Text
          fontSize={0.105}
          color="#f3f7ef"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.003}
          outlineColor="#050706"
        >
          {label}
        </Text>
      </Billboard>
    </group>
  );
}

function Constellation() {
  const groupRef = React.useRef<THREE.Group>(null);

  useFrame(({ clock, pointer }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.rotation.y = t * 0.08 + pointer.x * 0.18;
    groupRef.current.rotation.x = -0.12 + pointer.y * 0.12;
  });

  return (
    <group ref={groupRef}>
      {edges.map(([from, to]) => (
        <Line
          key={`${from}-${to}`}
          points={[nodes[from].position, nodes[to].position]}
          color="#73e7ff"
          transparent
          opacity={0.34}
          lineWidth={1}
        />
      ))}
      {nodes.map((node, index) => (
        <NodeSphere
          key={node.label}
          label={node.label}
          position={node.position}
          color={node.color}
          index={index}
        />
      ))}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -1.7, 0]}>
        <torusGeometry args={[2.15, 0.004, 12, 160]} />
        <meshBasicMaterial color="#9effc9" transparent opacity={0.28} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -1.7, 0]}>
        <torusGeometry args={[1.35, 0.003, 12, 120]} />
        <meshBasicMaterial color="#9b8cff" transparent opacity={0.2} />
      </mesh>
    </group>
  );
}

export function AgentMap() {
  return (
    <div className="relative h-[390px] w-full overflow-hidden rounded-[8px] border border-white/10 bg-[#07100d]/70 shadow-[0_0_80px_rgba(115,231,255,0.12)] md:h-[480px]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(115,231,255,0.18),transparent_34%),radial-gradient(circle_at_70%_65%,rgba(158,255,201,0.12),transparent_30%)]" />
      <Canvas
        camera={{ position: [0, 0.2, 5.2], fov: 45 }}
        dpr={[1, 1.6]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.8} />
        <pointLight position={[3, 4, 5]} intensity={2.2} color="#73e7ff" />
        <pointLight position={[-4, -2, 3]} intensity={1.4} color="#9effc9" />
        <Constellation />
      </Canvas>
      <div className="pointer-events-none absolute inset-x-4 bottom-4 grid grid-cols-3 gap-2 text-[10px] uppercase tracking-[0.2em] text-white/55 md:inset-x-6 md:bottom-6">
        <span>observe</span>
        <span className="text-center">verify</span>
        <span className="text-right">execute</span>
      </div>
    </div>
  );
}
