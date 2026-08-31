import { createFileRoute } from "@tanstack/react-router";
import { ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";
import { juices, BRAND } from "@/data/juices";

const BottleCarousel = lazy(() => import("@/components/juice/BottleCarousel"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pulpa — Cold-Pressed Juice in Motion" },
      {
        name: "description",
        content:
          "Pulpa cold-pressed juice: five small-batch presses — Solstice, Verdant, Ember, Dusk and Coast — shown in a live 3D bottle carousel.",
      },
      { property: "og:title", content: "Pulpa — Cold-Pressed Juice in Motion" },
      {
        property: "og:description",
        content:
          "Five small-batch cold-pressed juices, spinning in 3D. Nothing added, nothing hidden.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true);

  useEffect(() => {
    if (!auto) return;
    const t = setInterval(() => setActive((i) => (i + 1) % juices.length), 5200);
    return () => clearInterval(t);
  }, [auto]);

  const juice = juices[active];

  const select = (i: number) => {
    setAuto(false);
    setActive(i);
  };

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      {/* nav */}
      <header className="relative z-20 flex items-center justify-between px-6 py-6 md:px-12">
        <span className="font-display text-2xl tracking-tight">{BRAND.wordmark}</span>
        <nav className="hidden gap-8 text-sm text-muted-foreground md:flex">
          <a href="#range" className="transition-colors hover:text-foreground">
            The range
          </a>
          <a href="#process" className="transition-colors hover:text-foreground">
            Process
          </a>
          <a href="#subscribe" className="transition-colors hover:text-foreground">
            Subscribe
          </a>
        </nav>
        <a
          href="#range"
          className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground shadow-[var(--shadow-lift)] transition-transform hover:-translate-y-0.5"
        >
          Shop
        </a>
      </header>

      {/* hero + 3d stage */}
      <section className="relative px-6 pb-4 md:px-12">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[70vh] sun-glow opacity-60 transition-opacity duration-700"
          aria-hidden
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-6 lg:grid-cols-[1fr_auto]">
          <div className="max-w-xl">
            <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
              Small batch · Cold pressed · HPP only
            </p>
            <h1 className="mt-5 text-5xl leading-[0.95] tracking-tight md:text-7xl">
              Juice that
              <br />
              never sits
              <span className="text-primary">.</span>
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
              {BRAND.promise} Five presses, pressed at dawn, in your hands before the fruit
              forgets where it grew.
            </p>
          </div>
        </div>

        <div className="relative mx-auto mt-2 h-[46vh] min-h-[320px] w-full max-w-5xl md:h-[54vh]">
          <ClientOnly
            fallback={
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Loading the bottles…
              </div>
            }
          >
            <Suspense fallback={null}>
              <BottleCarousel juices={juices} activeIndex={active} />
            </Suspense>
          </ClientOnly>
        </div>

        {/* active product detail */}
        <div
          key={juice.id}
          className="animate-drift mx-auto mt-2 max-w-3xl text-center"
        >
          <h2 className="text-3xl md:text-4xl">{juice.name}</h2>
          <p className="mt-2 text-sm uppercase tracking-[0.2em] text-muted-foreground">
            {juice.tagline}
          </p>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
            {juice.description}
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground">
            <span className="rounded-full border border-border px-3 py-1">{juice.volume}</span>
            <span className="rounded-full border border-border px-3 py-1">
              {juice.kcal} kcal
            </span>
            <span className="rounded-full border border-border px-3 py-1">{juice.price}</span>
          </div>
        </div>

        {/* selector */}
        <div className="mx-auto mt-8 flex max-w-3xl flex-wrap items-center justify-center gap-2">
          {juices.map((j, i) => (
            <button
              key={j.id}
              onClick={() => select(i)}
              aria-pressed={i === active}
              className={`rounded-full border px-4 py-2 text-sm transition-all ${
                i === active
                  ? "border-primary bg-primary text-primary-foreground shadow-[var(--shadow-lift)]"
                  : "border-border bg-card text-muted-foreground hover:-translate-y-0.5 hover:text-foreground"
              }`}
            >
              {j.name}
            </button>
          ))}
        </div>
      </section>

      {/* marquee */}
      <div className="mt-16 overflow-hidden border-y border-border bg-card py-4">
        <div className="animate-marquee flex w-max gap-10 whitespace-nowrap text-sm uppercase tracking-[0.3em] text-muted-foreground">
          {Array.from({ length: 2 }).map((_, k) => (
            <span key={k} className="flex gap-10">
              {["Pressed at dawn", "Zero concentrate", "Glass, always", "48h shelf window", "Ugly fruit welcome"].map(
                (t) => (
                  <span key={t}>{t} ·</span>
                ),
              )}
            </span>
          ))}
        </div>
      </div>

      {/* range grid */}
      <section id="range" className="mx-auto max-w-6xl px-6 py-20 md:px-12">
        <h2 className="text-3xl md:text-5xl">The five presses</h2>
        <p className="mt-3 max-w-lg text-sm text-muted-foreground">
          Each bottle is a single press run. When the fruit is out, the flavour is out until
          next season.
        </p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {juices.map((j, i) => (
            <button
              key={j.id}
              onClick={() => {
                select(i);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="group rounded-3xl border border-border bg-card p-6 text-left transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]"
            >
              <span
                className="block h-1.5 w-14 rounded-full"
                style={{ backgroundColor: j.liquid }}
              />
              <h3 className="mt-5 text-2xl">{j.name}</h3>
              <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                {j.tagline}
              </p>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {j.description}
              </p>
              <ul className="mt-5 flex flex-wrap gap-2">
                {j.notes.map((n) => (
                  <li
                    key={n}
                    className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground"
                  >
                    {n}
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {j.volume} · {j.kcal} kcal
                </span>
                <span className="font-medium text-foreground">{j.price}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* process */}
      <section id="process" className="border-y border-border bg-card">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 md:grid-cols-3 md:px-12">
          {[
            {
              n: "01",
              t: "Picked at 4am",
              d: "We buy direct from four growers within 90 minutes of the press house.",
            },
            {
              n: "02",
              t: "Hydraulic pressed",
              d: "Two tonnes of slow pressure, no heat, no oxidation, no shortcuts.",
            },
            {
              n: "03",
              t: "Bottled in glass",
              d: "Filled, capped and chilled the same morning. Returnable bottles, always.",
            },
          ].map((s) => (
            <div key={s.n}>
              <span className="font-display text-4xl text-primary">{s.n}</span>
              <h3 className="mt-3 text-xl">{s.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* subscribe */}
      <section id="subscribe" className="mx-auto max-w-3xl px-6 py-24 text-center md:px-12">
        <h2 className="text-3xl md:text-5xl">Six bottles, every Friday</h2>
        <p className="mx-auto mt-4 max-w-md text-sm text-muted-foreground">
          Pick your presses or let us rotate the range with the season. Pause or cancel any
          week — no lock-in.
        </p>
        <form
          className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
          onSubmit={(e) => e.preventDefault()}
        >
          <label className="sr-only" htmlFor="email">
            Email address
          </label>
          <input
            id="email"
            type="email"
            required
            placeholder="you@example.com"
            className="flex-1 rounded-full border border-border bg-card px-5 py-3 text-sm outline-none focus:border-primary"
          />
          <button
            type="submit"
            className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-transform hover:-translate-y-0.5"
          >
            Start delivery
          </button>
        </form>
      </section>

      <footer className="border-t border-border px-6 py-10 text-sm text-muted-foreground md:px-12">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-3 sm:flex-row">
          <span className="font-display text-lg text-foreground">{BRAND.wordmark}</span>
          <span>© {new Date().getFullYear()} {BRAND.name}. Pressed, never pasteurised.</span>
        </div>
      </footer>
    </main>
  );
}
