import type { Route } from "./+types/dashboard"

export function meta(_: Route.MetaArgs) {
  return [{ title: "Pocket Risk: Perpl dashboard" }]
}

// Placeholder for the Perpl Risk Tool bounty dashboard (pocket_drafts/bounties_impl.md §4).
export default function Dashboard() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-[#0F1115] px-4 text-center text-[#F5F3EC]">
      <div className="max-w-md space-y-3">
        <h1 className="text-2xl font-semibold">Pocket Risk</h1>
        <p className="text-[#9AA0AA]">
          A live Perpl dashboard (protocol markets plus wallet positions and
          max-loss sizing) is being deployed here. The same risk engine runs in
          the Pocket mobile app today.
        </p>
        <a className="inline-block text-[#2FE39A] underline" href="/">
          ← Pocket
        </a>
      </div>
    </main>
  )
}
