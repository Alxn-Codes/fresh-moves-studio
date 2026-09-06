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
      {/* brand label on the bottle */}
      <div
        className="pointer-events-none absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2"
        aria-hidden
      >
        <div className="flex flex-col items-center rounded-xl border border-white/50 bg-white/85 px-4 py-2 text-center shadow-lg backdrop-blur-[2px]">
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-neutral-800 sm:text-xs">
            Fruit Splash
          </span>
          <span
            className="mt-0.5 h-0.5 w-8 rounded-full"
            style={{ backgroundColor: juice.liquid }}
          />
          <span className="mt-1 font-display text-sm leading-none text-neutral-900 sm:text-base">
            {juice.name}
          </span>
        </div>
      </div>
    </div>
  );
}
