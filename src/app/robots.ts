import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "facebookexternalhit",
        disallow: "",
      },
      {
        userAgent: "Facebot",
        disallow: "",
      },
      {
        userAgent: "facebookcatalog",
        disallow: "",
      },
      {
        userAgent: "*",
        disallow: "",
      },
    ],
    sitemap: "https://burithaiteam.com/sitemap.xml",
    host: "burithaiteam.com",
  };
}
