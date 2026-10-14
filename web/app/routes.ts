import { type RouteConfig, index, route } from "@react-router/dev/routes"

export default [
  index("routes/home.tsx"),
  route("videos/:slug", "routes/video.tsx"),
  route("dashboard", "routes/dashboard.tsx"),
  route("api/aurora/deposit", "routes/api.aurora.deposit.ts"),
  route("api/aurora/status", "routes/api.aurora.status.ts"),
  route("api/nansen/smart-money", "routes/api.nansen.smart-money.ts"),
] satisfies RouteConfig
