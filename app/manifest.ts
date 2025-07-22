import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Plantiii - Collect all the Plants!",
    short_name: "Plantiii",
    description: "Scan and collect information about your plants",
    start_url: "/",
    display: "standalone",
    background_color: "#f0fdf4",
    theme_color: "#14b8a6",
    icons: [
      {
        src: "/api/favicon",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/api/favicon",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/api/favicon",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  }
}
