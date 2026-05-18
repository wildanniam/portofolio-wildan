"use client";

import * as React from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Billboard, Line, Sparkles, Text } from "@react-three/drei";
import * as THREE from "three";
import { projects } from "@/data/portfolio";

const systemNodes = [
  { label: "Agent", radius: 1.25, angle: 0.15, y: 0.32, color: "#73e7ff" },
  { label: "Wallet", radius: 1.68, angle: 1.12, y: 0.12, color: "#9effc9" },
  { label: "Risk", radius: 0.78, angle: 2.25, y: -0.12, color: "#ff7a59" },
  { label: "Verifier", radius: 1.44, angle: 3.18, y: -0.34, color: "#ffd166" },
  { label: "Payment", radius: 1.86, angle: 4.15, y: -0.18, color: "#9b8cff" },
  { label: "Contract", radius: 1.5, angle: 5.15, y: 0.28, color: "#f3f7ef" },
] as const;

const projectColors: Record<string, string> = {
  mint: "#9effc9",
  cyan: "#73e7ff",
  violet: "#9b8cff",
  amber: "#ffd166",
  rose: "#ff7a59",
  blue: "#8fb8ff",
};

function useScrollProgress() {
  const scrollRef = React.useRef(0);

  React.useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      scrollRef.current = max > 0 ? window.scrollY / max : 0;
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return scrollRef;
}

function OrbitNode({
  label,
  position,
  color,
  scale = 1,
  muted = false,
}: {
  label: string;
  position: THREE.Vector3;
  color: string;
  scale?: number;
  muted?: boolean;
}) {
  const meshRef = React.useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const pulse = Math.sin(clock.elapsedTime * 1.7 + position.x) * 0.08;
    meshRef.current.scale.setScalar(scale + pulse);
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.052, 28, 28]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={muted ? 0.8 : 1.8}
          metalness={0.22}
          roughness={0.28}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.15 * scale, 28, 28]} />
        <meshBasicMaterial color={color} transparent opacity={muted ? 0.07 : 0.16} />
      </mesh>
      <Billboard position={[0, -0.18, 0]}>
        <Text
          fontSize={muted ? 0.046 : 0.058}
          color={muted ? "#7d8f85" : "#f3f7ef"}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.002}
          outlineColor="#030504"
        >
          {label}
        </Text>
      </Billboard>
    </group>
  );
}

function OrbitRings() {
  return (
    <group rotation={[Math.PI / 2, 0, 0]}>
      {[0.8, 1.24, 1.68, 2.12, 2.56].map((radius, index) => (
        <mesh key={radius}>
          <torusGeometry args={[radius, index === 2 ? 0.0035 : 0.002, 10, 180]} />
          <meshBasicMaterial
            color={index === 2 ? "#73e7ff" : "#9effc9"}
            transparent
            opacity={index === 2 ? 0.24 : 0.11}
          />
        </mesh>
      ))}
    </group>
  );
}

function DeckConstellation() {
  const groupRef = React.useRef<THREE.Group>(null);
  const coreRef = React.useRef<THREE.Mesh>(null);
  const scrollRef = useScrollProgress();

  const projectPositions = React.useMemo(() => {
    return projects.map((project, index) => {
      const angle = (index / projects.length) * Math.PI * 2 + 0.35;
      const radius = 2.25 + (index % 2) * 0.28;
      return {
        project,
        position: new THREE.Vector3(
          Math.cos(angle) * radius,
          index % 2 === 0 ? 0.42 : -0.44,
          Math.sin(angle) * radius * 0.72
        ),
      };
    });
  }, []);

  const systemPositions = React.useMemo(() => {
    return systemNodes.map((node) => ({
      ...node,
      position: new THREE.Vector3(
        Math.cos(node.angle) * node.radius,
        node.y,
        Math.sin(node.angle) * node.radius * 0.74
      ),
    }));
  }, []);

  useFrame(({ clock, camera, pointer }) => {
    const t = clock.elapsedTime;
    const progress = scrollRef.current;
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.045 + pointer.x * 0.14 + progress * 0.95;
      groupRef.current.rotation.x = -0.18 + pointer.y * 0.08 + progress * 0.1;
      groupRef.current.position.x = 0.48 - progress * 0.3;
      groupRef.current.position.y = -0.08 - progress * 0.55;
    }
    if (coreRef.current) {
      coreRef.current.rotation.y = t * 0.55;
      coreRef.current.rotation.x = t * 0.22;
    }
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, pointer.x * 0.24, 0.04);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, 0.2 + pointer.y * 0.16, 0.04);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, 5.0 - progress * 0.55, 0.03);
    camera.lookAt(0, 0, 0);
  });

  return (
    <group ref={groupRef} scale={0.76}>
      <OrbitRings />
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[0.22, 1]} />
        <meshStandardMaterial
          color="#ff7a59"
          emissive="#ff7a59"
          emissiveIntensity={1.25}
          metalness={0.42}
          roughness={0.2}
          transparent
          opacity={0.68}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.48, 32, 32]} />
        <meshBasicMaterial color="#73e7ff" transparent opacity={0.07} />
      </mesh>

      {systemPositions.map((node) => (
        <React.Fragment key={node.label}>
          <Line
            points={[new THREE.Vector3(0, 0, 0), node.position]}
            color={node.color}
            transparent
            opacity={0.27}
            lineWidth={1}
          />
          <OrbitNode
            label={node.label}
            position={node.position}
            color={node.color}
            scale={1.1}
          />
        </React.Fragment>
      ))}

      {projectPositions.map(({ project, position }, index) => {
        const color = projectColors[project.accent] ?? "#73e7ff";
        const neighbor = projectPositions[(index + 1) % projectPositions.length].position;
        return (
          <React.Fragment key={project.slug}>
            <Line
              points={[position, neighbor]}
              color={color}
              transparent
              opacity={0.17}
              lineWidth={1}
            />
            <Line
              points={[position, new THREE.Vector3(0, 0, 0)]}
              color={color}
              transparent
              opacity={0.13}
              lineWidth={1}
            />
            <OrbitNode
              label={project.title}
              position={position}
              color={color}
              scale={0.96}
              muted={index > 3}
            />
          </React.Fragment>
        );
      })}
    </group>
  );
}

export function CommandDeckScene() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_66%_35%,rgba(115,231,255,0.18),transparent_26%),radial-gradient(circle_at_72%_62%,rgba(158,255,201,0.12),transparent_26%),radial-gradient(circle_at_18%_22%,rgba(255,122,89,0.11),transparent_24%)]" />
      <div className="absolute inset-0 opacity-70 [background:linear-gradient(90deg,rgba(115,231,255,0.04)_1px,transparent_1px),linear-gradient(rgba(158,255,201,0.035)_1px,transparent_1px)] [background-size:86px_86px]" />
      <Canvas
        className="absolute inset-0 h-full w-full"
        camera={{ position: [0, 0.2, 5], fov: 42 }}
        dpr={[1, 1.55]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={0.65} />
        <pointLight position={[3.2, 3.8, 4.2]} intensity={3.2} color="#73e7ff" />
        <pointLight position={[-3.8, -1.6, 2.4]} intensity={1.6} color="#9effc9" />
        <pointLight position={[0, 0, 3.2]} intensity={1.2} color="#ff7a59" />
        <Sparkles count={72} scale={[5.6, 2.8, 3.8]} size={1.1} speed={0.22} color="#73e7ff" opacity={0.36} />
        <DeckConstellation />
      </Canvas>
      <div className="absolute inset-y-0 left-0 w-[64%] bg-gradient-to-r from-[color:var(--void)] via-[color:var(--void)]/90 to-transparent max-md:w-full max-md:from-[color:var(--void)]/96 max-md:via-[color:var(--void)]/84 max-md:to-[color:var(--void)]/35" />
      <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[color:var(--void)] via-[color:var(--void)]/68 to-transparent" />
    </div>
  );
}
