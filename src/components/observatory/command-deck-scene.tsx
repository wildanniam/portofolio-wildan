"use client";

import * as React from "react";
import { Canvas, useFrame } from "@react-three/fiber";
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

type ReactorProject = Pick<Project, "slug" | "title" | "focus" | "accent"> & {
  color: string;
  position: THREE.Vector3;
  rotation: [number, number, number];
};

type InteractionRef = React.MutableRefObject<number>;

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

function CurveLine({
  points,
  color,
  targetOpacity,
  interaction,
  baseOpacity = 0,
  boostOpacity = 0,
}: {
  points: THREE.Vector3[];
  color: string;
  targetOpacity?: number;
  interaction?: InteractionRef;
  baseOpacity?: number;
  boostOpacity?: number;
}) {
  const materialRef = React.useRef<THREE.LineBasicMaterial | null>(null);
  const geometry = React.useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);
  const line = React.useMemo(
    () =>
      new THREE.Line(
        geometry,
        new THREE.LineBasicMaterial({
          color,
          transparent: true,
          opacity: 0,
        })
      ),
    [color, geometry]
  );

  React.useEffect(() => {
    materialRef.current = line.material as THREE.LineBasicMaterial;
  }, [line]);

  useFrame((_, delta) => {
    if (!materialRef.current) return;
    const target = targetOpacity ?? baseOpacity + (interaction?.current ?? 0) * boostOpacity;
    materialRef.current.opacity = THREE.MathUtils.damp(materialRef.current.opacity, target, 7, delta);
  });

  React.useEffect(() => {
    return () => {
      line.geometry.dispose();
      const material = line.material;
      if (Array.isArray(material)) {
        material.forEach((item) => item.dispose());
      } else {
        material.dispose();
      }
    };
  }, [line]);

  return <primitive object={line} />;
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
    return new THREE.QuadraticBezierCurve3(from, control, to).getPoints(30);
  }, [from, to]);

  return <CurveLine points={points} color={color} targetOpacity={active ? 0.62 : 0.12} />;
}

function ActiveDataTube({
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
  const materialRef = React.useRef<THREE.MeshBasicMaterial>(null);
  const curve = React.useMemo(() => {
    const control = from.clone().add(to).multiplyScalar(0.5);
    control.y += 0.42;
    control.z += 0.62;
    return new THREE.QuadraticBezierCurve3(from, control, to);
  }, [from, to]);
  const geometry = React.useMemo(() => new THREE.TubeGeometry(curve, 34, 0.007, 6, false), [curve]);

  useFrame(({ clock }, delta) => {
    if (!materialRef.current) return;
    const target = active ? 0.38 + Math.sin(clock.elapsedTime * 2.6) * 0.05 : 0;
    materialRef.current.opacity = THREE.MathUtils.damp(materialRef.current.opacity, Math.max(0, target), 8, delta);
  });

  React.useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <mesh geometry={geometry}>
      <meshBasicMaterial ref={materialRef} color={color} transparent opacity={0} depthWrite={false} />
    </mesh>
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
      <meshBasicMaterial color={color} transparent opacity={0.92} />
      <pointLight color={color} intensity={0.84} distance={0.82} />
    </mesh>
  );
}

function LightStreaks({ interaction }: { interaction: InteractionRef }) {
  const streaks = React.useMemo(() => {
    return Array.from({ length: 11 }).map((_, index) => {
      const y = -1.22 + index * 0.23;
      const z = -0.48 + (index % 5) * 0.16;
      return {
        start: new THREE.Vector3(-0.82, y, z),
        end: new THREE.Vector3(2.45, y + Math.sin(index) * 0.12, z + 0.08),
        color: index % 3 === 0 ? "#ffd166" : "#73e7ff",
      };
    });
  }, []);

  return (
    <group>
      {streaks.map((streak, index) => (
        <CurveLine
          key={index}
          points={[streak.start, streak.end]}
          color={streak.color}
          interaction={interaction}
          baseOpacity={0.065}
          boostOpacity={0.085}
        />
      ))}
    </group>
  );
}

function ReactorShell({ interaction }: { interaction: InteractionRef }) {
  const shellRef = React.useRef<THREE.Mesh>(null);
  const shellTwoRef = React.useRef<THREE.Mesh>(null);
  const shellMaterialRef = React.useRef<THREE.MeshBasicMaterial>(null);
  const shellTwoMaterialRef = React.useRef<THREE.MeshBasicMaterial>(null);
  const shellSpeedRef = React.useRef(0.12);
  const shellTwoSpeedRef = React.useRef(0.08);

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime;
    const strength = interaction.current;
    shellSpeedRef.current = THREE.MathUtils.damp(shellSpeedRef.current, 0.12 + strength * 0.12, 5, delta);
    shellTwoSpeedRef.current = THREE.MathUtils.damp(shellTwoSpeedRef.current, 0.08 + strength * 0.1, 5, delta);
    if (shellRef.current) {
      shellRef.current.rotation.y += shellSpeedRef.current * delta;
      shellRef.current.rotation.z = -t * 0.045;
      shellRef.current.scale.set(
        1.18 + strength * 0.035,
        0.82 + strength * 0.025,
        1.18 + strength * 0.035
      );
    }
    if (shellTwoRef.current) {
      shellTwoRef.current.rotation.x = 0.35 + t * 0.055;
      shellTwoRef.current.rotation.y -= shellTwoSpeedRef.current * delta;
    }
    if (shellMaterialRef.current) {
      shellMaterialRef.current.opacity = THREE.MathUtils.damp(shellMaterialRef.current.opacity, 0.06 + strength * 0.045, 6, delta);
    }
    if (shellTwoMaterialRef.current) {
      shellTwoMaterialRef.current.opacity = THREE.MathUtils.damp(shellTwoMaterialRef.current.opacity, 0.034 + strength * 0.035, 6, delta);
    }
  });

  return (
    <group>
      <mesh ref={shellRef} scale={[1.18, 0.82, 1.18]}>
        <sphereGeometry args={[1, 32, 16]} />
        <meshBasicMaterial ref={shellMaterialRef} color="#73e7ff" transparent opacity={0.06} wireframe />
      </mesh>
      <mesh ref={shellTwoRef} scale={[0.86, 1.08, 0.86]}>
        <sphereGeometry args={[1, 24, 12]} />
        <meshBasicMaterial ref={shellTwoMaterialRef} color="#9effc9" transparent opacity={0.034} wireframe />
      </mesh>
    </group>
  );
}

function OrbitalRings({ interaction }: { interaction: InteractionRef }) {
  const ringRef = React.useRef<THREE.Group>(null);
  const ringSpeedRef = React.useRef(0.11);

  useFrame(({ clock }, delta) => {
    if (!ringRef.current) return;
    const t = clock.elapsedTime;
    ringSpeedRef.current = THREE.MathUtils.damp(ringSpeedRef.current, 0.11 + interaction.current * 0.15, 4.6, delta);
    ringRef.current.rotation.y += ringSpeedRef.current * delta;
    ringRef.current.rotation.x = -0.25 + Math.sin(t * 0.4) * 0.035;
    ringRef.current.scale.setScalar(THREE.MathUtils.damp(ringRef.current.scale.x, 1 + interaction.current * 0.018, 5, delta));
  });

  return (
    <group ref={ringRef}>
      {[
        { radius: 1.05, tube: 0.006, color: "#73e7ff", opacity: 0.36, rotation: [1.1, 0.14, -0.44] },
        { radius: 1.38, tube: 0.004, color: "#9effc9", opacity: 0.22, rotation: [1.52, -0.28, 0.18] },
        { radius: 1.72, tube: 0.003, color: "#ffd166", opacity: 0.16, rotation: [1.22, 0.38, 0.7] },
      ].map((ring) => (
        <mesh key={`${ring.radius}-${ring.color}`} rotation={ring.rotation as [number, number, number]}>
          <torusGeometry args={[ring.radius, ring.tube, 8, 128]} />
          <meshBasicMaterial color={ring.color} transparent opacity={ring.opacity} />
        </mesh>
      ))}
    </group>
  );
}

function AutonomousCore({ interaction }: { interaction: InteractionRef }) {
  const groupRef = React.useRef<THREE.Group>(null);
  const coreRef = React.useRef<THREE.Mesh>(null);
  const innerRef = React.useRef<THREE.Mesh>(null);
  const coreMaterialRef = React.useRef<THREE.MeshStandardMaterial>(null);
  const innerMaterialRef = React.useRef<THREE.MeshStandardMaterial>(null);
  const warmGlowRef = React.useRef<THREE.MeshBasicMaterial>(null);
  const cyanGlowRef = React.useRef<THREE.MeshBasicMaterial>(null);

  useFrame(({ clock, pointer }, delta) => {
    const t = clock.elapsedTime;
    const strength = interaction.current;
    if (groupRef.current) {
      groupRef.current.rotation.x = THREE.MathUtils.damp(groupRef.current.rotation.x, pointer.y * (0.14 + strength * 0.05), 4.2, delta);
      groupRef.current.rotation.y = THREE.MathUtils.damp(groupRef.current.rotation.y, pointer.x * (0.18 + strength * 0.07), 4.2, delta);
    }
    if (coreRef.current) {
      coreRef.current.rotation.x += (0.28 + strength * 0.14) * delta;
      coreRef.current.rotation.y += (0.48 + strength * 0.24) * delta;
      const targetScale = 1 + Math.sin(t * 2.3) * (0.032 + strength * 0.026) + strength * 0.025;
      coreRef.current.scale.setScalar(THREE.MathUtils.damp(coreRef.current.scale.x, targetScale, 7, delta));
    }
    if (innerRef.current) {
      innerRef.current.rotation.y = -t * 0.68;
      innerRef.current.rotation.z = t * 0.18;
    }
    if (coreMaterialRef.current) {
      coreMaterialRef.current.emissiveIntensity = THREE.MathUtils.damp(
        coreMaterialRef.current.emissiveIntensity,
        1.92 + strength * 1.28,
        7,
        delta
      );
    }
    if (innerMaterialRef.current) {
      innerMaterialRef.current.emissiveIntensity = THREE.MathUtils.damp(
        innerMaterialRef.current.emissiveIntensity,
        0.9 + strength * 0.95,
        7,
        delta
      );
    }
    if (warmGlowRef.current) {
      warmGlowRef.current.opacity = THREE.MathUtils.damp(warmGlowRef.current.opacity, 0.13 + strength * 0.08, 6, delta);
    }
    if (cyanGlowRef.current) {
      cyanGlowRef.current.opacity = THREE.MathUtils.damp(cyanGlowRef.current.opacity, 0.07 + strength * 0.065, 6, delta);
    }
  });

  return (
    <group ref={groupRef}>
      <mesh scale={1.95}>
        <sphereGeometry args={[0.52, 24, 12]} />
        <meshBasicMaterial
          ref={warmGlowRef}
          color="#ffd166"
          transparent
          opacity={0.13}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh scale={[2.55, 2.1, 2.55]}>
        <sphereGeometry args={[0.52, 24, 12]} />
        <meshBasicMaterial
          ref={cyanGlowRef}
          color="#73e7ff"
          transparent
          opacity={0.07}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh ref={innerRef} scale={0.74}>
        <dodecahedronGeometry args={[0.55, 1]} />
        <meshStandardMaterial
          ref={innerMaterialRef}
          color="#9effc9"
          emissive="#73e7ff"
          emissiveIntensity={0.9}
          metalness={0.46}
          roughness={0.2}
          transparent
          opacity={0.38}
        />
      </mesh>
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[0.48, 2]} />
        <meshStandardMaterial
          ref={coreMaterialRef}
          color="#ffd166"
          emissive="#ff7a59"
          emissiveIntensity={1.92}
          metalness={0.56}
          roughness={0.13}
        />
      </mesh>
      <mesh scale={1.18}>
        <icosahedronGeometry args={[0.5, 1]} />
        <meshBasicMaterial color="#73e7ff" transparent opacity={0.095} wireframe />
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
  const bodyMaterialRef = React.useRef<THREE.MeshStandardMaterial>(null);
  const railMaterialRef = React.useRef<THREE.MeshBasicMaterial>(null);
  const lensMaterialRef = React.useRef<THREE.MeshBasicMaterial>(null);
  const auraMaterialRef = React.useRef<THREE.MeshBasicMaterial>(null);

  useFrame(({ clock }, delta) => {
    if (!groupRef.current) return;
    const t = clock.elapsedTime;
    groupRef.current.position.y = project.position.y + Math.sin(t * 1.4 + project.position.x) * 0.035;
    groupRef.current.scale.setScalar(THREE.MathUtils.damp(groupRef.current.scale.x, active ? 1.14 : 1, 8, delta));

    if (bodyMaterialRef.current) {
      bodyMaterialRef.current.opacity = THREE.MathUtils.damp(bodyMaterialRef.current.opacity, dimmed ? 0.34 : 0.92, 7, delta);
      bodyMaterialRef.current.emissiveIntensity = THREE.MathUtils.damp(
        bodyMaterialRef.current.emissiveIntensity,
        active ? 1.55 : 0.28,
        8,
        delta
      );
    }
    if (railMaterialRef.current) {
      railMaterialRef.current.opacity = THREE.MathUtils.damp(railMaterialRef.current.opacity, active ? 0.88 : 0.36, 8, delta);
    }
    if (lensMaterialRef.current) {
      lensMaterialRef.current.opacity = THREE.MathUtils.damp(lensMaterialRef.current.opacity, active ? 1 : 0.58, 8, delta);
    }
    if (auraMaterialRef.current) {
      auraMaterialRef.current.opacity = THREE.MathUtils.damp(auraMaterialRef.current.opacity, active ? 0.18 : 0.04, 8, delta);
    }
  });

  return (
    <group ref={groupRef} position={project.position} rotation={project.rotation}>
      <mesh
        onPointerOver={(event) => {
          event.stopPropagation();
          document.body.style.cursor = "pointer";
          onHover(project);
        }}
        onPointerMove={(event) => {
          event.stopPropagation();
        }}
        onPointerOut={(event) => {
          event.stopPropagation();
          document.body.style.cursor = "";
          onLeave();
        }}
        onClick={(event) => {
          event.stopPropagation();
          onLock(project);
        }}
      >
        <boxGeometry args={[1.48, 1.04, 0.82]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.001} depthWrite={false} />
      </mesh>
      <mesh>
        <boxGeometry args={[0.44, 0.18, 0.16]} />
        <meshStandardMaterial
          ref={bodyMaterialRef}
          color="#09120f"
          emissive={project.color}
          emissiveIntensity={0.28}
          metalness={0.48}
          roughness={0.28}
          transparent
          opacity={dimmed ? 0.34 : 0.92}
        />
      </mesh>
      <mesh position={[0, 0.102, 0.006]}>
        <boxGeometry args={[0.34, 0.012, 0.17]} />
        <meshBasicMaterial ref={railMaterialRef} color={project.color} transparent opacity={0.36} />
      </mesh>
      <mesh position={[-0.16, 0, 0.095]}>
        <boxGeometry args={[0.075, 0.22, 0.018]} />
        <meshBasicMaterial color={project.color} transparent opacity={active ? 0.9 : 0.46} />
      </mesh>
      <mesh position={[0.18, -0.002, 0.097]}>
        <circleGeometry args={[0.032, 18]} />
        <meshBasicMaterial ref={lensMaterialRef} color={project.color} transparent opacity={0.58} />
      </mesh>
      <mesh scale={[1.18, 1.42, 1]} position={[0, 0, -0.004]}>
        <boxGeometry args={[0.44, 0.18, 0.01]} />
        <meshBasicMaterial
          ref={auraMaterialRef}
          color={project.color}
          transparent
          opacity={0.04}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      {locked ? (
        <group position={[0, -0.16, 0.104]}>
          <mesh>
            <boxGeometry args={[0.26, 0.018, 0.024]} />
            <meshBasicMaterial color={project.color} transparent opacity={0.88} />
          </mesh>
          <mesh position={[0, -0.032, 0]}>
            <boxGeometry args={[0.13, 0.036, 0.018]} />
            <meshBasicMaterial color="#f8fff9" transparent opacity={0.74} />
          </mesh>
        </group>
      ) : null}
    </group>
  );
}

function HeroParticles({ interaction }: { interaction: InteractionRef }) {
  const farRef = React.useRef<THREE.Points>(null);
  const nearRef = React.useRef<THREE.Points>(null);
  const farPositions = React.useMemo(() => {
    let seed = 11;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    const values = new Float32Array(132 * 3);
    for (let index = 0; index < 132; index += 1) {
      values[index * 3] = (random() - 0.5) * 5.2;
      values[index * 3 + 1] = (random() - 0.5) * 3.4;
      values[index * 3 + 2] = (random() - 0.5) * 3.8;
    }
    return values;
  }, []);
  const nearPositions = React.useMemo(() => {
    let seed = 31;
    const random = () => {
      seed = (seed * 48271) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    const values = new Float32Array(26 * 3);
    for (let index = 0; index < 26; index += 1) {
      values[index * 3] = (random() - 0.5) * 1.4 + 0.25;
      values[index * 3 + 1] = (random() - 0.5) * 1.1;
      values[index * 3 + 2] = (random() - 0.5) * 1.2;
    }
    return values;
  }, []);

  useFrame(({ clock }) => {
    const strength = interaction.current;
    if (farRef.current) {
      farRef.current.rotation.y = clock.elapsedTime * (0.016 + strength * 0.018);
      farRef.current.rotation.x = Math.sin(clock.elapsedTime * 0.18) * 0.02;
    }
    if (nearRef.current) {
      nearRef.current.rotation.z = -clock.elapsedTime * 0.06;
      nearRef.current.rotation.y = clock.elapsedTime * 0.04;
    }
  });

  return (
    <group>
      <points ref={farRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[farPositions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          color="#9fefff"
          size={0.016}
          transparent
          opacity={0.42}
          sizeAttenuation
          depthWrite={false}
        />
      </points>
      <points ref={nearRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[nearPositions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          color="#ffd166"
          size={0.022}
          transparent
          opacity={0.32}
          sizeAttenuation
          depthWrite={false}
        />
      </points>
    </group>
  );
}

function HoverTooltip({
  activeProject,
  locked,
}: {
  activeProject: ReactorProject | null;
  locked: boolean;
}) {
  return (
    <div
      className={`pointer-events-none absolute right-[7%] top-[21%] z-20 hidden max-w-64 rounded-[8px] border border-white/14 bg-[#07100d]/78 px-4 py-3 shadow-[0_24px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl transition duration-200 lg:block ${
        activeProject ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0"
      }`}
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.24em]" style={{ color: activeProject?.color ?? "#73e7ff" }}>
        {locked ? "pinned satellite" : "active satellite"}
      </p>
      <p className="mt-2 text-sm font-medium text-[color:var(--ink)]">{activeProject?.title ?? "Project"}</p>
      <p className="mt-1 text-xs leading-5 text-[color:var(--muted-ink)]">{activeProject?.focus ?? "Hover a satellite"}</p>
    </div>
  );
}

function ReactorScene({
  activeSlug,
  setActiveSlug,
  lockedSlug,
  setLockedSlug,
  isInteracting,
  setInteracting,
  sceneActive,
}: {
  activeSlug: string | null;
  setActiveSlug: (slug: string | null) => void;
  lockedSlug: string | null;
  setLockedSlug: (slug: string | null) => void;
  isInteracting: boolean;
  setInteracting: (active: boolean) => void;
  sceneActive: boolean;
}) {
  const groupRef = React.useRef<THREE.Group>(null);
  const interactionRef = React.useRef(0);
  const hoverLeaveTimerRef = React.useRef<number | null>(null);
  const projectsForHero = useHeroProjects();
  const activeProject = projectsForHero.find((project) => project.slug === activeSlug) ?? null;
  const activeSignal = Boolean(activeProject || isInteracting);

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
      if (!lockedSlug) setActiveSlug(null);
    }, 150);
  }, [cancelHoverLeave, lockedSlug, setActiveSlug, setInteracting]);

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
        <group>
          <ReactorShell interaction={interactionRef} />
          <OrbitalRings interaction={interactionRef} />
          <AutonomousCore interaction={interactionRef} />
          <LightStreaks interaction={interactionRef} />
          {projectsForHero.map((project) => {
            const active = project.slug === activeSlug;
            const dimmed = Boolean(activeSlug && !active);
            const locked = project.slug === lockedSlug;
            return (
              <React.Fragment key={project.slug}>
                <DataRibbon
                  from={CORE_ORIGIN}
                  to={project.position}
                  color={project.color}
                  active={active}
                />
                <ActiveDataTube
                  from={CORE_ORIGIN}
                  to={project.position}
                  color={project.color}
                  active={active}
                />
                <EnergyPacket
                  from={project.position}
                  to={CORE_ORIGIN}
                  color={project.color}
                  active={active}
                />
                <ProjectModule
                  project={project}
                  active={active}
                  dimmed={dimmed}
                  locked={locked}
                  onHover={(nextProject) => {
                    cancelHoverLeave();
                    setInteracting(true);
                    if (!lockedSlug) setActiveSlug(nextProject.slug);
                  }}
                  onLeave={() => {
                    clearHoverWithGrace();
                  }}
                  onLock={(nextProject) => {
                    setLockedSlug(lockedSlug === nextProject.slug ? null : nextProject.slug);
                    setActiveSlug(nextProject.slug);
                  }}
                />
              </React.Fragment>
            );
          })}
        </group>
      </group>
      <HeroParticles interaction={interactionRef} />
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
  const [hoverSlug, setHoverSlug] = React.useState<string | null>(null);
  const [lockedSlug, setLockedSlug] = React.useState<string | null>(null);
  const [isInteracting, setInteracting] = React.useState(false);
  const activeSlug = lockedSlug ?? hoverSlug;
  const projectsForHero = useHeroProjects();
  const activeProject = projectsForHero.find((project) => project.slug === activeSlug) ?? null;

  React.useEffect(() => {
    const frame = window.requestAnimationFrame(() => onReady?.());
    return () => window.cancelAnimationFrame(frame);
  }, [onReady]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_66%_42%,rgba(115,231,255,0.3),transparent_29%),radial-gradient(circle_at_76%_54%,rgba(255,209,102,0.12),transparent_22%),radial-gradient(circle_at_84%_58%,rgba(158,255,201,0.12),transparent_26%),radial-gradient(circle_at_19%_24%,rgba(255,122,89,0.07),transparent_24%)]" />
      <div className="absolute inset-0 opacity-55 [background:radial-gradient(circle,rgba(159,239,255,0.52)_1px,transparent_1.7px),radial-gradient(circle,rgba(255,209,102,0.32)_1px,transparent_1.7px)] [background-position:18px_42px,90px_24px] [background-size:170px_150px,260px_220px]" />
      <div className="absolute inset-0 opacity-32 [background:linear-gradient(90deg,rgba(115,231,255,0.03)_1px,transparent_1px),linear-gradient(rgba(158,255,201,0.02)_1px,transparent_1px)] [background-size:128px_128px]" />
      <div className="absolute right-[7%] top-[19%] hidden h-[58%] w-[46%] rounded-full border border-[color:var(--signal-cyan)]/10 lg:block" />
      <Canvas
        className="pointer-events-auto absolute inset-0 h-full w-full"
        camera={{ position: [0, 0.14, 4.65], fov: 38 }}
        dpr={[1, 1.35]}
        frameloop={active ? "always" : "demand"}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        onPointerMissed={() => setLockedSlug(null)}
      >
        <ReactorScene
          activeSlug={activeSlug}
          setActiveSlug={setHoverSlug}
          lockedSlug={lockedSlug}
          setLockedSlug={setLockedSlug}
          isInteracting={isInteracting}
          setInteracting={setInteracting}
          sceneActive={active}
        />
      </Canvas>
      <HoverTooltip activeProject={activeProject} locked={Boolean(lockedSlug)} />
      <div className="absolute inset-y-0 left-0 w-[68%] bg-gradient-to-r from-[color:var(--void)] via-[color:var(--void)]/96 to-transparent max-md:w-full max-md:from-[color:var(--void)]/98 max-md:via-[color:var(--void)]/94 max-md:to-[color:var(--void)]/74" />
      <div className="absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-[color:var(--void)] via-[color:var(--void)]/76 to-transparent" />
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[color:var(--void)]/84 to-transparent" />
    </div>
  );
}
