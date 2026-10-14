import type { Route } from "./+types/api.nansen.smart-money"
import { smartMoney } from "~/lib/nansen.server"

export async function loader({ request }: Route.LoaderArgs) {
  try {
    const data = await smartMoney(
      new URL(request.url).searchParams.get("symbol")
    )
    return Response.json(data, {
      headers: {
        "cache-control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    })
  } catch (e) {
    if (e instanceof Response) return e
    return Response.json({ error: "Couldn’t reach Nansen." }, { status: 502 })
  }
}
