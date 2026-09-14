import path from "node:path"
import tailwindcss from "@tailwindcss/vite"
import { tanstackRouter } from "@tanstack/router-plugin/vite"
import react from "@vitejs/plugin-react-swc"
import { type Connect, defineConfig, type Plugin } from "vite"

// Same-origin endpoints backing the Error triggers page
// (src/routes/_layout/error-triggers.tsx). This app has no backend of its
// own, and the monitoring widget only captures same-origin requests, so
// these are served straight out of the Vite server instead of pointing at
// an external host like httpstat.us.
//
// Dev only: registered on both the dev server and `vite preview`, never
// bundled into the built app, and absent from the production deploy
// (Netlify serves the static `frontend/dist` output with no server runtime).
function testErrorEndpoints(): Plugin {
  const handler: Connect.NextHandleFunction = (req, res, next) => {
    if (!req.url) return next()
    const { pathname } = new URL(req.url, "http://localhost")

    if (pathname.startsWith("/api/test/forbidden/")) {
      res.statusCode = 403
      res.setHeader("Content-Type", "application/json")
      res.end(JSON.stringify({ error: "Access denied by policy" }))
      return
    }

    if (pathname.startsWith("/api/test/notfound/")) {
      res.statusCode = 404
      res.setHeader("Content-Type", "application/json")
      res.end(JSON.stringify({ error: "Not Found" }))
      return
    }

    if (pathname.startsWith("/api/test/servererror/")) {
      res.statusCode = 500
      res.setHeader("Content-Type", "application/json")
      res.end(
        JSON.stringify({
          error: "Internal Server Error",
          detail:
            "Traceback (most recent call last):\n  File \"order_service.py\", line 42, in calculate\n    total = sum(item.price for item in order.items)\nAttributeError: 'NoneType' object has no attribute 'items'",
        }),
      )
      return
    }

    next()
  }

  return {
    name: "test-error-endpoints",
    configureServer(server) {
      server.middlewares.use(handler)
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler)
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
    testErrorEndpoints(),
  ],
})
