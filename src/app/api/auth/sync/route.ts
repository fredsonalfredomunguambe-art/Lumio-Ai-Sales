import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error("Please add CLERK_WEBHOOK_SECRET to .env.local");
  }

  // Get the headers
  const headerPayload = req.headers;
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: any;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occured", {
      status: 400,
    });
  }

  // Handle the webhook
  const eventType = evt.type;

  if (eventType === "user.created" || eventType === "user.updated") {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;

    try {
      await db.user.upsert({
        where: { clerkId: id },
        update: {
          email: email_addresses[0]?.email_address,
          firstName: first_name,
          lastName: last_name,
          imageUrl: image_url,
        },
        create: {
          clerkId: id,
          email: email_addresses[0]?.email_address,
          firstName: first_name,
          lastName: last_name,
          imageUrl: image_url,
        },
      });
    } catch (err) {
      console.error("Error syncing user:", err);
      return new Response("Error syncing user", { status: 500 });
    }
  }

  return new Response("", { status: 200 });
}
