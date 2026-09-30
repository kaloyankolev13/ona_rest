import { createHmac } from "node:crypto";
import { connectDB } from "./mongodb";
import { SubmissionError } from "./form-security";
import { getRemoteIp } from "./turnstile";
import { validateFields } from "./form-validation";
let indexReady: Promise<string> | undefined;
export async function claimSubmission(request: Request, form: "contact" | "booking", fields: ReturnType<typeof validateFields>) {
  const db = (await connectDB()).connection.db;
  if (!db) throw new Error("Database unavailable");
  const collection = db.collection<{ _id: string; expiresAt: Date; count?: number }>("form_abuse");
  indexReady ??= collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }).catch(error => { indexReady = undefined; throw error; });
  await indexReady;
  const hash = (value: string) => createHmac("sha256", process.env.FORM_SECURITY_HASH_KEY || process.env.TURNSTILE_SECRET_KEY!).update(value).digest("hex");
  const ip = getRemoteIp(request.headers);
  const source = ip ? hash(ip) : "unknown";
  const now = Date.now();
  const bucket = Math.floor(now / 600000);
  const rate = await collection.findOneAndUpdate({ _id: "rate:" + form + ":" + source + ":" + bucket }, { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date((bucket + 2) * 600000) } }, { upsert: true, returnDocument: "after" });
  if ((rate?.count || 0) > (ip ? (form === "contact" ? 5 : 8) : 100)) throw new SubmissionError(429, "Too many requests");
  const id = "duplicate:" + form + ":" + source + ":" + hash(JSON.stringify(fields));
  try {
    await collection.findOneAndUpdate({ _id: id, expiresAt: { $lte: new Date(now) } }, { $set: { expiresAt: new Date(now + 120000) } }, { upsert: true });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === 11000) throw new SubmissionError(409, "Unable to submit form");
    throw error;
  }
  return async () => { await collection.deleteOne({ _id: id }); };
}
