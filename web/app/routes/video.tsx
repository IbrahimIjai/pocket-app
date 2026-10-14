import { data, redirect } from "react-router"
import type { Route } from "./+types/video"
import { VIDEOS } from "~/lib/videos"

export function loader({ params }: Route.LoaderArgs) {
  const video = VIDEOS[params.slug]
  if (!video) throw data("Video not found", { status: 404 })
  // 302, not 301: browsers cache permanent redirects, and the target may change.
  if (video.url) throw redirect(video.url, 302)
  return {
    title: video.title,
    description: video.description,
    tags: video.tags,
  }
}

export function meta({ loaderData }: Route.MetaArgs) {
  return [{ title: loaderData ? `${loaderData.title} · Pocket` : "Pocket" }]
}

export default function Video({ loaderData }: Route.ComponentProps) {
  const { title, description, tags } = loaderData
  return (
    <main className="min-h-svh bg-[#0F1115] px-4 py-12 text-[#F5F3EC]">
      <div className="mx-auto max-w-2xl space-y-6">
        <a className="text-sm text-[#2FE39A] underline" href="/">
          ← Pocket
        </a>
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="text-[#9AA0AA]">
          The video is being uploaded — check back in a few minutes.
        </p>
        <section className="space-y-2">
          <h2 className="text-sm font-semibold tracking-wide text-[#9AA0AA] uppercase">
            Description
          </h2>
          <pre className="rounded-xl border border-[#2A2D35] bg-[#171A21] p-4 text-sm leading-6 whitespace-pre-wrap">
            {description}
          </pre>
        </section>
        <section className="space-y-2">
          <h2 className="text-sm font-semibold tracking-wide text-[#9AA0AA] uppercase">
            Tags
          </h2>
          <p className="rounded-xl border border-[#2A2D35] bg-[#171A21] p-4 text-sm leading-6">
            {tags.join(", ")}
          </p>
        </section>
      </div>
    </main>
  )
}
