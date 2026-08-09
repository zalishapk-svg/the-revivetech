import type { VercelRequest, VercelResponse } from "@vercel/node";
import { checkFirebaseAdminHealth } from "../_lib/shopify-server";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const health = await checkFirebaseAdminHealth();
    return res.status(200).json({
      status: health.connected ? "ok" : "unconfigured",
      firebase: {
        connected: health.connected,
        projectId: health.projectId || null,
        firestore: health.firestore,
      },
      error: health.error || null,
    });
  } catch (err: any) {
    return res.status(200).json({
      status: "error",
      firebase: {
        connected: false,
        firestore: false,
      },
      error: err?.message || "Unexpected error checking Firebase health",
    });
  }
}

