import { useState } from "react";
import PhotoCapture from "./features/capture/PhotoCapture";

const colours = ["#b87868", "#c6a178", "#d5bf8e", "#829482", "#637c91", "#8c718f"];

export default function App() {
  const [capturing, setCapturing] = useState(false);
  return (
    <main id="main-content" className="min-h-screen bg-[#f7f4ef] text-[#282536]">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:p-3">Skip to main content</a>
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-8 sm:px-10">
        <header className="flex items-center justify-between">
          <a className="text-2xl font-semibold tracking-tight" href={import.meta.env.BASE_URL} aria-label="HueFit home">huefit<span className="text-[#b87868]">.</span></a>
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-[#756f78]">Private by design</span>
        </header>
        {capturing ? <PhotoCapture onClose={() => setCapturing(false)} /> : (
          <section className="flex flex-1 flex-col items-center justify-center py-24 text-center">
            <p className="mb-5 text-sm font-medium uppercase tracking-[0.3em] text-[#9c6d6c]">Your colours, discovered</p>
            <h1 className="max-w-2xl text-5xl font-semibold leading-tight tracking-tight sm:text-7xl">Find the shades that <em className="font-serif text-[#a36d78]">fit you.</em></h1>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-[#6d6870]">Explore your personal palette, compare fabrics, and discover colours that complement you — all in your browser.</p>
            <div className="mt-10 flex gap-2" aria-label="Sample palette">
              {colours.map((colour) => <span key={colour} className="h-12 w-9 rounded-lg sm:h-16 sm:w-12" style={{ backgroundColor: colour }} />)}
            </div>
            <button type="button" className="mt-10 rounded-full bg-[#282536] px-7 py-3 text-white" onClick={() => setCapturing(true)}>Get started with a photo</button>
            <p className="mt-4 text-sm text-[#716b70]">Your photo stays on this device. Results are exploratory and can be adjusted.</p>
          </section>
        )}
        <footer className="text-center text-xs text-[#8b8589]">No accounts. No uploads to a server. Just your colours.</footer>
      </div>
    </main>
  );
}
