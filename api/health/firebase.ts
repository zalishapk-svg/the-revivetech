import type { VercelRequest, VercelResponse } from "@vercel/node";
import { checkFirebaseAdminHealth } from "../_lib/shopify-server";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const health = await checkFirebaseAdminHealth();
  if (health.connected) {
    return res.status(200).json({
      status: "ok",
      firebase: {
        connected: true,
        projectId: health.projectId,
        firestore: true,
      },
    });
  } else {
    return res.status(500).json({
      status: "error",
      firebase: {
        connected: false,
        firestore: false,
      },
      error: health.error || "Firebase Admin SDK initialization failed",
    });
  }
}
