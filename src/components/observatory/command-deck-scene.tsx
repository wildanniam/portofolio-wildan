"use client";

import * as React from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Line, Sparkles } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import * as THREE from "three";
import { projects, type Project } from "@/data/portfolio";

const HERO_PROJECTS = ["fradium", "agentpay", "nova-ai-wallet", "specheal", "paygate-stellar"];

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

function useReducedMotionPreference() {
  const [reduced, setReduced] = React.useState(false);

  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return reduced;
}

function useCoarsePointer() {
  const [coarsePointer, setCoarsePointer] = React.useState(false);

  React.useEffect(() => {
    const query = window.matchMedia("(hover: none), (pointer: coarse)");
    const update = () => setCoarsePointer(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return coarsePointer;
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

function LightStreaks({ active }: { active: boolean }) {
  const streaks = React.useMemo(() => {
    return Array.from({ length: 16 }).map((_, index) => {
      const y = -1.35 + index * 0.18;
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
        <Line
          key={index}
          points={[streak.start, streak.end]}
          color={streak.color}
          transparent
          opacity={active ? 0.12 : 0.055}
          lineWidth={index % 4 === 0 ? 1.5 : 0.7}
        />
      ))}
    </group>
  );
}

function ReactorShell({ active }: { active: boolean }) {
  const shellRef = React.useRef<THREE.Mesh>(null);
  const shellTwoRef = React.useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (shellRef.current) {
      shellRef.current.rotation.y = t * (active ? 0.22 : 0.12);
      shellRef.current.rotation.z = -t * 0.045;
    }
    if (shellTwoRef.current) {
      shellTwoRef.current.rotation.x = 0.35 + t * 0.055;
      shellTwoRef.current.rotation.y = -t * (active ? 0.18 : 0.08);
    }
  });

  return (
    <group>
      <mesh ref={shellRef} scale={[1.18, 0.82, 1.18]}>
        <sphereGeometry args={[1, 48, 24]} />
        <meshBasicMaterial color="#73e7ff" transparent opacity={active ? 0.09 : 0.062} wireframe />
      </mesh>
      <mesh ref={shellTwoRef} scale={[0.86, 1.08, 0.86]}>
        <sphereGeometry args={[1, 32, 18]} />
        <meshBasicMaterial color="#9effc9" transparent opacity={active ? 0.055 : 0.034} wireframe />
      </mesh>
    </group>
  );
}

function OrbitalRings({ active }: { active: boolean }) {
  const ringRef = React.useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!ringRef.current) return;
    const t = clock.elapsedTime;
    ringRef.current.rotation.y = t * (active ? 0.24 : 0.12);
    ringRef.current.rotation.x = -0.25 + Math.sin(t * 0.4) * 0.035;
  });

  return (
    <group ref={ringRef}>
      {[
        { radius: 1.05, tube: 0.006, color: "#73e7ff", opacity: 0.36, rotation: [1.1, 0.14, -0.44] },
        { radius: 1.38, tube: 0.004, color: "#9effc9", opacity: 0.22, rotation: [1.52, -0.28, 0.18] },
        { radius: 1.72, tube: 0.003, color: "#ffd166", opacity: 0.16, rotation: [1.22, 0.38, 0.7] },
      ].map((ring) => (
        <mesh key={`${ring.radius}-${ring.color}`} rotation={ring.rotation as [number, number, number]}>
          <torusGeometry args={[ring.radius, ring.tube, 12, 220]} />
          <meshBasicMaterial color={ring.color} transparent opacity={active ? ring.opacity + 0.08 : ring.opacity} />
        </mesh>
      ))}
    </group>
  );
}

function AutonomousCore({ active }: { active: boolean }) {
  const groupRef = React.useRef<THREE.Group>(null);
  const coreRef = React.useRef<THREE.Mesh>(null);
  const innerRef = React.useRef<THREE.Mesh>(null);

  useFrame(({ clock, pointer }) => {
    const t = clock.elapsedTime;
    if (groupRef.current) {
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, pointer.y * 0.18, 0.055);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, pointer.x * 0.22, 0.055);
    }
    if (coreRef.current) {
      coreRef.current.rotation.x = t * (active ? 0.42 : 0.28);
      coreRef.current.rotation.y = t * (active ? 0.72 : 0.48);
      coreRef.current.scale.setScalar(1 + Math.sin(t * 2.3) * (active ? 0.055 : 0.032));
    }
    if (innerRef.current) {
      innerRef.current.rotation.y = -t * 0.68;
      innerRef.current.rotation.z = t * 0.18;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh ref={innerRef} scale={0.74}>
        <dodecahedronGeometry args={[0.55, 1]} />
        <meshStandardMaterial
          color="#9effc9"
          emissive="#73e7ff"
          emissiveIntensity={active ? 1.7 : 0.85}
          metalness={0.46}
          roughness={0.2}
          transparent
          opacity={0.38}
        />
      </mesh>
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[0.48, 2]} />
        <meshStandardMaterial
          color="#f6c29b"
          emissive="#ff7a59"
          emissiveIntensity={active ? 2.8 : 1.7}
          metalness={0.56}
          roughness={0.13}
        />
      </mesh>
      <mesh scale={1.18}>
        <icosahedronGeometry args={[0.5, 1]} />
        <meshBasicMaterial color="#73e7ff" transparent opacity={active ? 0.12 : 0.07} wireframe />
      </mesh>
    </group>
  );
}

function ProjectModule({
  project,
  active,
  dimmed,
  onHover,
  onLeave,
}: {
  project: ReactorProject;
  active: boolean;
  dimmed: boolean;
  onHover: (project: ReactorProject) => void;
  onLeave: () => void;
}) {
  const groupRef = React.useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.elapsedTime;
    groupRef.current.position.y = project.position.y + Math.sin(t * 1.4 + project.position.x) * 0.035;
    groupRef.current.scale.setScalar(active ? 1.12 : 1);
  });

  return (
    <group
      ref={groupRef}
      position={project.position}
      rotation={project.rotation}
      onPointerOver={(event) => {
        event.stopPropagation();
        onHover(project);
      }}
      onPointerOut={(event) => {
        event.stopPropagation();
        onLeave();
      }}
    >
      <mesh>
        <boxGeometry args={[0.44, 0.18, 0.16]} />
        <meshStandardMaterial
          color="#09120f"
          emissive={project.color}
          emissiveIntensity={active ? 1.25 : 0.22}
          metalness={0.48}
          roughness={0.28}
          transparent
          opacity={dimmed ? 0.38 : 0.9}
        />
      </mesh>
      <mesh position={[0, 0.102, 0.006]}>
        <boxGeometry args={[0.34, 0.012, 0.17]} />
        <meshBasicMaterial color={project.color} transparent opacity={active ? 0.82 : 0.34} />
      </mesh>
      <mesh position={[-0.16, 0, 0.095]}>
        <boxGeometry args={[0.075, 0.22, 0.018]} />
        <meshBasicMaterial color={project.color} transparent opacity={active ? 0.9 : 0.46} />
      </mesh>
      <mesh position={[0.18, -0.002, 0.097]}>
        <circleGeometry args={[0.032, 18]} />
        <meshBasicMaterial color={project.color} transparent opacity={active ? 1 : 0.56} />
      </mesh>
      <mesh scale={[1.18, 1.42, 1]} position={[0, 0, -0.004]}>
        <boxGeometry args={[0.44, 0.18, 0.01]} />
        <meshBasicMaterial color={project.color} transparent opacity={active ? 0.12 : 0.035} />
      </mesh>
    </group>
  );
}

function HeroParticles({ active }: { active: boolean }) {
  return (
    <>
      <Sparkles
        count={active ? 130 : 92}
        scale={[4.8, 3.1, 3.6]}
        size={active ? 1.35 : 1.05}
        speed={active ? 0.44 : 0.22}
        color="#73e7ff"
        opacity={active ? 0.56 : 0.36}
      />
      <Sparkles count={28} scale={[2.6, 1.8, 2.4]} size={2.4} speed={0.16} color="#ffd166" opacity={0.18} />
    </>
  );
}

function HoverTooltip({ activeProject }: { activeProject: ReactorProject | null }) {
  if (!activeProject) return null;

  return (
    <div className="pointer-events-none absolute right-[7%] top-[21%] z-20 hidden max-w-64 rounded-[8px] border border-white/14 bg-[#07100d]/78 px-4 py-3 shadow-[0_24px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl lg:block">
      <p className="font-mono text-[10px] uppercase tracking-[0.24em]" style={{ color: activeProject.color }}>
        active satellite
      </p>
      <p className="mt-2 text-sm font-medium text-[color:var(--ink)]">{activeProject.title}</p>
      <p className="mt-1 text-xs leading-5 text-[color:var(--muted-ink)]">{activeProject.focus}</p>
    </div>
  );
}

function ReactorScene({
  activeSlug,
  setActiveSlug,
  isInteracting,
  setInteracting,
}: {
  activeSlug: string | null;
  setActiveSlug: (slug: string | null) => void;
  isInteracting: boolean;
  setInteracting: (active: boolean) => void;
}) {
  const groupRef = React.useRef<THREE.Group>(null);
  const projectsForHero = useHeroProjects();
  const reducedMotion = useReducedMotionPreference();
  const coarsePointer = useCoarsePointer();
  const activeProject = projectsForHero.find((project) => project.slug === activeSlug) ?? null;

  React.useEffect(() => {
    if (!coarsePointer || isInteracting || reducedMotion) return;
    let index = 0;
    const timer = window.setInterval(() => {
      index = (index + 1) % projectsForHero.length;
      setActiveSlug(projectsForHero[index].slug);
    }, 2600);
    return () => window.clearInterval(timer);
  }, [coarsePointer, isInteracting, projectsForHero, reducedMotion, setActiveSlug]);

  useFrame(({ clock, camera, pointer }) => {
    const t = clock.elapsedTime;
    if (groupRef.current) {
      groupRef.current.rotation.y = -0.32 + Math.sin(t * 0.18) * 0.06 + pointer.x * 0.1;
      groupRef.current.rotation.x = -0.04 + pointer.y * 0.08;
      groupRef.current.position.x = 2.85;
      groupRef.current.position.y = -0.02;
    }
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, pointer.x * 0.28, 0.04);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, 0.14 + pointer.y * 0.12, 0.04);
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
        onPointerEnter={() => setInteracting(true)}
        onPointerLeave={() => {
          setInteracting(false);
          setActiveSlug(null);
        }}
      >
        <Float speed={reducedMotion ? 0 : 1.4} rotationIntensity={reducedMotion ? 0 : 0.08} floatIntensity={reducedMotion ? 0 : 0.18}>
          <ReactorShell active={Boolean(activeProject || isInteracting)} />
          <OrbitalRings active={Boolean(activeProject || isInteracting)} />
          <AutonomousCore active={Boolean(activeProject || isInteracting)} />
          <LightStreaks active={Boolean(activeProject || isInteracting)} />
          {projectsForHero.map((project) => {
            const active = project.slug === activeSlug;
            const dimmed = Boolean(activeSlug && !active);
            return (
              <React.Fragment key={project.slug}>
                <DataRibbon
                  from={new THREE.Vector3(0, 0, 0)}
                  to={project.position}
                  color={project.color}
                  active={active}
                />
                <ProjectModule
                  project={project}
                  active={active}
                  dimmed={dimmed}
                  onHover={(nextProject) => {
                    setInteracting(true);
                    setActiveSlug(nextProject.slug);
                  }}
                  onLeave={() => {
                    setInteracting(false);
                    setActiveSlug(null);
                  }}
                />
              </React.Fragment>
            );
          })}
        </Float>
      </group>
      <HeroParticles active={Boolean(activeProject || isInteracting)} />
      <EffectComposer>
        <Bloom intensity={0.82} luminanceThreshold={0.12} luminanceSmoothing={0.72} mipmapBlur />
      </EffectComposer>
    </>
  );
}

export function CommandDeckScene() {
  const [activeSlug, setActiveSlug] = React.useState<string | null>(null);
  const [isInteracting, setInteracting] = React.useState(false);
  const activeProject = useHeroProjects().find((project) => project.slug === activeSlug) ?? null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_68%_44%,rgba(115,231,255,0.26),transparent_28%),radial-gradient(circle_at_82%_58%,rgba(158,255,201,0.12),transparent_25%),radial-gradient(circle_at_20%_24%,rgba(255,122,89,0.08),transparent_24%)]" />
      <div className="absolute inset-0 opacity-45 [background:linear-gradient(90deg,rgba(115,231,255,0.035)_1px,transparent_1px),linear-gradient(rgba(158,255,201,0.026)_1px,transparent_1px)] [background-size:128px_128px]" />
      <div className="absolute right-[7%] top-[19%] hidden h-[58%] w-[46%] rounded-full border border-[color:var(--signal-cyan)]/10 lg:block" />
      <Canvas
        className="pointer-events-auto absolute inset-0 h-full w-full"
        camera={{ position: [0, 0.14, 4.65], fov: 38 }}
        dpr={[1, 1.7]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <ReactorScene
          activeSlug={activeSlug}
          setActiveSlug={setActiveSlug}
          isInteracting={isInteracting}
          setInteracting={setInteracting}
        />
      </Canvas>
      <HoverTooltip activeProject={activeProject} />
      <div className="absolute inset-y-0 left-0 w-[68%] bg-gradient-to-r from-[color:var(--void)] via-[color:var(--void)]/96 to-transparent max-md:w-full max-md:from-[color:var(--void)]/98 max-md:via-[color:var(--void)]/94 max-md:to-[color:var(--void)]/74" />
      <div className="absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-[color:var(--void)] via-[color:var(--void)]/76 to-transparent" />
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[color:var(--void)]/84 to-transparent" />
    </div>
  );
}
