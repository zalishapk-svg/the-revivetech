import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(req: VercelRequest, res: VercelResponse) {
  const host = req.headers.host || "therevivetech.pk";
  const protocol = (req.headers["x-forwarded-proto"] as string) || "https";
  const baseUrl = `${protocol}://${host}`;

  const robotsTxt = `# The Revive Tech Robots TXT
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /account/

Sitemap: ${baseUrl}/sitemap.xml
`;

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  return res.status(200).send(robotsTxt);
}
