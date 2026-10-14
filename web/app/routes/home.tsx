import { useState } from "react"
import { ArrowDownRight, ArrowUpRight } from "lucide-react"

const REPOSITORY = "https://github.com/IbrahimIjai/pocket-app"
const ANDROID_APP = "https://expo.dev/accounts/whizzie/projects/pocket/builds"
const ENTRY_PRICE = 100_000
const MAINTENANCE_MARGIN = 0.04
const PACES = [
  { label: "Calm", multiplier: 2 },
  { label: "Bold", multiplier: 5 },
  { label: "Wild", multiplier: 10 },
] as const

export function meta() {
  return [
    { title: "Pocket: Trade on your terms." },
    {
      name: "description",
      content:
        "Trade in dollars with a risk budget you choose. Pocket brings passkey accounts, AUSD, and simple trading to Monad.",
    },
    { property: "og:title", content: "Pocket: Trade on your terms." },
    {
      property: "og:description",
      content: "Your wallet. Your risk. Your Pocket.",
    },
    {
      name: "theme-color",
      content: "#F5F3EC",
      media: "(prefers-color-scheme: light)",
    },
    {
      name: "theme-color",
      content: "#0F1115",
      media: "(prefers-color-scheme: dark)",
    },
  ]
}

const dollars = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)

export default function Home() {
  const [risk, setRisk] = useState(5)
  const [multiplier, setMultiplier] = useState<number>(5)
  const [side, setSide] = useState<"long" | "short">("long")
  const distance = 1 / multiplier - MAINTENANCE_MARGIN
  const autoClose =
    ENTRY_PRICE * (side === "long" ? 1 - distance : 1 + distance)

  return (
    <div className="landing">
      <header className="landing-header">
        <a className="wordmark" href="/" aria-label="Pocket home">
          <img src="/brand/pocket-mark.svg" alt="" width="38" height="38" />
          <span>pocket</span>
        </a>
        <a
          className="source-link"
          aria-label="View Pocket source code on GitHub"
          href={REPOSITORY}
          target="_blank"
          rel="noreferrer"
        >
          <span>View the code</span>
          <ArrowUpRight size={16} aria-hidden="true" />
        </a>
      </header>
      <main className="landing-main">
        <section className="hero" aria-labelledby="headline">
          <div className="eyebrow">
            <span className="status-dot" /> A little more control.
          </div>
          <h1 id="headline">
            Trade in dollars.
            <br />
            On <span>your</span> terms.
          </h1>
          <p className="hero-description">
            Your wallet. A risk budget you choose.
            <br />
            Trading that makes sense before you tap.
          </p>
          <a
            className="get-pocket"
            href={ANDROID_APP}
            target="_blank"
            rel="noreferrer"
          >
            Get Pocket <ArrowUpRight size={20} aria-hidden="true" />
          </a>
          <p className="availability">For Android. Made for you.</p>
        </section>
        <section className="trade-preview" aria-labelledby="preview-title">
          <div className="preview-header">
            <div>
              <span className="preview-eyebrow">A LITTLE PREVIEW</span>
              <h2 id="preview-title">Your trade, simplified.</h2>
            </div>
            <span className="btc-mark" aria-label="Bitcoin">
              ₿
            </span>
          </div>
          <div
            className="direction-picker"
            role="group"
            aria-label="Trade direction"
          >
            <button
              type="button"
              aria-pressed={side === "long"}
              className={
                side === "long" ? "direction selected up" : "direction"
              }
              onClick={() => setSide("long")}
            >
              <ArrowUpRight size={17} aria-hidden="true" /> Up
            </button>
            <button
              type="button"
              aria-pressed={side === "short"}
              className={
                side === "short" ? "direction selected down" : "direction"
              }
              onClick={() => setSide("short")}
            >
              <ArrowDownRight size={17} aria-hidden="true" /> Down
            </button>
          </div>
          <div className="preview-field">
            <span className="field-label" id="risk-label">
              How much will you risk?
            </span>
            <div
              className="risk-picker"
              role="group"
              aria-labelledby="risk-label"
            >
              {[5, 10, 25].map((amount) => (
                <button
                  key={amount}
                  type="button"
                  aria-pressed={risk === amount}
                  className={
                    risk === amount ? "risk-option selected" : "risk-option"
                  }
                  onClick={() => setRisk(amount)}
                >
                  {dollars(amount)}
                </button>
              ))}
            </div>
          </div>
          <div className="preview-field">
            <span className="field-label" id="pace-label">
              How bold?
            </span>
            <div
              className="pace-picker"
              role="group"
              aria-labelledby="pace-label"
            >
              {PACES.map((pace) => (
                <button
                  key={pace.multiplier}
                  type="button"
                  aria-pressed={multiplier === pace.multiplier}
                  className={
                    multiplier === pace.multiplier
                      ? "pace-option selected"
                      : "pace-option"
                  }
                  onClick={() => setMultiplier(pace.multiplier)}
                >
                  {pace.label}
                  <span>{pace.multiplier}×</span>
                </button>
              ))}
            </div>
          </div>
          <div className="trade-summary" aria-live="polite" aria-atomic="true">
            <div className="exposure-line">
              <span>You’re trading</span>
              <strong>{dollars(risk * multiplier)} of BTC</strong>
            </div>
            <p>
              If BTC {side === "long" ? "falls" : "rises"} to{" "}
              <strong>{dollars(autoClose)}</strong>, this trade is estimated to
              auto-close.
            </p>
            <div className="budget-line">
              <span>Your risk budget</span>
              <strong>
                {dollars(risk)} <span>+ fees</span>
              </strong>
            </div>
          </div>
          <p className="preview-note">
            Illustrative BTC price: $100,000 · 4% maintenance margin
          </p>
        </section>
      </main>
      <footer className="landing-footer">
        <div className="integrations">
          <span className="powered-label">Built with</span>
          <span>Mera</span>
          <span className="separator">/</span>
          <span>AUSD</span>
          <span className="separator">/</span>
          <span>Perpl</span>
        </div>
        <span className="monad-note">
          <span className="monad-symbol" aria-hidden="true" /> On Monad.
        </span>
      </footer>
    </div>
  )
}
