// Stable video links for the hackathon submission: /videos/<slug> → YouTube (or wherever).
// Paste the /videos/... URL in the form now; fill in `url` when the video is uploaded and redeploy.
export const VIDEOS: Record<string, { title: string; url: string }> = {
  bot_demo: { title: "Pocket Bot — max-loss automation on Perpl", url: "" },
  app_demo: {
    title: "Pocket — trade in dollars, never lose more than you chose",
    url: "",
  },
}
