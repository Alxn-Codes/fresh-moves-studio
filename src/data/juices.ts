export type Juice = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  notes: string[];
  kcal: number;
  volume: string;
  price: string;
  /** hex used for the 3D liquid + accent glow */
  liquid: string;
  glow: string;
};

export const BRAND = {
  name: "PULPA",
  wordmark: "Pulpa",
  promise: "Cold-pressed in small batches. Nothing added, nothing hidden.",
};

export const juices: Juice[] = [
  {
    id: "solstice",
    name: "Solstice",
    tagline: "Blood orange · Sicilian lemon",
    description:
      "Late-harvest blood oranges pressed within six hours of picking, cut with a whisper of Sicilian lemon for a finish that stays bright to the last sip.",
    notes: ["Blood orange", "Lemon", "Raw honey"],
    kcal: 120,
    volume: "330 ml",
    price: "$7",
    liquid: "#ff5722",
    glow: "#ff8a3d",
  },
  {
    id: "verdant",
    name: "Verdant",
    tagline: "Cucumber · Kale · Green apple",
    description:
      "A clean, grassy press built on cold cucumber and young kale, lifted by green apple so the greens taste like a garden rather than a chore.",
    notes: ["Cucumber", "Kale", "Green apple", "Mint"],
    kcal: 85,
    volume: "330 ml",
    price: "$8",
    liquid: "#7bc043",
    glow: "#a6e05a",
  },
  {
    id: "ember",
    name: "Ember",
    tagline: "Carrot · Turmeric · Ginger",
    description:
      "Root-forward and warming. Field carrots carry fresh turmeric and a serious hit of ginger, finished with black pepper for absorption.",
    notes: ["Carrot", "Turmeric", "Ginger", "Black pepper"],
    kcal: 110,
    volume: "330 ml",
    price: "$8",
    liquid: "#ff9500",
    glow: "#ffbe4d",
  },
  {
    id: "dusk",
    name: "Dusk",
    tagline: "Blackberry · Beet · Lime",
    description:
      "Deep and earthy. Cold-pressed beet meets ripe blackberry, with lime pulling the whole thing forward into something surprisingly refreshing.",
    notes: ["Blackberry", "Beet", "Lime"],
    kcal: 130,
    volume: "330 ml",
    price: "$9",
    liquid: "#8e2f6b",
    glow: "#d45fa8",
  },
  {
    id: "coast",
    name: "Coast",
    tagline: "Pineapple · Passionfruit · Coconut water",
    description:
      "Golden pineapple and passionfruit loosened with young coconut water — the lightest press in the range and the one that disappears fastest.",
    notes: ["Pineapple", "Passionfruit", "Coconut water"],
    kcal: 105,
    volume: "330 ml",
    price: "$8",
    liquid: "#ffd21f",
    glow: "#fff07a",
  },
  {
    id: "bloom",
    name: "Bloom",
    tagline: "Watermelon · Strawberry",
    description:
      "Ice-cold watermelon pressed with peak-season strawberries. Barely sweet, entirely refreshing, and gone before you sit down.",
    notes: ["Watermelon", "Strawberry", "Lime"],
    kcal: 90,
    volume: "330 ml",
    price: "$7",
    liquid: "#ff4d6d",
    glow: "#ff8fa3",
  },
  {
    id: "mango",
    name: "Amber",
    tagline: "Alphonso mango · Lime",
    description:
      "Thick, honeyed Alphonso mango cut with lime so the sweetness stays in check. The richest press we make.",
    notes: ["Alphonso mango", "Lime", "Sea salt"],
    kcal: 140,
    volume: "330 ml",
    price: "$9",
    liquid: "#ffb300",
    glow: "#ffd166",
  },
  {
    id: "indigo",
    name: "Indigo",
    tagline: "Blueberry · Blackcurrant · Pomegranate",
    description:
      "A dark berry press with real backbone — blueberry and blackcurrant weighted with pomegranate for a tannic, wine-like finish.",
    notes: ["Blueberry", "Blackcurrant", "Pomegranate"],
    kcal: 125,
    volume: "330 ml",
    price: "$9",
    liquid: "#5b2a86",
    glow: "#9d6bd8",
  },
  {
    id: "grove",
    name: "Grove",
    tagline: "Guava · Sweet lime · Mint",
    description:
      "Perfumed green guava with sweet lime and a handful of mint pressed in cold — floral up front, clean all the way down.",
    notes: ["Guava", "Sweet lime", "Mint"],
    kcal: 95,
    volume: "330 ml",
    price: "$8",
    liquid: "#a8d84a",
    glow: "#d3f08a",
  },
];
