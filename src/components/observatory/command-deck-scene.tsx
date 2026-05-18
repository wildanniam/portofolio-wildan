"use client";

import * as React from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Billboard, Line, Sparkles, Text } from "@react-three/drei";
import * as THREE from "three";
import { projects } from "@/data/portfolio";

const projectColors: Record<string, string> = {
  mint: "#9effc9",
  cyan: "#73e7ff",
  violet: "#9b8cff",
  amber: "#ffd166",
  rose: "#ff7a59",
  blue: "#8fb8ff",
};

const commandNodes = [
  { label: "observe", angle: -0.2, radius: 1.35, color: "#73e7ff" },
  { label: "reason", angle: 1.24, radius: 1.05, color: "#9b8cff" },
  { label: "verify", angle: 2.54, radius: 1.5, color: "#ffd166" },
  { label: "settle", angle: 3.7, radius: 1.14, color: "#9effc9" },
  { label: "ship", angle: 5.08, radius: 1.42, color: "#ff7a59" },
] as const;

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

function DataArc({
  from,
  to,
  color,
  opacity = 0.32,
}: {
  from: THREE.Vector3;
  to: THREE.Vector3;
  color: string;
  opacity?: number;
}) {
  const points = React.useMemo(() => {
    const mid = from.clone().add(to).multiplyScalar(0.5);
    mid.y += 0.28 + Math.abs(from.x - to.x) * 0.05;
    mid.z += 0.34;
    const curve = new THREE.QuadraticBezierCurve3(from, mid, to);
    return curve.getPoints(38);
  }, [from, to]);

  return <Line points={points} color={color} transparent opacity={opacity} lineWidth={1} />;
}

function HoloNode({
  label,
  position,
  color,
  size = 1,
  muted = false,
}: {
  label: string;
  position: THREE.Vector3;
  color: string;
  size?: number;
  muted?: boolean;
}) {
  const groupRef = React.useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const pulse = 1 + Math.sin(clock.elapsedTime * 1.8 + position.x * 1.7) * 0.055;
    groupRef.current.scale.setScalar(size * pulse);
  });

  return (
    <group ref={groupRef} position={position}>
      <mesh>
        <sphereGeometry args={[0.052, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={muted ? 0.55 : 1.85}
          metalness={0.35}
          roughness={0.18}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.24, 36, 36]} />
        <meshBasicMaterial color={color} transparent opacity={muted ? 0.035 : 0.105} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.16, 0.0026, 8, 80]} />
        <meshBasicMaterial color={color} transparent opacity={muted ? 0.1 : 0.34} />
      </mesh>
      <Billboard position={[0, -0.24, 0]}>
        <Text
          fontSize={muted ? 0.043 : 0.052}
          color={muted ? "#748077" : "#edf7f0"}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.002}
          outlineColor="#020403"
        >
          {label}
        </Text>
      </Billboard>
    </group>
  );
}

function OrbitalInstrument() {
  return (
    <group>
      {[0.72, 1.04, 1.38, 1.86, 2.18].map((radius, index) => (
        <mesh
          key={radius}
          rotation={[
            Math.PI / 2 + (index % 2) * 0.18,
            index % 2 ? 0.12 : -0.08,
            index * 0.4,
          ]}
        >
          <torusGeometry args={[radius, index === 2 ? 0.006 : 0.0032, 12, 220]} />
          <meshBasicMaterial
            color={index === 1 ? "#9effc9" : index === 3 ? "#ffd166" : "#73e7ff"}
            transparent
            opacity={index === 2 ? 0.26 : 0.12}
          />
        </mesh>
      ))}

      {Array.from({ length: 22 }).map((_, index) => {
        const angle = (index / 22) * Math.PI * 2;
        const radius = index % 3 === 0 ? 1.84 : 1.38;
        return (
          <mesh
            key={index}
            position={[Math.cos(angle) * radius, Math.sin(angle * 1.7) * 0.08, Math.sin(angle) * radius * 0.34]}
            rotation={[0, angle, 0.42]}
          >
            <boxGeometry args={[0.045, 0.008, 0.16]} />
            <meshBasicMaterial color={index % 4 === 0 ? "#ffd166" : "#73e7ff"} transparent opacity={0.36} />
          </mesh>
        );
      })}
    </group>
  );
}

function AgentCore() {
  const coreRef = React.useRef<THREE.Mesh>(null);
  const shellRef = React.useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (coreRef.current) {
      coreRef.current.rotation.x = t * 0.27;
      coreRef.current.rotation.y = t * 0.58;
      const pulse = 1 + Math.sin(t * 2.4) * 0.035;
      coreRef.current.scale.setScalar(pulse);
    }
    if (shellRef.current) {
      shellRef.current.rotation.y = -t * 0.14;
      shellRef.current.rotation.z = t * 0.06;
    }
  });

  return (
    <group>
      <mesh ref={shellRef}>
        <sphereGeometry args={[0.72, 32, 18]} />
        <meshBasicMaterial color="#73e7ff" transparent opacity={0.055} wireframe />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.52, 48, 32]} />
        <meshBasicMaterial color="#73e7ff" transparent opacity={0.075} />
      </mesh>
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[0.31, 2]} />
        <meshStandardMaterial
          color="#f2a27c"
          emissive="#ff7a59"
          emissiveIntensity={1.7}
          metalness={0.52}
          roughness={0.16}
          transparent
          opacity={0.86}
        />
      </mesh>
      <mesh rotation={[0.8, 0.2, 0.46]}>
        <torusGeometry args={[0.43, 0.004, 12, 160]} />
        <meshBasicMaterial color="#ffd166" transparent opacity={0.42} />
      </mesh>
      <mesh rotation={[1.3, -0.3, -0.52]}>
        <torusGeometry args={[0.58, 0.003, 12, 160]} />
        <meshBasicMaterial color="#9effc9" transparent opacity={0.34} />
      </mesh>
    </group>
  );
}

function ObservatoryConstellation() {
  const groupRef = React.useRef<THREE.Group>(null);
  const scrollRef = useScrollProgress();

  const projectPositions = React.useMemo(() => {
    return projects.map((project, index) => {
      const angle = (index / projects.length) * Math.PI * 2 + 0.64;
      const radius = index % 2 === 0 ? 2.1 : 2.48;
      return {
        project,
        position: new THREE.Vector3(
          Math.cos(angle) * radius,
          Math.sin(angle * 1.1) * 0.36,
          Math.sin(angle) * radius * 0.55
        ),
      };
    });
  }, []);

  const commandPositions = React.useMemo(() => {
    return commandNodes.map((node, index) => ({
      ...node,
      position: new THREE.Vector3(
        Math.cos(node.angle) * node.radius,
        index % 2 ? 0.42 : -0.26,
        Math.sin(node.angle) * node.radius * 0.52
      ),
    }));
  }, []);

  useFrame(({ clock, camera, pointer }) => {
    const t = clock.elapsedTime;
    const progress = scrollRef.current;

    if (groupRef.current) {
      groupRef.current.rotation.y = -0.2 + t * 0.032 + pointer.x * 0.12 + progress * 0.9;
      groupRef.current.rotation.x = -0.08 + pointer.y * 0.075 + progress * 0.08;
      groupRef.current.position.x = 0.7 - progress * 0.4;
      groupRef.current.position.y = -0.02 - progress * 0.46;
    }

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, pointer.x * 0.34, 0.035);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, 0.22 + pointer.y * 0.16, 0.035);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, 4.8 - progress * 0.52, 0.03);
    camera.lookAt(0.26, 0.02, 0);
  });

  return (
    <group ref={groupRef} scale={0.9}>
      <OrbitalInstrument />
      <AgentCore />

      {commandPositions.map((node) => (
        <React.Fragment key={node.label}>
          <DataArc from={new THREE.Vector3(0, 0, 0)} to={node.position} color={node.color} opacity={0.31} />
          <HoloNode label={node.label} position={node.position} color={node.color} size={0.92} />
        </React.Fragment>
      ))}

      {projectPositions.map(({ project, position }, index) => {
        const color = projectColors[project.accent] ?? "#73e7ff";
        const next = projectPositions[(index + 1) % projectPositions.length].position;
        return (
          <React.Fragment key={project.slug}>
            <DataArc from={position} to={next} color={color} opacity={0.12} />
            <DataArc from={new THREE.Vector3(0, 0, 0)} to={position} color={color} opacity={0.13} />
            <HoloNode
              label={project.title}
              position={position}
              color={color}
              size={project.slug === "fradium" || project.slug === "agentpay" ? 0.96 : 0.78}
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
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_62%_40%,rgba(115,231,255,0.24),transparent_28%),radial-gradient(circle_at_82%_55%,rgba(158,255,201,0.12),transparent_26%),radial-gradient(circle_at_18%_24%,rgba(255,122,89,0.1),transparent_24%)]" />
      <div className="absolute inset-0 opacity-55 [background:linear-gradient(90deg,rgba(115,231,255,0.05)_1px,transparent_1px),linear-gradient(rgba(158,255,201,0.035)_1px,transparent_1px)] [background-size:120px_120px]" />
      <div className="absolute left-[46%] top-[16%] h-[58%] w-px bg-gradient-to-b from-transparent via-[color:var(--signal-cyan)]/30 to-transparent" />
      <Canvas
        className="absolute inset-0 h-full w-full"
        camera={{ position: [0, 0.22, 4.8], fov: 40 }}
        dpr={[1, 1.6]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={0.55} />
        <pointLight position={[2.8, 3.8, 4.2]} intensity={3.1} color="#73e7ff" />
        <pointLight position={[-3.4, -1.4, 2.8]} intensity={1.5} color="#9effc9" />
        <pointLight position={[0.8, 0.2, 2.4]} intensity={1.45} color="#ff7a59" />
        <Sparkles count={96} scale={[5.8, 3.4, 4.2]} size={1.1} speed={0.2} color="#73e7ff" opacity={0.42} />
        <ObservatoryConstellation />
      </Canvas>
      <div className="absolute inset-y-0 left-0 w-[58%] bg-gradient-to-r from-[color:var(--void)] via-[color:var(--void)]/86 to-transparent max-md:w-full max-md:from-[color:var(--void)]/96 max-md:via-[color:var(--void)]/86 max-md:to-[color:var(--void)]/34" />
      <div className="absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-[color:var(--void)] via-[color:var(--void)]/74 to-transparent" />
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[color:var(--void)]/82 to-transparent" />
    </div>
  );
}
