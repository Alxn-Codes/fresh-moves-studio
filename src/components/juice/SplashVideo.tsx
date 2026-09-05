import type { Juice } from "@/data/juices";
import splash from "@/assets/splash-alpha.webm.asset.json";

/** Hue of the source footage (orange-mango juice) in degrees. */
const SOURCE_HUE = 40;

function hexToHue(hex: string) {
  const m = hex.replace("#", "");
  const r = parseInt(m.slice(0, 2), 16) / 255;
  const g = parseInt(m.slice(2, 4), 16) / 255;
  const b = parseInt(m.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  if (d === 0) return SOURCE_HUE;
  let h = 0;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return (h * 60 + 360) % 360;
}

export function juiceFilter(juice: Juice) {
  const shift = (((hexToHue(juice.liquid) - SOURCE_HUE) % 360) + 540) % 360 - 180;
  return `hue-rotate(${shift.toFixed(0)}deg) saturate(1.15)`;
}

export default function SplashVideo({
  juice,
  className = "",
}: {
  juice: Juice;
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-lg ${className}`}
      style={{
        background: `radial-gradient(circle at 50% 55%, ${juice.glow}33, transparent 65%), var(--card)`,
      }}
    >
      <video
        key={juice.id}
        className="h-full w-full object-cover"
        style={{ filter: juiceFilter(juice) }}
        src={splash.url}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-label={`${juice.name} juice splashing around a Fruit Splash bottle`}
      />
    </div>
  );
}
