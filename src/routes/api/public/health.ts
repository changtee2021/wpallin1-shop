import { createFileRoute } from "@tanstack/react-router";

import { getHealth } from "@/services/health.service";

export const Route = createFileRoute("/api/public/health")({
  server: {
    handlers: {
      GET: async () => {
        const payload = getHealth();
        return Response.json(payload, {
          headers: { "cache-control": "no-store" },
        });
      },
    },
  },
});
