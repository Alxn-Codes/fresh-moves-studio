import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, ContactShadows } from "@react-three/drei";
import { useEffect, useMemo, useRef, Suspense } from "react";
import * as THREE from "three";
import type { Juice } from "@/data/juices";
import fruitSolstice from "@/assets/fruit-solstice.png";
import fruitVerdant from "@/assets/fruit-verdant.png";
import fruitEmber from "@/assets/fruit-ember.png";
import fruitDusk from "@/assets/fruit-dusk.png";
import fruitCoast from "@/assets/fruit-coast.png";

const FRUIT_IMAGES: Record<string, string> = {
  solstice: fruitSolstice,
  verdant: fruitVerdant,
  ember: fruitEmber,
  dusk: fruitDusk,
  coast: fruitCoast,
};

/**
 * Lathe profile matching a squat cold-press bottle:
 * straight cylindrical body, quick shoulder, short neck.
 */
function bottleProfile(scale = 1) {
  const pts: THREE.Vector2[] = [];
  const add = (x: number, y: number) => pts.push(new THREE.Vector2(x * scale, y * scale));
  add(0.001, -1.0);
  add(0.6, -1.0);
  add(0.64, -0.94);
  add(0.64, 0.42);
  add(0.63, 0.56);
  add(0.5, 0.78);
  add(0.34, 0.92);
  add(0.3, 1.0);
  add(0.3, 1.14);
  add(0.001, 1.14);
  return pts;
}

/** Paper label drawn to a canvas: fruit photo + product type + name. */
function useLabelTexture(juice: Juice) {
  const texture = useMemo(() => {
    if (typeof document === "undefined") return null;
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext("2d")!;
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    tex.wrapS = THREE.RepeatWrapping;
    tex.offset.x = 0.375; // centre a label panel on the front of the bottle

    const draw = (fruit?: HTMLImageElement) => {
      ctx.clearRect(0, 0, 1024, 512);
      ctx.fillStyle = "#faf5ea";
      ctx.fillRect(0, 0, 1024, 512);
      // two identical panels so both sides of the wrap read correctly
      for (const ox of [0, 512]) {
        ctx.save();
        ctx.translate(ox, 0);
        ctx.fillStyle = juice.liquid;
        ctx.fillRect(0, 0, 512, 14);
        ctx.fillRect(0, 498, 512, 14);
        if (fruit) {
          const w = 250;
          const h = (fruit.height / fruit.width) * w;
          ctx.drawImage(fruit, 256 - w / 2, 120, w, h);
        }
        ctx.fillStyle = "#2b1c10";
        ctx.textAlign = "center";
        ctx.font = "600 34px Georgia, serif";
        ctx.fillText("PULPA", 256, 76);
        ctx.font = "400 20px Helvetica, Arial, sans-serif";
        ctx.fillStyle = "#7a6a58";
        ctx.fillText("COLD PRESSED JUICE", 256, 404);
        ctx.fillStyle = juice.liquid;
        ctx.font = "600 46px Georgia, serif";
        ctx.fillText(juice.name, 256, 458);
        ctx.restore();
      }
      tex.needsUpdate = true;
    };

    draw();
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => draw(img);
    img.src = FRUIT_IMAGES[juice.id] ?? "";
    return tex;
  }, [juice]);

  useEffect(() => () => texture?.dispose(), [texture]);
  return texture;
}

const SPLASH_COUNT = 18;

function Splash({ color, trigger }: { color: string; trigger: number }) {
  const group = useRef<THREE.Group>(null);
  const start = useRef(-10);
  const seeds = useMemo(
    () =>
      Array.from({ length: SPLASH_COUNT }, (_, i) => {
        const a = (i / SPLASH_COUNT) * Math.PI * 2 + Math.random();
        const speed = 0.9 + Math.random() * 0.9;
        return {
          vx: Math.cos(a) * 0.5 * speed,
          vz: Math.sin(a) * 0.5 * speed,
          vy: 1.6 + Math.random() * 1.4,
          r: 0.045 + Math.random() * 0.05,
        };
      }),
    [],
  );

  useEffect(() => {
    start.current = -1; // armed; set on next frame using clock time
  }, [trigger]);

  useFrame((state) => {
    if (!group.current) return;
    if (start.current === -1) start.current = state.clock.elapsedTime;
    const t = state.clock.elapsedTime - start.current;
    const alive = t >= 0 && t < 1.5;
    group.current.visible = alive;
    if (!alive) return;
    group.current.children.forEach((child, i) => {
      const s = seeds[i]!;
      child.position.set(s.vx * t, 1.05 + s.vy * t - 4.2 * t * t, s.vz * t);
      const k = Math.max(0, 1 - t / 1.5);
      child.scale.setScalar(k);
    });
  });

  return (
    <group ref={group} visible={false}>
      {seeds.map((s, i) => (
        <mesh key={i}>
          <sphereGeometry args={[s.r, 12, 12]} />
          <meshPhysicalMaterial
            color={color}
            roughness={0.15}
            transmission={0.4}
            thickness={0.3}
            emissive={color}
            emissiveIntensity={0.25}
          />
        </mesh>
      ))}
    </group>
  );
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
  const capRef = useRef<THREE.Group>(null);
  const profile = useMemo(() => bottleProfile(), []);
  const liquidProfile = useMemo(() => bottleProfile(0.9), []);
  const label = useLabelTexture(juice);
  const targetPos = useMemo(() => new THREE.Vector3(), []);
  const targetScale = useMemo(() => new THREE.Vector3(), []);
  const openStart = useRef(-10);

  useEffect(() => {
    if (active) openStart.current = -1;
  }, [active]);

  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    if (!group.current) return;

    let offset = index - activeIndex;
    offset = ((offset + count / 2 + count) % count) - count / 2;
    targetPos.set(offset * 2.35, active ? 0 : -0.2, active ? 0 : -Math.abs(offset) * 1.5);
    const k = 1 - Math.exp(-6 * delta);
    group.current.position.lerp(targetPos, k);
    const s = active ? 1 : 0.74;
    targetScale.set(s, s, s);
    group.current.scale.lerp(targetScale, k);
    group.current.visible = Math.abs(offset) <= 2.2;

    const t = state.clock.elapsedTime;
    if (active) {
      // gentle sway so the label stays readable
      group.current.rotation.y +=
        (Math.sin(t * 0.6) * 0.32 - group.current.rotation.y) * (1 - Math.exp(-3 * delta));
      group.current.position.y += Math.sin(t * 1.1) * 0.004;
    } else {
      group.current.rotation.y += delta * 0.25;
    }

    // cap pop on becoming active
    if (capRef.current) {
      if (openStart.current === -1) openStart.current = t;
      const e = t - openStart.current;
      if (active && e >= 0 && e < 1.5) {
        const p = e / 1.5;
        const lift = Math.sin(Math.min(p, 1) * Math.PI) * 0.9;
        capRef.current.position.y = 1.2 + lift;
        capRef.current.rotation.z = lift * 1.6;
        capRef.current.rotation.x = lift * 0.8;
      } else {
        capRef.current.position.y +=
          (1.2 - capRef.current.position.y) * (1 - Math.exp(-8 * delta));
        capRef.current.rotation.z *= Math.exp(-8 * delta);
        capRef.current.rotation.x *= Math.exp(-8 * delta);
      }
    }
  });

  return (
    <group ref={group}>
      {/* juice inside */}
      <mesh scale={[1, 0.86, 1]} position={[0, -0.06, 0]}>
        <latheGeometry args={[liquidProfile, 64]} />
        <meshPhysicalMaterial
          color={juice.liquid}
          roughness={0.22}
          transmission={0.5}
          thickness={1.4}
          ior={1.35}
          emissive={juice.liquid}
          emissiveIntensity={0.16}
        />
      </mesh>

      {/* glass */}
      <mesh castShadow>
        <latheGeometry args={[profile, 64]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transmission={0.95}
          thickness={0.55}
          roughness={0.06}
          ior={1.46}
          transparent
          opacity={0.5}
          metalness={0}
          clearcoat={1}
        />
      </mesh>

      {/* printed label */}
      {label && (
        <mesh position={[0, -0.14, 0]}>
          <cylinderGeometry args={[0.652, 0.652, 1.32, 64, 1, true]} />
          <meshStandardMaterial map={label} roughness={0.8} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* cap */}
      <group ref={capRef} position={[0, 1.2, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.34, 0.34, 0.22, 48]} />
          <meshStandardMaterial color="#181410" metalness={0.5} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.12, 0]}>
          <cylinderGeometry args={[0.335, 0.335, 0.03, 48]} />
          <meshStandardMaterial color="#2a241d" metalness={0.6} roughness={0.3} />
        </mesh>
      </group>

      {active && <Splash color={juice.liquid} trigger={activeIndex} />}
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
      <ContactShadows position={[0, -1.08, 0]} opacity={0.35} scale={12} blur={2.6} far={4} />
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
      camera={{ position: [0, 0.3, 5.4], fov: 42 }}
      gl={{ antialias: true }}
    >
      <Suspense fallback={null}>
        <Rig juices={juices} activeIndex={activeIndex} />
      </Suspense>
    </Canvas>
  );
}
