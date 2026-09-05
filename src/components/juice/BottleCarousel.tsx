import type { Juice } from "@/data/juices";
import SplashVideo from "./SplashVideo";
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

export default function BottleCarousel({
  juices,
  activeIndex,
}: {
  juices: Juice[];
  activeIndex: number;
}) {
  const juice = juices[activeIndex] ?? juices[0];
  if (!juice) return null;

  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg shadow-[var(--shadow-lift)]">
      <SplashVideo juice={juice} className="h-full w-full rounded-lg" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background/80 to-transparent" />
      <div
        key={juice.id}
        className="animate-drift pointer-events-none absolute bottom-3 left-3 flex items-end gap-3 sm:bottom-5 sm:left-5"
      >
        <img
          src={FRUIT_IMAGES[juice.id]}
          alt={`${juice.tagline} fruit ingredients`}
          width={816}
          height={816}
          className="h-20 w-20 object-contain drop-shadow-xl sm:h-28 sm:w-28"
        />
        <div className="mb-2 rounded-md bg-card/90 px-3 py-2 shadow-[var(--shadow-lift)]">
          <p className="text-xs uppercase text-muted-foreground">Now pouring</p>
          <p className="font-display text-xl text-foreground">{juice.name}</p>
        </div>
      </div>
    </div>
  );
}
