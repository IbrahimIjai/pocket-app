import type { Route } from "./+types/api.aurora.status"
import { depositStatus } from "~/lib/aurora.server"

export async function loader({ request }: Route.LoaderArgs) {
  try {
    return Response.json(
      await depositStatus(
        new URL(request.url).searchParams.get("depositAddress")
      )
    )
  } catch (e) {
    if (e instanceof Response) return e
    return Response.json({ error: "Couldn’t reach Aurora." }, { status: 502 })
  }
}
