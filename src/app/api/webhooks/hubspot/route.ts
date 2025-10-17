import { NextRequest, NextResponse } from "next/server";
import { webhookHandler } from "@/lib/webhook-handlers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventType, objectId, subscriptionId } = body;

    // Verify webhook signature (implement proper verification)
    const signature = request.headers.get("x-hubspot-signature");
    if (!signature) {
      return NextResponse.json(
        { success: false, error: "Missing signature" },
        { status: 401 }
      );
    }

    // For now, we'll extract userId from the subscriptionId or use a default
    // In production, you should map subscriptionId to userId
    const userId = "default-user-id"; // Replace with actual user mapping

    const event = {
      eventType,
      objectId,
      userId,
      integrationId: "hubspot",
      data: body,
      timestamp: new Date(),
    };

    // Handle the webhook event
    await webhookHandler.handleHubSpotWebhook(event);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error handling HubSpot webhook:", error);
    return NextResponse.json(
      { success: false, error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

// HubSpot webhook verification
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const challenge = searchParams.get("hub.challenge");

  if (challenge) {
    return new NextResponse(challenge);
  }

  return NextResponse.json({ success: true });
}
