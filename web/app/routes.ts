import { type RouteConfig, index, route } from "@react-router/dev/routes"

export default [
  index("routes/home.tsx"),
  route("videos/:slug", "routes/video.tsx"),
] satisfies RouteConfig
