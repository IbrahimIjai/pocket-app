import { data, redirect } from "react-router"
import type { Route } from "./+types/video"
import { VIDEOS } from "~/lib/videos"

export function loader({ params }: Route.LoaderArgs) {
  const video = VIDEOS[params.slug]
  if (!video) throw data("Video not found", { status: 404 })
  // 302, not 301: browsers cache permanent redirects, and the target may change.
  if (video.url) throw redirect(video.url, 302)
  return { title: video.title }
}

export function meta({ loaderData }: Route.MetaArgs) {
  return [{ title: loaderData ? `${loaderData.title} · Pocket` : "Pocket" }]
}

export default function Video({ loaderData }: Route.ComponentProps) {
  return (
    <main className="flex min-h-svh items-center justify-center bg-[#0F1115] px-4 text-center text-[#F5F3EC]">
      <div className="max-w-md space-y-3">
        <h1 className="text-2xl font-semibold">{loaderData.title}</h1>
        <p className="text-[#9AA0AA]">
          The video is being uploaded — check back in a few minutes.
        </p>
        <a className="inline-block text-[#2FE39A] underline" href="/">
          ← Pocket
        </a>
      </div>
    </main>
  )
}
