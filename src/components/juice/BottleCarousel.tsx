import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, Float, ContactShadows } from "@react-three/drei";
import { useMemo, useRef, Suspense } from "react";
import * as THREE from "three";
import type { Juice } from "@/data/juices";

/** Lathe profile of a tall cold-press bottle (x = radius, y = height). */
function bottleProfile(scale = 1) {
  const pts: THREE.Vector2[] = [];
  const add = (x: number, y: number) => pts.push(new THREE.Vector2(x * scale, y * scale));
  add(0.001, -1.05);
  add(0.5, -1.05);
  add(0.56, -0.98);
  add(0.56, 0.35);
  add(0.54, 0.6);
  add(0.4, 0.82);
  add(0.24, 0.95);
  add(0.22, 1.18);
  add(0.26, 1.24);
  add(0.26, 1.32);
  add(0.001, 1.32);
  return pts;
}

function Bottle({
  juice,
  active,
  index,
  activeIndex,
  count,
}: {
  juice: Juice;
  active: boolean;
  index: number;
  activeIndex: number;
  count: number;
}) {
  const group = useRef<THREE.Group>(null);
  const profile = useMemo(() => bottleProfile(), []);
  const liquidProfile = useMemo(() => bottleProfile(0.92), []);

  // circular slot position
  const targetPos = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    if (!group.current) return;
    let offset = index - activeIndex;
    offset = ((offset + count / 2 + count) % count) - count / 2;
    targetPos.set(offset * 2.15, active ? 0 : -0.18, active ? 0 : -Math.abs(offset) * 1.4);
    const k = 1 - Math.exp(-6 * delta);
    group.current.position.lerp(targetPos, k);
    const s = active ? 1 : 0.78;
    group.current.scale.lerp(new THREE.Vector3(s, s, s), k);
    group.current.rotation.y += delta * (active ? 0.55 : 0.2);
    const opacityTarget = Math.abs(offset) > 2.2 ? 0 : 1;
    group.current.visible = opacityTarget > 0;
    group.current.position.y +=
      Math.sin(state.clock.elapsedTime * 1.2 + index) * 0.0015 * (active ? 3 : 1);
  });

  return (
    <group ref={group}>
      <Float speed={1.4} rotationIntensity={0.15} floatIntensity={0.35}>
        {/* juice inside */}
        <mesh position={[0, 0, 0]} scale={[1, 0.82, 1]}>
          <latheGeometry args={[liquidProfile, 64]} />
          <meshPhysicalMaterial
            color={juice.liquid}
            roughness={0.25}
            transmission={0.55}
            thickness={1.2}
            ior={1.35}
            emissive={juice.liquid}
            emissiveIntensity={0.18}
          />
        </mesh>
        {/* glass */}
        <mesh castShadow>
          <latheGeometry args={[profile, 64]} />
          <meshPhysicalMaterial
            color="#ffffff"
            transmission={0.95}
            thickness={0.6}
            roughness={0.08}
            ior={1.46}
            transparent
            opacity={0.55}
            metalness={0}
            clearcoat={1}
          />
        </mesh>
        {/* label band */}
        <mesh position={[0, -0.2, 0]}>
          <cylinderGeometry args={[0.575, 0.575, 0.85, 48, 1, true]} />
          <meshStandardMaterial
            color="#f7f1e3"
            roughness={0.85}
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh position={[0, 0.12, 0]}>
          <cylinderGeometry args={[0.578, 0.578, 0.06, 48, 1, true]} />
          <meshStandardMaterial color={juice.liquid} roughness={0.6} side={THREE.DoubleSide} />
        </mesh>
        {/* cap */}
        <mesh position={[0, 1.36, 0]} castShadow>
          <cylinderGeometry args={[0.28, 0.28, 0.2, 32]} />
          <meshStandardMaterial color={juice.glow} metalness={0.55} roughness={0.3} />
        </mesh>
      </Float>
    </group>
  );
}

function Rig({ juices, activeIndex }: { juices: Juice[]; activeIndex: number }) {
  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 8, 6]} intensity={2.2} castShadow />
      <directionalLight position={[-6, 3, -4]} intensity={0.8} color="#ffd8a8" />
      <Environment>
        <Lightformer intensity={2.5} position={[0, 5, 2]} scale={[10, 10, 1]} />
        <Lightformer
          intensity={1.2}
          color="#ffb27a"
          position={[-6, 1, -2]}
          rotation-y={Math.PI / 2}
          scale={[20, 2, 1]}
        />
        <Lightformer
          intensity={1}
          color="#bfe6ff"
          position={[6, 1, 2]}
          rotation-y={-Math.PI / 2}
          scale={[20, 2, 1]}
        />
      </Environment>
      {juices.map((j, i) => (
        <Bottle
          key={j.id}
          juice={j}
          index={i}
          activeIndex={activeIndex}
          active={i === activeIndex}
          count={juices.length}
        />
      ))}
      <ContactShadows position={[0, -1.15, 0]} opacity={0.35} scale={12} blur={2.6} far={4} />
    </>
  );
}

export default function BottleCarousel({
  juices,
  activeIndex,
}: {
  juices: Juice[];
  activeIndex: number;
}) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 0.35, 5.2], fov: 42 }}
      gl={{ antialias: true }}
    >
      <Suspense fallback={null}>
        <Rig juices={juices} activeIndex={activeIndex} />
      </Suspense>
    </Canvas>
  );
}
