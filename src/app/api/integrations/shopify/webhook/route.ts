import { NextRequest, NextResponse } from "next/server";
import { logInfo, logError } from "@/lib/logger";
import { PrismaClient } from "@/generated/prisma";
import crypto from "crypto";

const prisma = new PrismaClient();

/**
 * Verify Shopify webhook HMAC signature
 */
function verifyShopifyWebhook(
  hmac: string,
  body: string,
  secret: string
): boolean {
  const hash = crypto
    .createHmac("sha256", secret)
    .update(body, "utf8")
    .digest("base64");

  return hash === hmac;
}

/**
 * POST /api/integrations/shopify/webhook
 * Handle Shopify webhooks
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const hmac = request.headers.get("x-shopify-hmac-sha256");
    const topic = request.headers.get("x-shopify-topic");
    const shop = request.headers.get("x-shopify-shop-domain");

    if (!hmac || !topic || !shop) {
      return NextResponse.json(
        { success: false, error: "Missing required headers" },
        { status: 400 }
      );
    }

    const body = await request.text();

    // Verify webhook signature
    const secret =
      process.env.SHOPIFY_WEBHOOK_SECRET ||
      process.env.SHOPIFY_CLIENT_SECRET ||
      "";
    if (!verifyShopifyWebhook(hmac, body, secret)) {
      logError(new Error("Invalid Shopify webhook signature"), {
        topic,
        shop,
      });
      return NextResponse.json(
        { success: false, error: "Invalid signature" },
        { status: 401 }
      );
    }

    const payload = JSON.parse(body);

    logInfo("Shopify webhook received", {
      topic,
      shop,
      id: payload.id,
    });

    // Find user by shop domain
    const connection = await prisma.integrationConnection.findFirst({
      where: {
        integrationId: "shopify",
        status: "connected",
        credentials: {
          contains: shop,
        },
      },
    });

    if (!connection) {
      logError(new Error("No user found for shop"), { shop });
      return NextResponse.json({ success: true }); // Return 200 to avoid retry
    }

    // Handle different webhook topics
    switch (topic) {
      case "orders/create":
      case "orders/updated":
        await handleOrderWebhook(connection.userId, payload, topic);
        break;

      case "customers/create":
      case "customers/updated":
        await handleCustomerWebhook(connection.userId, payload, topic);
        break;

      case "products/create":
      case "products/updated":
        await handleProductWebhook(connection.userId, payload, topic);
        break;

      case "checkouts/create":
      case "checkouts/update":
        await handleCheckoutWebhook(connection.userId, payload, topic);
        break;

      default:
        logInfo("Unhandled Shopify webhook topic", { topic });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    logError(error, {
      message: "Shopify webhook processing failed",
      path: request.url,
    });

    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * Handle order webhooks
 */
async function handleOrderWebhook(
  userId: string,
  order: any,
  topic: string
): Promise<void> {
  try {
    // Store order as analytics data
    await prisma.analytics.create({
      data: {
        userId,
        type: "REVENUE_FORECAST",
        period: "daily",
        data: JSON.stringify({
          source: "shopify",
          event: topic,
          orderId: order.id,
          orderNumber: order.order_number,
          amount: parseFloat(order.total_price),
          currency: order.currency,
          financialStatus: order.financial_status,
          fulfillmentStatus: order.fulfillment_status,
          customerEmail: order.customer?.email,
          lineItems: order.line_items?.length || 0,
          createdAt: order.created_at,
          webhookReceivedAt: new Date().toISOString(),
        }),
      },
    });

    // If customer exists, update lead
    if (order.customer && order.customer.email) {
      await prisma.lead.upsert({
        where: {
          userId_email: {
            userId,
            email: order.customer.email,
          },
        },
        update: {
          company: order.customer.default_address?.company,
          phone: order.customer.phone,
          source: "shopify",
          externalId: order.customer.id.toString(),
          lastSyncedAt: new Date(),
          syncMetadata: JSON.stringify({
            ordersCount: order.customer.orders_count,
            totalSpent: order.customer.total_spent,
            lastOrder: order.order_number,
          }),
          status: "CONVERTED",
        },
        create: {
          userId,
          email: order.customer.email,
          firstName: order.customer.first_name || "Shopify",
          lastName: order.customer.last_name || "Customer",
          company: order.customer.default_address?.company,
          phone: order.customer.phone,
          source: "shopify",
          externalId: order.customer.id.toString(),
          lastSyncedAt: new Date(),
          syncMetadata: JSON.stringify({
            ordersCount: order.customer.orders_count,
            totalSpent: order.customer.total_spent,
          }),
          status: "CONVERTED",
          score: 80,
        },
      });
    }

    logInfo("Shopify order webhook processed", {
      userId,
      orderId: order.id,
      amount: order.total_price,
    });
  } catch (error: any) {
    logError(error, {
      message: "Failed to process order webhook",
      userId,
      orderId: order.id,
    });
    throw error;
  }
}

/**
 * Handle customer webhooks
 */
async function handleCustomerWebhook(
  userId: string,
  customer: any,
  topic: string
): Promise<void> {
  try {
    await prisma.lead.upsert({
      where: {
        userId_email: {
          userId,
          email: customer.email,
        },
      },
      update: {
        firstName: customer.first_name || "Shopify",
        lastName: customer.last_name || "Customer",
        phone: customer.phone,
        source: "shopify",
        externalId: customer.id.toString(),
        lastSyncedAt: new Date(),
        syncMetadata: JSON.stringify({
          ordersCount: customer.orders_count,
          totalSpent: customer.total_spent,
          tags: customer.tags,
        }),
      },
      create: {
        userId,
        email: customer.email,
        firstName: customer.first_name || "Shopify",
        lastName: customer.last_name || "Customer",
        phone: customer.phone,
        source: "shopify",
        externalId: customer.id.toString(),
        lastSyncedAt: new Date(),
        syncMetadata: JSON.stringify({
          ordersCount: customer.orders_count,
          totalSpent: customer.total_spent,
        }),
        status: customer.orders_count > 0 ? "CONVERTED" : "NEW",
        score: Math.min(50 + customer.orders_count * 10, 100),
      },
    });

    logInfo("Shopify customer webhook processed", {
      userId,
      customerId: customer.id,
      email: customer.email,
    });
  } catch (error: any) {
    logError(error, {
      message: "Failed to process customer webhook",
      userId,
      customerId: customer.id,
    });
    throw error;
  }
}

/**
 * Handle product webhooks
 */
async function handleProductWebhook(
  userId: string,
  product: any,
  topic: string
): Promise<void> {
  try {
    // Store product updates in analytics
    await prisma.analytics.create({
      data: {
        userId,
        type: "SEGMENT_ANALYSIS",
        period: "daily",
        data: JSON.stringify({
          source: "shopify",
          event: topic,
          productId: product.id,
          title: product.title,
          vendor: product.vendor,
          productType: product.product_type,
          tags: product.tags,
          variants: product.variants?.length || 0,
          status: product.status,
          webhookReceivedAt: new Date().toISOString(),
        }),
      },
    });

    logInfo("Shopify product webhook processed", {
      userId,
      productId: product.id,
      title: product.title,
    });
  } catch (error: any) {
    logError(error, {
      message: "Failed to process product webhook",
      userId,
      productId: product.id,
    });
  }
}

/**
 * Handle abandoned checkout webhooks
 */
async function handleCheckoutWebhook(
  userId: string,
  checkout: any,
  topic: string
): Promise<void> {
  try {
    // Create lead for abandoned checkout if has email
    if (checkout.email && checkout.completed_at === null) {
      const customer = checkout.customer || {};

      await prisma.lead.upsert({
        where: {
          userId_email: {
            userId,
            email: checkout.email,
          },
        },
        update: {
          syncMetadata: JSON.stringify({
            abandonedCheckout: {
              checkoutId: checkout.id,
              cartToken: checkout.cart_token,
              abandonedAt: checkout.updated_at,
              totalPrice: checkout.total_price,
              lineItems: checkout.line_items,
            },
          }),
          lastSyncedAt: new Date(),
        },
        create: {
          userId,
          email: checkout.email,
          firstName:
            customer.first_name ||
            checkout.billing_address?.first_name ||
            "Abandoned",
          lastName:
            customer.last_name || checkout.billing_address?.last_name || "Cart",
          phone: customer.phone || checkout.billing_address?.phone,
          source: "shopify",
          externalId: checkout.id.toString(),
          status: "NEW",
          score: 60, // Abandoned carts are warm leads
          syncMetadata: JSON.stringify({
            abandonedCheckout: {
              checkoutId: checkout.id,
              totalPrice: checkout.total_price,
              lineItems: checkout.line_items,
            },
          }),
          lastSyncedAt: new Date(),
        },
      });

      logInfo("Shopify abandoned checkout webhook processed", {
        userId,
        checkoutId: checkout.id,
        email: checkout.email,
      });
    }
  } catch (error: any) {
    logError(error, {
      message: "Failed to process checkout webhook",
      userId,
      checkoutId: checkout.id,
    });
  }
}
