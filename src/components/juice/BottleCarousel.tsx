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

const DROP_COUNT = 26;
const CYCLE = 4.2; // seconds per pour cycle
const POUR_START = 0.45;
const POUR_END = 2.6;

/** Smooth arcing liquid stream built from a tube along a falling parabola. */
function streamCurve(dir: number) {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= 24; i++) {
    const t = i / 24;
    const x = dir * (0.18 + t * 1.55);
    const y = 1.28 + t * 0.85 - 3.1 * t * t;
    const z = Math.sin(t * 3.1) * 0.12 * dir;
    pts.push(new THREE.Vector3(x, y, z));
  }
  return new THREE.CatmullRomCurve3(pts);
}

/**
 * Real-juice pour: a thick liquid ribbon arcs out of the neck, breaks into
 * droplets, and kicks up a crown of splash beads where it lands.
 */
function Splash({ color, trigger }: { color: string; trigger: number }) {
  const group = useRef<THREE.Group>(null);
  const streamRef = useRef<THREE.Mesh>(null);
  const dropsRef = useRef<THREE.Group>(null);
  const crownRef = useRef<THREE.Group>(null);
  const start = useRef(-1);

  const curve = useMemo(() => streamCurve(1), []);
  const geom = useMemo(() => new THREE.TubeGeometry(curve, 48, 0.085, 14, false), [curve]);
  useEffect(() => () => geom.dispose(), [geom]);

  const drops = useMemo(
    () =>
      Array.from({ length: DROP_COUNT }, (_, i) => {
        const a = Math.random() * Math.PI * 2;
        const speed = 0.6 + Math.random() * 1.1;
        return {
          delay: (i / DROP_COUNT) * 0.9 + Math.random() * 0.25,
          vx: Math.cos(a) * 0.55 * speed + 0.5,
          vz: Math.sin(a) * 0.45 * speed,
          vy: 0.9 + Math.random() * 1.5,
          r: 0.03 + Math.random() * 0.055,
        };
      }),
    [],
  );

  const crown = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => {
        const a = (i / 14) * Math.PI * 2;
        return {
          a,
          rad: 0.28 + Math.random() * 0.22,
          up: 0.35 + Math.random() * 0.5,
          r: 0.03 + Math.random() * 0.04,
          delay: Math.random() * 0.2,
        };
      }),
    [],
  );

  useEffect(() => {
    start.current = -1;
  }, [trigger]);

  useFrame((state) => {
    if (!group.current) return;
    if (start.current === -1) start.current = state.clock.elapsedTime;
    const t = (state.clock.elapsedTime - start.current) % CYCLE;

    // --- stream: grows out of the neck, then retracts ---
    if (streamRef.current) {
      const open = t > POUR_START && t < POUR_END;
      streamRef.current.visible = open;
      if (open) {
        const p = (t - POUR_START) / (POUR_END - POUR_START);
        const grow = Math.min(1, p / 0.28);
        const fade = Math.min(1, (1 - p) / 0.25);
        const g = streamRef.current.geometry as THREE.TubeGeometry;
        g.setDrawRange(0, Math.floor(g.index!.count * grow));
        const m = streamRef.current.material as THREE.MeshPhysicalMaterial;
        m.opacity = 0.9 * fade;
        streamRef.current.scale.x = 0.85 + Math.sin(t * 14) * 0.05;
      }
    }

    // --- droplets flung from the landing point ---
    if (dropsRef.current) {
      dropsRef.current.children.forEach((child, i) => {
        const d = drops[i]!;
        const lt = t - (POUR_START + 0.3 + d.delay);
        const alive = lt > 0 && lt < 1.3;
        child.visible = alive;
        if (!alive) return;
        child.position.set(
          0.55 + d.vx * lt,
          0.35 + d.vy * lt - 3.4 * lt * lt,
          d.vz * lt,
        );
        const k = Math.max(0, 1 - lt / 1.3);
        child.scale.setScalar(0.6 + k * 0.7);
      });
    }

    // --- crown ring where the stream hits ---
    if (crownRef.current) {
      crownRef.current.children.forEach((child, i) => {
        const c = crown[i]!;
        const lt = t - (POUR_START + 0.35 + c.delay);
        const alive = lt > 0 && lt < 0.9;
        child.visible = alive;
        if (!alive) return;
        const p = lt / 0.9;
        child.position.set(
          1.35 + Math.cos(c.a) * c.rad * (0.4 + p * 1.6),
          -0.95 + c.up * Math.sin(p * Math.PI) * 1.1,
          Math.sin(c.a) * c.rad * (0.4 + p * 1.6),
        );
        child.scale.setScalar(1 - p * 0.8);
      });
    }
  });

  const liquidMat = (extra?: Record<string, unknown>) => (
    <meshPhysicalMaterial
      color={color}
      roughness={0.08}
      transmission={0.55}
      thickness={0.9}
      ior={1.36}
      clearcoat={1}
      clearcoatRoughness={0.05}
      emissive={color}
      emissiveIntensity={0.2}
      transparent
      {...extra}
    />
  );

  return (
    <group ref={group}>
      <mesh ref={streamRef} geometry={geom} visible={false}>
        {liquidMat({ opacity: 0.9 })}
      </mesh>

      <group ref={dropsRef}>
        {drops.map((d, i) => (
          <mesh key={i} visible={false}>
            <sphereGeometry args={[d.r, 14, 14]} />
            {liquidMat({ opacity: 0.95 })}
          </mesh>
        ))}
      </group>

      <group ref={crownRef}>
        {crown.map((c, i) => (
          <mesh key={i} visible={false}>
            <sphereGeometry args={[c.r, 12, 12]} />
            {liquidMat({ opacity: 0.95 })}
          </mesh>
        ))}
      </group>

      {/* pooled juice under the pour */}
      <mesh position={[1.35, -1.05, 0]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[0.42, 40]} />
        <meshPhysicalMaterial
          color={color}
          roughness={0.05}
          clearcoat={1}
          transparent
          opacity={0.5}
        />
      </mesh>
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
