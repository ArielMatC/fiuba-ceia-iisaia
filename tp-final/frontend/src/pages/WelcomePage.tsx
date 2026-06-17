import { Link } from 'react-router-dom'

import WaveLogo from '../components/WaveLogo'

function WelcomePage() {
  return (
    <div className="min-h-screen bg-ink text-fuji">
      <main className="mx-auto flex min-h-screen max-w-5xl items-center px-6 py-10">
        <section className="grid w-full gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <WaveLogo className="h-20 w-auto" />
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.16em] text-wave">
                  IISAIA / FIUBA
                </p>
                <h1 className="mt-2 text-4xl font-semibold text-fuji sm:text-5xl">
                  Oil Production Forecaster
                </h1>
              </div>
            </div>

            <p className="max-w-2xl text-lg leading-8 text-oldwhite">
              Forecast per-well oil production with Arps decline curves and inspect the full API
              flow from upload to forecast.
            </p>

            <Link
              to="/wells"
              className="inline-flex items-center justify-center rounded bg-wave px-7 py-3 text-sm font-semibold text-ink shadow-lg shadow-wave/20 hover:bg-wave-bright"
            >
              Login
            </Link>
          </div>

          <div className="relative min-h-[22rem] overflow-hidden rounded-lg border border-line bg-ink-deep p-6 shadow-2xl shadow-black/30">
            <div className="absolute top-0 right-8 h-full w-px bg-wave/20" />
            <div className="relative flex h-full flex-col justify-between gap-8">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
                  Forecast workspace
                </p>
                <div className="mt-8 h-36 rounded border border-line bg-ink p-4">
                  <div className="mb-5 flex items-end gap-2">
                    <span className="h-16 w-3 rounded-sm bg-wave" />
                    <span className="h-24 w-3 rounded-sm bg-aqua" />
                    <span className="h-12 w-3 rounded-sm bg-sand" />
                    <span className="h-28 w-3 rounded-sm bg-wave-bright" />
                    <span className="h-20 w-3 rounded-sm bg-sand" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 rounded bg-line" />
                    <div className="h-2 w-2/3 rounded bg-line" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="border-l border-wave pl-3">
                  <p className="text-muted">Model</p>
                  <p className="mt-1 font-semibold text-fuji">Arps</p>
                </div>
                <div className="border-l border-carp pl-3">
                  <p className="text-muted">Unit</p>
                  <p className="mt-1 font-semibold text-fuji">bbl/d</p>
                </div>
                <div className="border-l border-aqua pl-3">
                  <p className="text-muted">View</p>
                  <p className="mt-1 font-semibold text-fuji">EUR</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default WelcomePage
