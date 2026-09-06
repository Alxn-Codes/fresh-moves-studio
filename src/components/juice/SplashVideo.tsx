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
import fruitSolstice from "@/assets/fruit-solstice.png";
import fruitVerdant from "@/assets/fruit-verdant.png";
import fruitEmber from "@/assets/fruit-ember.png";
import fruitDusk from "@/assets/fruit-dusk.png";
import fruitCoast from "@/assets/fruit-coast.png";
import fruitBloom from "@/assets/fruit-bloom.png";
import fruitMango from "@/assets/fruit-mango.png";
import fruitIndigo from "@/assets/fruit-indigo.png";
import fruitGrove from "@/assets/fruit-grove.png";
import fruitSunburst from "@/assets/fruit-sunburst.png";

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

export const FRUIT_IMAGES: Record<string, string> = {
  solstice: fruitSolstice,
  verdant: fruitVerdant,
  ember: fruitEmber,
  dusk: fruitDusk,
  coast: fruitCoast,
  bloom: fruitBloom,
  mango: fruitMango,
  indigo: fruitIndigo,
  grove: fruitGrove,
  sunburst: fruitSunburst,
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
      {/* brand label printed on the bottle */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        aria-hidden
      >
        <div className="flex flex-col items-center text-center">
          <span className="font-display text-xl font-bold lowercase leading-none tracking-tight text-neutral-900 drop-shadow-[0_1px_1px_rgba(255,255,255,0.6)] sm:text-2xl">
            fruit splash
          </span>
          <img
            src={FRUIT_IMAGES[juice.id]}
            alt=""
            width={816}
            height={816}
            className="mt-1 h-12 w-12 object-contain drop-shadow-md sm:h-16 sm:w-16"
          />
          <span className="mt-1 text-[8px] font-medium uppercase tracking-[0.18em] text-neutral-700 sm:text-[10px]">
            Cold Pressed Juice
          </span>
          <span className="font-display text-xs font-semibold leading-tight text-neutral-900 sm:text-sm">
            {juice.name}
          </span>
          <span
            className="mt-0.5 rounded-full px-2 py-px text-[7px] font-semibold uppercase tracking-wider text-white sm:text-[9px]"
            style={{ backgroundColor: juice.liquid }}
          >
            100% Natural
          </span>
          <span className="mt-0.5 text-[8px] font-medium text-neutral-700 sm:text-[10px]">
            {juice.volume}
          </span>
        </div>
      </div>
    </div>
  );
}
