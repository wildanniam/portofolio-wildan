"use client";

import * as React from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Line, Sparkles } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import * as THREE from "three";
import { projects, type Project } from "@/data/portfolio";

const HERO_PROJECTS = ["fradium", "agentpay", "nova-ai-wallet", "specheal", "paygate-stellar"];
const CORE_ORIGIN = new THREE.Vector3(0, 0, 0);

const projectColors: Record<Project["accent"], string> = {
  mint: "#9effc9",
  cyan: "#73e7ff",
  violet: "#9b8cff",
  amber: "#ffd166",
  rose: "#ff7a59",
  blue: "#8fb8ff",
};

type ReactorProject = Pick<
  Project,
  "slug" | "title" | "focus" | "accent" | "role" | "signal" | "status" | "achievement"
> & {
  color: string;
  position: THREE.Vector3;
  rotation: [number, number, number];
};

type InteractionRef = React.MutableRefObject<number>;
type HeroInteractionMode = "idle" | "preview" | "pinned" | "clearing";

function useHeroProjects() {
  return React.useMemo<ReactorProject[]>(() => {
    return HERO_PROJECTS.map((slug, index) => {
      const project = projects.find((item) => item.slug === slug) ?? projects[index];
      const angle = -0.95 + index * 0.47;
      const radius = index % 2 === 0 ? 1.92 : 2.24;
      return {
        slug: project.slug,
        title: project.title,
        focus: project.focus,
        accent: project.accent,
        role: project.role,
        signal: project.signal,
        status: project.status,
        achievement: project.achievement,
        color: projectColors[project.accent],
        position: new THREE.Vector3(
          Math.cos(angle) * radius,
          (index - 2) * 0.28,
          Math.sin(angle) * 0.72
        ),
        rotation: [0.18, -angle + Math.PI / 2, index % 2 ? -0.22 : 0.18],
      };
    });
  }, []);
}

function DataRibbon({
  from,
  to,
  color,
  active,
}: {
  from: THREE.Vector3;
  to: THREE.Vector3;
  color: string;
  active: boolean;
}) {
  const points = React.useMemo(() => {
    const control = from.clone().add(to).multiplyScalar(0.5);
    control.y += 0.34;
    control.z += 0.54;
    return new THREE.QuadraticBezierCurve3(from, control, to).getPoints(52);
  }, [from, to]);

  return (
    <Line
      points={points}
      color={color}
      transparent
      opacity={active ? 0.72 : 0.14}
      lineWidth={active ? 2.2 : 0.8}
    />
  );
}

function EnergyPacket({
  from,
  to,
  color,
  active,
}: {
  from: THREE.Vector3;
  to: THREE.Vector3;
  color: string;
  active: boolean;
}) {
  const packetRef = React.useRef<THREE.Mesh>(null);
  const curve = React.useMemo(() => {
    const control = from.clone().add(to).multiplyScalar(0.5);
    control.y += 0.42;
    control.z += 0.62;
    return new THREE.QuadraticBezierCurve3(from, control, to);
  }, [from, to]);

  useFrame(({ clock }) => {
    if (!packetRef.current || !active) return;
    const progress = (clock.elapsedTime * 0.36) % 1;
    const point = curve.getPoint(progress);
    packetRef.current.position.copy(point);
    packetRef.current.scale.setScalar(0.72 + Math.sin(clock.elapsedTime * 9) * 0.16);
  });

  if (!active) return null;

  return (
    <mesh ref={packetRef}>
      <sphereGeometry args={[0.045, 16, 16]} />
      <meshBasicMaterial color={color} transparent opacity={0.92} depthWrite={false} />
      <pointLight color={color} intensity={0.84} distance={0.82} />
    </mesh>
  );
}

function LightStreaks({ active }: { active: boolean }) {
  const streaks = React.useMemo(
    () =>
      Array.from({ length: 16 }).map((_, index) => {
        const y = -1.35 + index * 0.18;
        const z = -0.48 + (index % 5) * 0.16;
        return {
          start: new THREE.Vector3(-0.82, y, z),
          end: new THREE.Vector3(2.45, y + Math.sin(index) * 0.12, z + 0.08),
          color: index % 3 === 0 ? "#ffd166" : "#73e7ff",
          width: index % 4 === 0 ? 1.5 : 0.7,
        };
      }),
    []
  );

  return (
    <group>
      {streaks.map((streak, index) => (
        <Line
          key={index}
          points={[streak.start, streak.end]}
          color={streak.color}
          transparent
          opacity={active ? 0.12 : 0.055}
          lineWidth={streak.width}
        />
      ))}
    </group>
  );
}

function ReactorShell({ interaction }: { interaction: InteractionRef }) {
  const shellRef = React.useRef<THREE.Mesh>(null);
  const shellTwoRef = React.useRef<THREE.Mesh>(null);
  const matRef = React.useRef<THREE.MeshBasicMaterial>(null);
  const matTwoRef = React.useRef<THREE.MeshBasicMaterial>(null);

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime;
    const s = interaction.current;
    if (shellRef.current) {
      shellRef.current.rotation.y = t * (0.12 + s * 0.10);
      shellRef.current.rotation.z = -t * 0.045;
    }
    if (shellTwoRef.current) {
      shellTwoRef.current.rotation.x = 0.35 + t * 0.055;
      shellTwoRef.current.rotation.y = -t * (0.08 + s * 0.10);
    }
    if (matRef.current) {
      matRef.current.opacity = THREE.MathUtils.damp(matRef.current.opacity, 0.062 + s * 0.028, 5, delta);
    }
    if (matTwoRef.current) {
      matTwoRef.current.opacity = THREE.MathUtils.damp(matTwoRef.current.opacity, 0.034 + s * 0.022, 5, delta);
    }
  });

  return (
    <group>
      <mesh ref={shellRef} scale={[1.18, 0.82, 1.18]}>
        <sphereGeometry args={[1, 48, 24]} />
        <meshBasicMaterial ref={matRef} color="#73e7ff" transparent opacity={0.062} wireframe depthWrite={false} />
      </mesh>
      <mesh ref={shellTwoRef} scale={[0.86, 1.08, 0.86]}>
        <sphereGeometry args={[1, 32, 18]} />
        <meshBasicMaterial ref={matTwoRef} color="#9effc9" transparent opacity={0.034} wireframe depthWrite={false} />
      </mesh>
    </group>
  );
}

function OrbitalRings({ interaction }: { interaction: InteractionRef }) {
  const ringGroupRef = React.useRef<THREE.Group>(null);
  const matARef = React.useRef<THREE.MeshBasicMaterial>(null);
  const matBRef = React.useRef<THREE.MeshBasicMaterial>(null);
  const matCRef = React.useRef<THREE.MeshBasicMaterial>(null);

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime;
    const s = interaction.current;
    if (ringGroupRef.current) {
      ringGroupRef.current.rotation.y = t * (0.12 + s * 0.12);
      ringGroupRef.current.rotation.x = -0.25 + Math.sin(t * 0.4) * 0.035;
    }
    if (matARef.current) {
      matARef.current.opacity = THREE.MathUtils.damp(matARef.current.opacity, 0.36 + s * 0.14, 5, delta);
    }
    if (matBRef.current) {
      matBRef.current.opacity = THREE.MathUtils.damp(matBRef.current.opacity, 0.22 + s * 0.10, 5, delta);
    }
    if (matCRef.current) {
      matCRef.current.opacity = THREE.MathUtils.damp(matCRef.current.opacity, 0.16 + s * 0.08, 5, delta);
    }
  });

  return (
    <group ref={ringGroupRef}>
      <mesh rotation={[1.1, 0.14, -0.44] as [number, number, number]}>
        <torusGeometry args={[1.05, 0.006, 12, 220]} />
        <meshBasicMaterial ref={matARef} color="#73e7ff" transparent opacity={0.36} depthWrite={false} />
      </mesh>
      <mesh rotation={[1.52, -0.28, 0.18] as [number, number, number]}>
        <torusGeometry args={[1.38, 0.004, 12, 220]} />
        <meshBasicMaterial ref={matBRef} color="#9effc9" transparent opacity={0.22} depthWrite={false} />
      </mesh>
      <mesh rotation={[1.22, 0.38, 0.7] as [number, number, number]}>
        <torusGeometry args={[1.72, 0.003, 12, 220]} />
        <meshBasicMaterial ref={matCRef} color="#ffd166" transparent opacity={0.16} depthWrite={false} />
      </mesh>
    </group>
  );
}

function ReactorSweep({ interaction }: { interaction: InteractionRef }) {
  const groupRef = React.useRef<THREE.Group>(null);
  const materialRef = React.useRef<THREE.MeshBasicMaterial>(null);

  useFrame((_, delta) => {
    const s = interaction.current;
    if (groupRef.current) {
      groupRef.current.rotation.y += (0.14 + s * 0.24) * delta;
    }
    if (materialRef.current) {
      materialRef.current.opacity = THREE.MathUtils.damp(materialRef.current.opacity, 0.022 + s * 0.052, 6, delta);
    }
  });

  return (
    <group ref={groupRef} rotation={[1.18, -0.15, -0.52]}>
      <mesh>
        <torusGeometry args={[3.3, 0.007, 8, 96, Math.PI * 1.18]} />
        <meshBasicMaterial
          ref={materialRef}
          color="#73e7ff"
          transparent
          opacity={0.022}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

function AutonomousCore({ interaction }: { interaction: InteractionRef }) {
  const groupRef = React.useRef<THREE.Group>(null);
  const coreRef = React.useRef<THREE.Mesh>(null);
  const innerRef = React.useRef<THREE.Mesh>(null);
  const glassRef = React.useRef<THREE.Mesh>(null);
  const lensRef = React.useRef<THREE.Mesh>(null);
  const coreMaterialRef = React.useRef<THREE.MeshStandardMaterial>(null);
  const innerMaterialRef = React.useRef<THREE.MeshStandardMaterial>(null);
  const glassMaterialRef = React.useRef<THREE.MeshPhysicalMaterial>(null);
  const lensMaterialRef = React.useRef<THREE.MeshBasicMaterial>(null);

  useFrame(({ clock, pointer }, delta) => {
    const t = clock.elapsedTime;
    const s = interaction.current;

    if (groupRef.current) {
      groupRef.current.rotation.x = THREE.MathUtils.damp(groupRef.current.rotation.x, pointer.y * 0.18, 4.5, delta);
      groupRef.current.rotation.y = THREE.MathUtils.damp(groupRef.current.rotation.y, pointer.x * 0.22, 4.5, delta);
    }

    if (coreRef.current) {
      coreRef.current.rotation.x = t * (0.28 + s * 0.14);
      coreRef.current.rotation.y = t * (0.48 + s * 0.24);
      coreRef.current.scale.setScalar(1 + Math.sin(t * 2.3) * (0.032 + s * 0.022));
    }

    if (innerRef.current) {
      innerRef.current.rotation.y = -t * 0.58;
      innerRef.current.rotation.z = t * 0.18;
    }

    if (glassRef.current) {
      glassRef.current.rotation.y = t * 0.032;
      glassRef.current.rotation.x = -0.18 + Math.sin(t * 0.24) * 0.02;
    }

    if (lensRef.current) {
      lensRef.current.rotation.z = -t * (0.22 + s * 0.08);
    }

    if (coreMaterialRef.current) {
      coreMaterialRef.current.emissiveIntensity = THREE.MathUtils.damp(
        coreMaterialRef.current.emissiveIntensity,
        1.7 + s * 1.1,
        7,
        delta
      );
    }

    if (innerMaterialRef.current) {
      innerMaterialRef.current.emissiveIntensity = THREE.MathUtils.damp(
        innerMaterialRef.current.emissiveIntensity,
        0.85 + s * 0.85,
        7,
        delta
      );
    }

    if (glassMaterialRef.current) {
      glassMaterialRef.current.opacity = THREE.MathUtils.damp(glassMaterialRef.current.opacity, 0.08 + s * 0.06, 7, delta);
    }

    if (lensMaterialRef.current) {
      lensMaterialRef.current.opacity = THREE.MathUtils.damp(
        lensMaterialRef.current.opacity,
        0.38 + s * 0.28 + Math.sin(t * 2.1) * 0.02,
        7,
        delta
      );
    }

  });

  return (
    <group ref={groupRef}>
      {/* Glass envelope */}
      <mesh ref={glassRef} rotation={[-0.18, 0, 0.08]}>
        <sphereGeometry args={[0.78, 28, 14]} />
        <meshPhysicalMaterial
          ref={glassMaterialRef}
          color="#73e7ff"
          emissive="#73e7ff"
          emissiveIntensity={0.06}
          metalness={0.12}
          roughness={0.04}
          transparent
          opacity={0.08}
          depthWrite={false}
          side={THREE.DoubleSide}
          clearcoat={1}
          clearcoatRoughness={0.06}
        />
      </mesh>
      {/* Cyan dodecahedron inner shell */}
      <mesh ref={innerRef} scale={0.74}>
        <dodecahedronGeometry args={[0.55, 1]} />
        <meshStandardMaterial
          ref={innerMaterialRef}
          color="#9effc9"
          emissive="#73e7ff"
          emissiveIntensity={0.85}
          metalness={0.46}
          roughness={0.2}
          transparent
          opacity={0.38}
        />
      </mesh>
      {/* Rose/orange icosahedron nucleus */}
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[0.48, 2]} />
        <meshStandardMaterial
          ref={coreMaterialRef}
          color="#f6c29b"
          emissive="#ff7a59"
          emissiveIntensity={1.7}
          metalness={0.56}
          roughness={0.13}
        />
      </mesh>
      {/* Wireframe outer shell */}
      <mesh scale={1.18}>
        <icosahedronGeometry args={[0.5, 1]} />
        <meshBasicMaterial color="#73e7ff" transparent opacity={0.08} wireframe depthWrite={false} />
      </mesh>
      {/* Rose lens ring */}
      <mesh ref={lensRef} position={[0, 0, 0.38]}>
        <ringGeometry args={[0.14, 0.23, 48]} />
        <meshBasicMaterial
          ref={lensMaterialRef}
          color="#ff7a59"
          transparent
          opacity={0.38}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

function ProjectModule({
  project,
  active,
  dimmed,
  locked,
  onHover,
  onLeave,
  onLock,
}: {
  project: ReactorProject;
  active: boolean;
  dimmed: boolean;
  locked: boolean;
  onHover: (project: ReactorProject) => void;
  onLeave: () => void;
  onLock: (project: ReactorProject) => void;
}) {
  const groupRef = React.useRef<THREE.Group>(null);
  const bodyRef = React.useRef<THREE.MeshStandardMaterial>(null);
  const sensorRef = React.useRef<THREE.MeshStandardMaterial>(null);

  useFrame(({ clock }, delta) => {
    if (!groupRef.current) return;
    const t = clock.elapsedTime;
    groupRef.current.position.y = project.position.y + Math.sin(t * 1.4 + project.position.x) * 0.035;
    groupRef.current.scale.setScalar(
      THREE.MathUtils.damp(groupRef.current.scale.x, active ? 1.10 : locked ? 1.04 : 1, 8, delta)
    );
    if (bodyRef.current) {
      bodyRef.current.emissiveIntensity = THREE.MathUtils.damp(
        bodyRef.current.emissiveIntensity,
        dimmed ? 0.01 : active ? 1.25 : locked ? 0.55 : 0.03,
        8,
        delta
      );
      bodyRef.current.opacity = THREE.MathUtils.damp(
        bodyRef.current.opacity,
        dimmed ? 0.28 : 0.94,
        7,
        delta
      );
    }
    if (sensorRef.current) {
      sensorRef.current.emissiveIntensity = THREE.MathUtils.damp(
        sensorRef.current.emissiveIntensity,
        dimmed ? 0.04 : active ? 1.8 : locked ? 0.9 : 0.18,
        8,
        delta
      );
    }
  });

  const cornerOpacity = active ? 0.62 : locked ? 0.28 : 0.07;
  const stripOpacity = active ? 0.88 : locked ? 0.42 : 0.07;

  return (
    <group
      ref={groupRef}
      position={project.position}
      rotation={project.rotation}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
        onHover(project);
      }}
      onPointerMove={(e) => e.stopPropagation()}
      onPointerOut={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "";
        onLeave();
      }}
      onClick={(e) => {
        e.stopPropagation();
        onLock(project);
      }}
    >
      {/* Hitbox */}
      <mesh>
        <boxGeometry args={[0.72, 0.38, 0.22]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {/* Main panel body — flat, wide instrument panel */}
      <mesh>
        <boxGeometry args={[0.54, 0.20, 0.032]} />
        <meshStandardMaterial
          ref={bodyRef}
          color="#060d0b"
          emissive={project.color}
          emissiveIntensity={0.03}
          metalness={0.84}
          roughness={0.16}
          transparent
          opacity={0.94}
        />
      </mesh>
      {/* Top border strip — project color */}
      <mesh position={[0, 0.106, 0.017]}>
        <boxGeometry args={[0.54, 0.008, 0.002]} />
        <meshBasicMaterial color={project.color} transparent opacity={stripOpacity} depthWrite={false} />
      </mesh>
      {/* Left structural edge */}
      <mesh position={[-0.271, 0, 0]}>
        <boxGeometry args={[0.008, 0.20, 0.034]} />
        <meshBasicMaterial color="#73e7ff" transparent opacity={active ? 0.22 : 0.06} depthWrite={false} />
      </mesh>
      {/* Sensor housing — protruding cylinder */}
      <mesh position={[0.16, 0, 0.020]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.026, 0.026, 0.008, 20]} />
        <meshStandardMaterial color="#080f0d" metalness={0.92} roughness={0.08} />
      </mesh>
      {/* Sensor lens — glowing face */}
      <mesh position={[0.16, 0, 0.025]}>
        <circleGeometry args={[0.018, 18]} />
        <meshStandardMaterial
          ref={sensorRef}
          color={project.color}
          emissive={project.color}
          emissiveIntensity={0.18}
          depthWrite={false}
        />
      </mesh>
      {/* Sensor ring */}
      <mesh position={[0.16, 0, 0.018]}>
        <ringGeometry args={[0.022, 0.028, 20]} />
        <meshBasicMaterial color="#73e7ff" transparent opacity={active ? 0.28 : 0.08} depthWrite={false} />
      </mesh>
      {/* Scan lines — center data area */}
      <mesh position={[-0.06, 0.042, 0.017]}>
        <boxGeometry args={[0.26, 0.0015, 0.001]} />
        <meshBasicMaterial color="#73e7ff" transparent opacity={active ? 0.18 : 0.07} depthWrite={false} />
      </mesh>
      <mesh position={[-0.06, 0.010, 0.017]}>
        <boxGeometry args={[0.26, 0.0015, 0.001]} />
        <meshBasicMaterial color="#73e7ff" transparent opacity={active ? 0.14 : 0.06} depthWrite={false} />
      </mesh>
      <mesh position={[-0.06, -0.022, 0.017]}>
        <boxGeometry args={[0.22, 0.0015, 0.001]} />
        <meshBasicMaterial color="#73e7ff" transparent opacity={active ? 0.10 : 0.05} depthWrite={false} />
      </mesh>
      {/* Corner bracket TL — horizontal */}
      <mesh position={[-0.248, 0.088, 0.017]}>
        <boxGeometry args={[0.044, 0.007, 0.001]} />
        <meshBasicMaterial color={project.color} transparent opacity={cornerOpacity} depthWrite={false} />
      </mesh>
      {/* Corner bracket TL — vertical */}
      <mesh position={[-0.265, 0.071, 0.017]}>
        <boxGeometry args={[0.007, 0.042, 0.001]} />
        <meshBasicMaterial color={project.color} transparent opacity={cornerOpacity} depthWrite={false} />
      </mesh>
      {/* Corner bracket TR — horizontal */}
      <mesh position={[0.248, 0.088, 0.017]}>
        <boxGeometry args={[0.044, 0.007, 0.001]} />
        <meshBasicMaterial color={project.color} transparent opacity={cornerOpacity} depthWrite={false} />
      </mesh>
      {/* Corner bracket TR — vertical */}
      <mesh position={[0.265, 0.071, 0.017]}>
        <boxGeometry args={[0.007, 0.042, 0.001]} />
        <meshBasicMaterial color={project.color} transparent opacity={cornerOpacity} depthWrite={false} />
      </mesh>
      {/* Status beacon */}
      <mesh position={[-0.18, -0.072, 0.017]}>
        <sphereGeometry args={[0.007, 8, 8]} />
        <meshBasicMaterial
          color={project.color}
          transparent
          opacity={active ? 1 : locked ? 0.62 : 0.12}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      {/* Glow plane — additive behind panel */}
      <mesh position={[0, 0, -0.002]}>
        <boxGeometry args={[0.56, 0.22, 0.001]} />
        <meshBasicMaterial
          color={project.color}
          transparent
          opacity={active ? 0.12 : locked ? 0.04 : 0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      {/* Lock indicator bar */}
      {locked ? (
        <mesh position={[0, -0.126, 0.017]}>
          <boxGeometry args={[0.30, 0.006, 0.001]} />
          <meshBasicMaterial color={project.color} transparent opacity={0.72} depthWrite={false} />
        </mesh>
      ) : null}
    </group>
  );
}

function HeroParticles() {
  return (
    <>
      <Sparkles count={112} scale={[4.8, 3.1, 3.6]} size={1.2} speed={0.28} color="#73e7ff" opacity={0.48} />
      <Sparkles count={28} scale={[2.6, 1.8, 2.4]} size={2.4} speed={0.16} color="#ffd166" opacity={0.18} />
    </>
  );
}

function HoverTooltip({
  activeProject,
  previewProject,
  locked,
  mode,
  onClear,
}: {
  activeProject: ReactorProject | null;
  previewProject: ReactorProject | null;
  locked: boolean;
  mode: HeroInteractionMode;
  onClear: () => void;
}) {
  const label =
    mode === "pinned"
      ? "pinned evidence"
      : mode === "preview"
        ? "active satellite"
        : mode === "clearing"
          ? "signal fading"
          : "reactor idle";
  const previewLabel = locked && previewProject && previewProject.slug !== activeProject?.slug;

  return (
    <div
      className={`pointer-events-none absolute right-[6%] top-[18%] z-20 hidden w-[17.5rem] rounded-[10px] border border-white/12 bg-[#060e0b]/82 p-4 shadow-[0_20px_80px_rgba(0,0,0,0.44)] backdrop-blur-xl transition duration-300 lg:block ${
        activeProject ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <p
          className="font-mono text-[9px] uppercase tracking-[0.24em]"
          style={{ color: activeProject?.color ?? "#73e7ff" }}
        >
          {label}
        </p>
        <span className="rounded-full border border-white/10 px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.16em] text-white/38">
          {activeProject?.status ?? "ready"}
        </span>
      </div>
      <p className="mt-3 text-[15px] font-semibold tracking-tight text-[color:var(--ink)]">
        {activeProject?.title ?? "Project"}
      </p>
      <p className="mt-1 text-xs leading-5 text-[color:var(--muted-ink)]">
        {activeProject?.focus ?? "Hover a satellite"}
      </p>
      {activeProject?.signal ? (
        <p className="mt-3 border-t border-white/8 pt-3 text-xs leading-5 text-[color:var(--ink)]">
          {activeProject.signal}
        </p>
      ) : null}
      {activeProject?.achievement ? (
        <div
          className="mt-2 rounded-[6px] border px-2.5 py-1.5 text-[11px] font-medium"
          style={{
            borderColor: `${activeProject.color}55`,
            backgroundColor: `${activeProject.color}12`,
            color: activeProject.color,
          }}
        >
          {activeProject.achievement}
        </div>
      ) : null}
      <div className="mt-3 flex items-center justify-between border-t border-white/8 pt-3">
        <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-white/28">
          {previewLabel
            ? `scanning ${previewProject.title}`
            : locked
              ? "click stage to clear"
              : "click satellite to pin"}
        </p>
        {locked ? (
          <button
            type="button"
            className="pointer-events-auto rounded-[5px] border border-white/12 px-2 py-1 font-mono text-[8px] uppercase tracking-[0.16em] text-white/52 transition hover:border-white/28 hover:text-white"
            onClick={onClear}
          >
            Clear
          </button>
        ) : null}
      </div>
    </div>
  );
}

function ReactorScene({
  activeSlug,
  previewSlug,
  setActiveSlug,
  lockedSlug,
  setLockedSlug,
  isInteracting,
  setInteracting,
  mode,
  setClearing,
  sceneActive,
}: {
  activeSlug: string | null;
  previewSlug: string | null;
  setActiveSlug: (slug: string | null) => void;
  lockedSlug: string | null;
  setLockedSlug: (slug: string | null) => void;
  isInteracting: boolean;
  setInteracting: (active: boolean) => void;
  mode: HeroInteractionMode;
  setClearing: (active: boolean) => void;
  sceneActive: boolean;
}) {
  const groupRef = React.useRef<THREE.Group>(null);
  const interactionRef = React.useRef(0);
  const hoverLeaveTimerRef = React.useRef<number | null>(null);
  const projectsForHero = useHeroProjects();
  const activeProject = projectsForHero.find((p) => p.slug === activeSlug) ?? null;
  const activeSignal = Boolean(activeProject || isInteracting || mode === "clearing");

  const cancelHoverLeave = React.useCallback(() => {
    if (hoverLeaveTimerRef.current) {
      window.clearTimeout(hoverLeaveTimerRef.current);
      hoverLeaveTimerRef.current = null;
    }
  }, []);

  const clearHoverWithGrace = React.useCallback(() => {
    cancelHoverLeave();
    hoverLeaveTimerRef.current = window.setTimeout(() => {
      setInteracting(false);
      setActiveSlug(null);
      if (!lockedSlug) {
        setClearing(true);
        window.setTimeout(() => setClearing(false), 220);
      }
    }, 150);
  }, [cancelHoverLeave, lockedSlug, setActiveSlug, setClearing, setInteracting]);

  React.useEffect(() => {
    return () => {
      cancelHoverLeave();
      document.body.style.cursor = "";
    };
  }, [cancelHoverLeave]);

  useFrame(({ clock, camera, pointer }, delta) => {
    if (!sceneActive) return;
    const t = clock.elapsedTime;
    interactionRef.current = THREE.MathUtils.damp(interactionRef.current, activeSignal ? 1 : 0, 4.8, delta);
    if (groupRef.current) {
      groupRef.current.rotation.y = THREE.MathUtils.damp(
        groupRef.current.rotation.y,
        -0.32 + Math.sin(t * 0.18) * 0.055 + pointer.x * (0.075 + interactionRef.current * 0.035),
        3.8,
        delta
      );
      groupRef.current.rotation.x = THREE.MathUtils.damp(
        groupRef.current.rotation.x,
        -0.04 + pointer.y * (0.055 + interactionRef.current * 0.035),
        3.8,
        delta
      );
      groupRef.current.position.x = THREE.MathUtils.damp(groupRef.current.position.x, 2.85, 5, delta);
      groupRef.current.position.y = THREE.MathUtils.damp(groupRef.current.position.y, -0.02, 5, delta);
    }
    camera.position.x = THREE.MathUtils.damp(camera.position.x, pointer.x * 0.22, 3.7, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, 0.14 + pointer.y * 0.1, 3.7, delta);
    camera.lookAt(1.8, 0, 0);
  });

  return (
    <>
      <ambientLight intensity={0.42} />
      <pointLight position={[2.8, 3.6, 3.8]} intensity={3.4} color="#73e7ff" />
      <pointLight position={[-2.2, -1.4, 2.2]} intensity={1.8} color="#9effc9" />
      <pointLight position={[0.4, 0.2, 2.4]} intensity={2.1} color={activeProject?.color ?? "#ff7a59"} />
      <group
        ref={groupRef}
        scale={0.72}
        onPointerEnter={() => {
          cancelHoverLeave();
          setInteracting(true);
        }}
        onPointerLeave={() => {
          clearHoverWithGrace();
          document.body.style.cursor = "";
        }}
      >
        <Float speed={1.4} rotationIntensity={0.08} floatIntensity={0.18}>
          <ReactorShell interaction={interactionRef} />
          <OrbitalRings interaction={interactionRef} />
          <ReactorSweep interaction={interactionRef} />
          <AutonomousCore interaction={interactionRef} />
          <LightStreaks active={activeSignal} />
          {projectsForHero.map((project) => {
            const active = project.slug === activeSlug;
            const dimmed = Boolean(activeSlug && !active && project.slug !== lockedSlug);
            const locked = project.slug === lockedSlug;
            return (
              <React.Fragment key={project.slug}>
                <DataRibbon from={CORE_ORIGIN} to={project.position} color={project.color} active={active} />
                <EnergyPacket from={project.position} to={CORE_ORIGIN} color={project.color} active={active} />
                <ProjectModule
                  project={project}
                  active={active}
                  dimmed={dimmed}
                  locked={locked}
                  onHover={(next) => {
                    cancelHoverLeave();
                    setInteracting(true);
                    setClearing(false);
                    setActiveSlug(next.slug);
                  }}
                  onLeave={() => {
                    clearHoverWithGrace();
                  }}
                  onLock={(next) => {
                    setLockedSlug(lockedSlug === next.slug ? null : next.slug);
                    setActiveSlug(null);
                    setClearing(false);
                  }}
                />
              </React.Fragment>
            );
          })}
        </Float>
      </group>
      <HeroParticles />
      <EffectComposer>
        <Bloom
          intensity={activeProject ? 1.05 : isInteracting ? 0.9 : 0.72}
          luminanceThreshold={0.14}
          luminanceSmoothing={0.78}
          mipmapBlur
        />
      </EffectComposer>
    </>
  );
}

export function CommandDeckScene({
  active = true,
  onReady,
}: {
  active?: boolean;
  onReady?: () => void;
}) {
  const [previewSlug, setPreviewSlug] = React.useState<string | null>(null);
  const [pinnedSlug, setPinnedSlug] = React.useState<string | null>(null);
  const [isInteracting, setInteracting] = React.useState(false);
  const [isClearing, setClearing] = React.useState(false);
  const clearTimerRef = React.useRef<number | null>(null);
  const activeSlug = previewSlug ?? pinnedSlug;
  const evidenceSlug = pinnedSlug ?? previewSlug;
  const mode: HeroInteractionMode = pinnedSlug ? "pinned" : previewSlug ? "preview" : isClearing ? "clearing" : "idle";
  const projectsForHero = useHeroProjects();
  const activeProject = projectsForHero.find((p) => p.slug === evidenceSlug) ?? null;
  const previewProject = projectsForHero.find((p) => p.slug === previewSlug) ?? null;

  const clearStage = React.useCallback(() => {
    if (clearTimerRef.current) window.clearTimeout(clearTimerRef.current);
    setPreviewSlug(null);
    setPinnedSlug(null);
    setInteracting(false);
    setClearing(true);
    clearTimerRef.current = window.setTimeout(() => {
      setClearing(false);
      clearTimerRef.current = null;
    }, 260);
  }, []);

  React.useEffect(() => {
    return () => {
      if (clearTimerRef.current) window.clearTimeout(clearTimerRef.current);
    };
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_68%_44%,rgba(115,231,255,0.14),transparent_28%),radial-gradient(circle_at_82%_58%,rgba(158,255,201,0.07),transparent_25%)]" />
      <div className="absolute inset-0 opacity-45 [background:radial-gradient(circle,rgba(159,239,255,0.48)_1px,transparent_1.7px),radial-gradient(circle,rgba(255,209,102,0.28)_1px,transparent_1.7px)] [background-position:18px_42px,90px_24px] [background-size:170px_150px,260px_220px]" />
      <div className="absolute inset-0 opacity-38 [background:linear-gradient(90deg,rgba(115,231,255,0.03)_1px,transparent_1px),linear-gradient(rgba(158,255,201,0.02)_1px,transparent_1px)] [background-size:128px_128px]" />
      <div className="absolute right-[7%] top-[19%] hidden h-[58%] w-[46%] rounded-full border border-[color:var(--signal-cyan)]/10 lg:block" />
      <Canvas
        className="pointer-events-auto absolute inset-0 h-full w-full"
        camera={{ position: [0, 0.14, 4.65], fov: 38 }}
        dpr={[1, 1.7]}
        frameloop={active ? "always" : "demand"}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 0.88;
          gl.outputColorSpace = THREE.SRGBColorSpace;
          window.requestAnimationFrame(() => onReady?.());
        }}
        onPointerMissed={clearStage}
      >
        <ReactorScene
          activeSlug={activeSlug}
          previewSlug={previewSlug}
          setActiveSlug={setPreviewSlug}
          lockedSlug={pinnedSlug}
          setLockedSlug={setPinnedSlug}
          isInteracting={isInteracting || isClearing}
          setInteracting={setInteracting}
          mode={mode}
          setClearing={setClearing}
          sceneActive={active}
        />
      </Canvas>
      <HoverTooltip
        activeProject={activeProject}
        previewProject={previewProject}
        locked={Boolean(pinnedSlug)}
        mode={mode}
        onClear={clearStage}
      />
      <div className="absolute inset-y-0 left-0 w-[68%] bg-gradient-to-r from-[color:var(--void)] via-[color:var(--void)]/96 to-transparent max-md:w-full max-md:from-[color:var(--void)]/98 max-md:via-[color:var(--void)]/94 max-md:to-[color:var(--void)]/74" />
      <div className="absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-[color:var(--void)] via-[color:var(--void)]/76 to-transparent" />
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[color:var(--void)]/84 to-transparent" />
    </div>
  );
}
