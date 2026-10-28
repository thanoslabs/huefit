import VirtualDraping from "../draping/VirtualDraping";
import { useState } from "react";
import { rankSeasons, SEASONS, type SeasonId } from "./seasons";
import type { RGB } from "../analysis/sampling";

type Props = { colours: RGB[]; image: ImageData; onBack: () => void };

export default function SeasonResults({ colours, image, onBack }: Props) {
  const analysis = rankSeasons(colours);
  const [override, setOverride] = useState<SeasonId | "">("");
  const [comparison, setComparison] = useState<SeasonId | "">("");
  if (!analysis) return <p role="alert">Not enough valid colour samples. Please return to sampling.</p>;
  const selected = SEASONS.find((season) => season.id === override) ?? analysis.ranked[0].season;
  const compared = SEASONS.find((season) => season.id === comparison) ?? analysis.ranked.find(({ season }) => season.id !== selected.id)?.season ?? selected;
  return (
    <section className="mx-auto w-full max-w-xl py-10" aria-label="Season exploration">
      <button type="button" className="mb-6 text-sm underline" onClick={onBack}>← Adjust samples</button>
      <h2 className="text-3xl font-semibold">Explore your seasonal palette</h2>
      <p className="mt-3 text-[#6d6870]">This is an experimental colour comparison based on photo pixels, not a validated personal-colour diagnosis. Lighting, makeup and camera processing can change the ranking.</p>
      <div className="mt-6 rounded-xl border border-[#ded8d2] p-5">
        <p className="text-sm text-[#6d6870]">{override ? "Your selection" : "Exploratory top match"}</p>
        <h3 className="mt-1 text-2xl font-semibold">{selected.name}</h3>
        <p className="mt-2 text-sm capitalize text-[#6d6870]">{selected.undertone} · {selected.depth} · {selected.chroma}</p>
        <div className="mt-5 flex gap-2" aria-label="Season palette">
          {selected.palette.map((hex) => <span key={hex} className="h-16 flex-1 rounded-lg" title={hex} style={{ backgroundColor: hex }} />)}
        </div>
      </div>
      <label className="mt-6 block text-sm font-medium" htmlFor="season-override">Compare a different season</label>
      <select id="season-override" className="mt-2 w-full rounded-lg border border-[#bbb3b1] bg-white p-3" value={override} onChange={(event) => setOverride(event.target.value as SeasonId | "")}>
        <option value="">Exploratory top match</option>
        {SEASONS.map((season) => <option key={season.id} value={season.id}>{season.name}</option>)}
      </select>
      <h3 className="mt-8 text-lg font-semibold">Other suggested palettes</h3>
      <div className="mt-3 space-y-2">
        {analysis.ranked.slice(0, 4).map(({ season }, index) => (
          <button key={season.id} type="button" className="flex w-full items-center justify-between rounded-lg border border-[#ded8d2] px-4 py-3 text-left" onClick={() => setOverride(season.id)}>
            <span>{index + 1}. {season.name}</span>
            <span className="flex gap-1">{season.palette.slice(0, 3).map((hex) => <span key={hex} className="h-5 w-5 rounded" style={{ backgroundColor: hex }} />)}</span>
          </button>
        ))}
      </div>
      <section className="mt-8" aria-label="Compare seasonal palettes">
        <h3 className="text-xl font-semibold">Compare seasonal palettes</h3>
        <p className="mt-2 text-sm text-[#6d6870]">Explore the colours from two seasons side by side. Choose a comparison season independently of your selected match.</p>
        <label htmlFor="comparison-season" className="mt-4 block text-sm font-medium">Compare against</label>
        <select
          id="comparison-season"
          className="mt-2 w-full rounded-lg border border-[#bbb3b1] bg-white p-3"
          value={comparison}
          onChange={(event) => setComparison(event.target.value as SeasonId | "")}
        >
          <option value="">Next suggested season</option>
          {SEASONS.map((season) => <option key={season.id} value={season.id}>{season.name}</option>)}
        </select>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {[selected, compared].map((season, index) => (
            <div key={index} className="min-w-0 rounded-xl border border-[#ded8d2] p-3">
              <h4 className="mb-3 text-sm font-semibold">{season.name}</h4>
              <div className="grid grid-cols-2 gap-2" aria-label={`${season.name} swatches`}>
                {season.palette.map((hex) => (
                  <div key={hex} className="min-w-0">
                    <div className="h-12 rounded-md border border-black/10" style={{ backgroundColor: hex }} />
                    <span className="mt-1 block text-xs">{hex}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
      <VirtualDraping key={selected.id} image={image} season={selected} />
      <p className="mt-6 text-sm text-[#6d6870]">The ranking is a starting point for visual comparison, not a confidence score. Compare different colours using the virtual drapes above.</p>
    </section>
  );
}
