import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { juices, BRAND } from "@/data/juices";
import SplashVideo from "@/components/juice/SplashVideo";
import { FRUIT_IMAGES } from "@/components/juice/BottleCarousel";

export const Route = createFileRoute("/juice/$id")({
  loader: ({ params }) => {
    const juice = juices.find((j) => j.id === params.id);
    if (!juice) throw notFound();
    return { juice };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Juice not found — Fruit Splash" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { juice } = loaderData;
    const title = `${juice.name} — ${juice.tagline} | Fruit Splash`;
    const description = juice.description;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "product" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  notFoundComponent: JuiceNotFound,
  component: JuiceDetail,
});

function JuiceNotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-5 px-6 text-center">
      <h1 className="text-3xl">We can't find that juice</h1>
      <p className="text-sm text-muted-foreground">
        It may have sold out with the season.
      </p>
      <Link
        to="/"
        className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground"
      >
        Back to all juices
      </Link>
    </main>
  );
}

function JuiceDetail() {
  const { juice } = Route.useLoaderData();
  const others = juices.filter((j) => j.id !== juice.id).slice(0, 5);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="flex items-center justify-between px-6 py-6 md:px-12">
        <Link to="/" className="font-display text-2xl tracking-tight">
          {BRAND.wordmark}
        </Link>
        <Link
          to="/"
          className="rounded-full border border-border bg-card px-5 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Back
        </Link>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-6 pb-16 md:px-12 lg:grid-cols-2">
        <div className="aspect-[16/10] w-full overflow-hidden rounded-lg shadow-[var(--shadow-lift)]">
          <SplashVideo juice={juice} className="h-full w-full" />
        </div>

        <div>
          <span
            className="block h-1.5 w-16 rounded-full"
            style={{ backgroundColor: juice.liquid }}
          />
          <h1 className="mt-6 text-4xl md:text-6xl">{juice.name}</h1>
          <p className="mt-3 text-sm uppercase tracking-[0.22em] text-muted-foreground">
            {juice.tagline}
          </p>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground">
            {juice.description}
          </p>

          <div className="mt-8 flex items-center gap-4">
            <img
              src={FRUIT_IMAGES[juice.id]}
              alt={`${juice.name} fruit ingredients`}
              width={816}
              height={816}
              loading="lazy"
              className="h-24 w-24 object-contain drop-shadow-xl"
            />
            <ul className="flex flex-wrap gap-2">
              {juice.notes.map((n) => (
                <li
                  key={n}
                  className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground"
                >
                  {n}
                </li>
              ))}
            </ul>
          </div>

          <dl className="mt-8 grid grid-cols-3 gap-6">
            {[
              { k: "Volume", v: juice.volume },
              { k: "Energy", v: `${juice.kcal} kcal` },
              { k: "Price", v: juice.price },
            ].map((s) => (
              <div key={s.k}>
                <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                  {s.k}
                </dt>
                <dd className="font-display text-2xl text-primary">{s.v}</dd>
              </div>
            ))}
          </dl>

          <Link
            to="/"
            className="mt-10 inline-block rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-transform hover:-translate-y-0.5"
          >
            ← Back to the range
          </Link>
        </div>
      </section>

      <section className="border-t border-border bg-card">
        <div className="mx-auto max-w-6xl px-6 py-14 md:px-12">
          <h2 className="text-2xl">Try another press</h2>
          <div className="mt-6 flex flex-wrap gap-2">
            {others.map((j) => (
              <Link
                key={j.id}
                to="/juice/$id"
                params={{ id: j.id }}
                className="rounded-full border border-border bg-background px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {j.name}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
