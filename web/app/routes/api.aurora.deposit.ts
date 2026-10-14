import type { Route } from "./+types/api.aurora.deposit"
import { createDeposit, ORIGINS } from "~/lib/aurora.server"

// GET: supported sources. POST { recipient, origin, amount }: one-time deposit address.
export function loader(_: Route.LoaderArgs) {
  return Response.json({
    origins: Object.entries(ORIGINS).map(([id, o]) => ({ id, label: o.label })),
  })
}

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST")
    return Response.json({ error: "POST only" }, { status: 405 })
  try {
    return Response.json(await createDeposit(await request.json()))
  } catch (e) {
    if (e instanceof Response) return e
    return Response.json(
      { error: "Couldn’t reach Aurora. Try again." },
      { status: 502 }
    )
  }
}
