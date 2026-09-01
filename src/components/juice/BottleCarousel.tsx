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
import fruitBloom from "@/assets/fruit-bloom.png";
import fruitMango from "@/assets/fruit-mango.png";
import fruitIndigo from "@/assets/fruit-indigo.png";
import fruitGrove from "@/assets/fruit-grove.png";

const FRUIT_IMAGES: Record<string, string> = {
  solstice: fruitSolstice,
  verdant: fruitVerdant,
  ember: fruitEmber,
  dusk: fruitDusk,
  coast: fruitCoast,
  bloom: fruitBloom,
  mango: fruitMango,
  indigo: fruitIndigo,
  grove: fruitGrove,
};

/**
 * Rounded soft-shouldered bottle profile matching the reference shot:
 * full belly, generous shoulder curve, short neck, broad cap seat.
 */
function bottleProfile(scale = 1) {
  const pts: THREE.Vector2[] = [];
  const add = (x: number, y: number) => pts.push(new THREE.Vector2(x * scale, y * scale));
  add(0.001, -1.0);
  add(0.42, -1.0);
  add(0.56, -0.95);
  add(0.62, -0.84);
  add(0.635, -0.4);
  add(0.635, 0.34);
  add(0.61, 0.58);
  add(0.52, 0.78);
  add(0.4, 0.92);
  add(0.31, 1.0);
  add(0.29, 1.1);
  add(0.001, 1.1);
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

/** Cut-out fruit sprite texture used for the floating fruit in the splash. */
function useFruitTexture(juice: Juice) {
  const tex = useMemo(() => {
    if (typeof document === "undefined") return null;
    const loader = new THREE.TextureLoader();
    const t = loader.load(FRUIT_IMAGES[juice.id] ?? "");
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, [juice]);
  useEffect(() => () => tex?.dispose(), [tex]);
  return tex;
}

const RIBBONS = 5;
const DROPS = 34;
const FRUITS = 6;

/** One rising, twisting liquid ribbon that wraps around the bottle. */
function ribbonCurve(seed: number) {
  const pts: THREE.Vector3[] = [];
  const base = seed * ((Math.PI * 2) / RIBBONS);
  const dir = seed % 2 === 0 ? 1 : -1;
  for (let i = 0; i <= 26; i++) {
    const t = i / 26;
    const a = base + dir * t * 2.4;
    const rad = 0.95 + Math.sin(t * Math.PI) * 0.75;
    pts.push(
      new THREE.Vector3(
        Math.cos(a) * rad,
        -1.05 + t * 2.5 + Math.sin(t * Math.PI) * 0.35,
        Math.sin(a) * rad * 0.75,
      ),
    );
  }
  return new THREE.CatmullRomCurve3(pts);
}

/**
 * Full hero splash: liquid ribbons wrap up and around the bottle, droplets
 * and beads fly outward, and cut-out fruit floats in the burst.
 */
function Splash({ juice, trigger }: { juice: Juice; trigger: number }) {
  const ribbonsRef = useRef<THREE.Group>(null);
  const dropsRef = useRef<THREE.Group>(null);
  const fruitRef = useRef<THREE.Group>(null);
  const start = useRef(-1);
  const fruitTex = useFruitTexture(juice);

  const ribbons = useMemo(
    () =>
      Array.from({ length: RIBBONS }, (_, i) => {
        const curve = ribbonCurve(i);
        return {
          geom: new THREE.TubeGeometry(curve, 60, 0.075 + (i % 3) * 0.02, 12, false),
          delay: i * 0.16,
        };
      }),
    [],
  );
  useEffect(() => () => ribbons.forEach((r) => r.geom.dispose()), [ribbons]);

  const drops = useMemo(
    () =>
      Array.from({ length: DROPS }, (_, i) => {
        const a = (i / DROPS) * Math.PI * 2 + Math.random();
        return {
          a,
          rad: 0.9 + Math.random() * 1.5,
          y0: -0.9 + Math.random() * 0.4,
          rise: 1.4 + Math.random() * 1.6,
          r: 0.028 + Math.random() * 0.06,
          delay: Math.random() * 1.4,
          life: 1.5 + Math.random() * 1.2,
          spin: 0.4 + Math.random() * 0.8,
        };
      }),
    [],
  );

  const fruits = useMemo(
    () =>
      Array.from({ length: FRUITS }, (_, i) => ({
        a: (i / FRUITS) * Math.PI * 2,
        rad: 1.35 + Math.random() * 0.5,
        y: -0.6 + Math.random() * 1.6,
        size: 0.62 + Math.random() * 0.5,
        bob: 0.5 + Math.random() * 0.7,
        speed: 0.14 + Math.random() * 0.12,
      })),
    [],
  );

  useEffect(() => {
    start.current = -1;
  }, [trigger]);

  useFrame((state) => {
    if (start.current === -1) start.current = state.clock.elapsedTime;
    const t = state.clock.elapsedTime - start.current;

    if (ribbonsRef.current) {
      ribbonsRef.current.rotation.y = t * 0.22;
      ribbonsRef.current.children.forEach((child, i) => {
        const r = ribbons[i]!;
        const lt = Math.max(0, t - r.delay);
        const grow = Math.min(1, lt / 0.9);
        const mesh = child as THREE.Mesh;
        const g = mesh.geometry as THREE.TubeGeometry;
        g.setDrawRange(0, Math.floor(g.index!.count * grow));
        const m = mesh.material as THREE.MeshPhysicalMaterial;
        m.opacity = 0.55 + Math.sin(t * 1.4 + i) * 0.15;
        mesh.scale.y = 1 + Math.sin(t * 1.1 + i) * 0.035;
      });
    }

    if (dropsRef.current) {
      dropsRef.current.children.forEach((child, i) => {
        const d = drops[i]!;
        const lt = (t + d.delay) % d.life;
        const p = lt / d.life;
        const a = d.a + t * d.spin * 0.3;
        const rad = d.rad * (0.55 + p * 0.7);
        child.position.set(
          Math.cos(a) * rad,
          d.y0 + d.rise * Math.sin(p * Math.PI * 0.85),
          Math.sin(a) * rad * 0.7,
        );
        const k = Math.sin(p * Math.PI);
        child.scale.setScalar(0.35 + k * 0.9);
        child.visible = k > 0.03;
      });
    }

    if (fruitRef.current) {
      fruitRef.current.children.forEach((child, i) => {
        const f = fruits[i]!;
        const a = f.a + t * f.speed;
        child.position.set(
          Math.cos(a) * f.rad,
          f.y + Math.sin(t * f.bob + i) * 0.16,
          Math.sin(a) * f.rad * 0.6 - 0.35,
        );
        child.rotation.z = Math.sin(t * 0.5 + i) * 0.18;
        child.lookAt(state.camera.position);
      });
    }
  });

  const liquidMat = (opacity: number) => (
    <meshPhysicalMaterial
      color={juice.liquid}
      roughness={0.06}
      transmission={0.6}
      thickness={0.9}
      ior={1.36}
      clearcoat={1}
      clearcoatRoughness={0.04}
      emissive={juice.liquid}
      emissiveIntensity={0.22}
      transparent
      opacity={opacity}
      depthWrite={false}
    />
  );

  return (
    <group>
      <group ref={ribbonsRef}>
        {ribbons.map((r, i) => (
          <mesh key={i} geometry={r.geom}>
            {liquidMat(0.6)}
          </mesh>
        ))}
      </group>

      <group ref={dropsRef}>
        {drops.map((d, i) => (
          <mesh key={i}>
            <sphereGeometry args={[d.r, 12, 12]} />
            {liquidMat(0.9)}
          </mesh>
        ))}
      </group>

      {fruitTex && (
        <group ref={fruitRef}>
          {fruits.map((f, i) => (
            <mesh key={i}>
              <planeGeometry args={[f.size, f.size]} />
              <meshBasicMaterial map={fruitTex} transparent toneMapped={false} />
            </mesh>
          ))}
        </group>
      )}
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
    targetPos.set(offset * 2.55, active ? 0 : -0.2, active ? 0 : -Math.abs(offset) * 1.6);
    const k = 1 - Math.exp(-6 * delta);
    group.current.position.lerp(targetPos, k);
    const s = active ? 1 : 0.72;
    targetScale.set(s, s, s);
    group.current.scale.lerp(targetScale, k);
    group.current.visible = Math.abs(offset) <= 2.2;

    const t = state.clock.elapsedTime;
    if (active) {
      group.current.rotation.y +=
        (Math.sin(t * 0.6) * 0.3 - group.current.rotation.y) * (1 - Math.exp(-3 * delta));
      group.current.position.y += Math.sin(t * 1.1) * 0.004;
    } else {
      group.current.rotation.y += delta * 0.25;
    }

    if (capRef.current) {
      if (openStart.current === -1) openStart.current = t;
      const e = t - openStart.current;
      if (active && e >= 0 && e < 1.5) {
        const p = e / 1.5;
        const lift = Math.sin(Math.min(p, 1) * Math.PI) * 0.85;
        capRef.current.position.y = 1.17 + lift;
        capRef.current.rotation.z = lift * 1.5;
        capRef.current.rotation.x = lift * 0.7;
      } else {
        capRef.current.position.y +=
          (1.17 - capRef.current.position.y) * (1 - Math.exp(-8 * delta));
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
          <cylinderGeometry args={[0.645, 0.645, 1.3, 64, 1, true]} />
          <meshStandardMaterial map={label} roughness={0.8} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* broad matte cap */}
      <group ref={capRef} position={[0, 1.17, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.36, 0.36, 0.26, 48]} />
          <meshStandardMaterial color="#c9c6c0" metalness={0.35} roughness={0.45} />
        </mesh>
        <mesh position={[0, 0.14, 0]}>
          <cylinderGeometry args={[0.352, 0.352, 0.03, 48]} />
          <meshStandardMaterial color="#e2dfd8" metalness={0.4} roughness={0.35} />
        </mesh>
      </group>

      {active && <Splash juice={juice} trigger={activeIndex} />}
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
      camera={{ position: [0, 0.3, 5.8], fov: 42 }}
      gl={{ antialias: true }}
    >
      <Suspense fallback={null}>
        <Rig juices={juices} activeIndex={activeIndex} />
      </Suspense>
    </Canvas>
  );
}
