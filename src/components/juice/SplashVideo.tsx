import type { Juice } from "@/data/juices";
import vidSolstice from "@/assets/vid-solstice.webm.asset.json";
import vidVerdant from "@/assets/vid-verdant.webm.asset.json";
import vidEmber from "@/assets/vid-ember.webm.asset.json";
import vidDusk from "@/assets/vid-dusk.webm.asset.json";
import vidCoast from "@/assets/vid-coast.webm.asset.json";
import vidBloom from "@/assets/vid-bloom.webm.asset.json";
import vidMango from "@/assets/vid-mango.webm.asset.json";
import vidIndigo from "@/assets/vid-indigo.webm.asset.json";
import vidGrove from "@/assets/vid-grove.webm.asset.json";
import vidSunburst from "@/assets/vid-sunburst.webm.asset.json";

export const JUICE_VIDEOS: Record<string, string> = {
  solstice: vidSolstice.url,
  verdant: vidVerdant.url,
  ember: vidEmber.url,
  dusk: vidDusk.url,
  coast: vidCoast.url,
  bloom: vidBloom.url,
  mango: vidMango.url,
  indigo: vidIndigo.url,
  grove: vidGrove.url,
  sunburst: vidSunburst.url,
};

export default function SplashVideo({
  juice,
  className = "",
}: {
  juice: Juice;
  className?: string;
}) {
  const src = JUICE_VIDEOS[juice.id] ?? vidSunburst.url;

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
        src={src}
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
