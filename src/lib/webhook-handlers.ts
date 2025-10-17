import { PrismaClient } from "@/generated/prisma";
import { getValidAccessToken } from "./oauth-integrations";

const prisma = new PrismaClient();

export interface WebhookEvent {
  eventType: string;
  objectId: string;
  userId: string;
  integrationId: string;
  data: any;
  timestamp: Date;
}

export class WebhookHandler {
  async handleHubSpotWebhook(event: WebhookEvent): Promise<void> {
    const { eventType, objectId, userId, data } = event;

    try {
      const accessToken = await getValidAccessToken(userId, "hubspot");

      switch (eventType) {
        case "contact.creation":
          await this.syncHubSpotContact(objectId, accessToken, userId);
          break;
        case "contact.propertyChange":
          await this.updateHubSpotContact(objectId, data, accessToken, userId);
          break;
        case "deal.creation":
          await this.syncHubSpotDeal(objectId, accessToken, userId);
          break;
        case "deal.propertyChange":
          await this.updateHubSpotDeal(objectId, data, accessToken, userId);
          break;
        default:
          console.log(`Unhandled HubSpot event: ${eventType}`);
      }
    } catch (error) {
      console.error(`Error handling HubSpot webhook: ${error}`);
      throw error;
    }
  }

  async handleShopifyWebhook(event: WebhookEvent): Promise<void> {
    const { eventType, objectId, userId, data } = event;

    try {
      const accessToken = await getValidAccessToken(userId, "shopify");

      switch (eventType) {
        case "orders/create":
          await this.syncShopifyOrder(objectId, accessToken, userId);
          break;
        case "customers/create":
          await this.syncShopifyCustomer(objectId, accessToken, userId);
          break;
        case "products/create":
          await this.syncShopifyProduct(objectId, accessToken, userId);
          break;
        default:
          console.log(`Unhandled Shopify event: ${eventType}`);
      }
    } catch (error) {
      console.error(`Error handling Shopify webhook: ${error}`);
      throw error;
    }
  }

  private async syncHubSpotContact(
    contactId: string,
    accessToken: string,
    userId: string
  ): Promise<void> {
    try {
      const response = await fetch(
        `https://api.hubapi.com/crm/v3/objects/contacts/${contactId}?properties=email,firstname,lastname,company,phone,lifecyclestage`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch HubSpot contact: ${response.statusText}`
        );
      }

      const contactData = await response.json();
      const contact = contactData.properties;

      // Save or update contact in Lumio database
      await prisma.lead.upsert({
        where: {
          userId_email: {
            userId,
            email: contact.email,
          },
        },
        update: {
          firstName: contact.firstname,
          lastName: contact.lastname,
          company: contact.company,
          phone: contact.phone,
          status: contact.lifecyclestage,
          source: "hubspot",
          lastSync: new Date(),
        },
        create: {
          userId,
          email: contact.email,
          firstName: contact.firstname,
          lastName: contact.lastname,
          company: contact.company,
          phone: contact.phone,
          status: contact.lifecyclestage,
          source: "hubspot",
          score: 50,
          lastSync: new Date(),
        },
      });

      console.log(`Synced HubSpot contact: ${contact.email}`);
    } catch (error) {
      console.error(`Error syncing HubSpot contact ${contactId}:`, error);
      throw error;
    }
  }

  private async syncHubSpotDeal(
    dealId: string,
    accessToken: string,
    userId: string
  ): Promise<void> {
    try {
      const response = await fetch(
        `https://api.hubapi.com/crm/v3/objects/deals/${dealId}?properties=dealname,amount,dealstage,closedate,hs_deal_stage_probability`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch HubSpot deal: ${response.statusText}`);
      }

      const dealData = await response.json();
      const deal = dealData.properties;

      // Save or update deal in Lumio database
      await prisma.deal.upsert({
        where: {
          userId_externalId: {
            userId,
            externalId: dealId,
          },
        },
        update: {
          name: deal.dealname,
          amount: parseFloat(deal.amount) || 0,
          stage: deal.dealstage,
          closeDate: deal.closedate ? new Date(deal.closedate) : null,
          probability: parseInt(deal.hs_deal_stage_probability) || 0,
          source: "hubspot",
          lastSync: new Date(),
        },
        create: {
          userId,
          externalId: dealId,
          name: deal.dealname,
          amount: parseFloat(deal.amount) || 0,
          stage: deal.dealstage,
          closeDate: deal.closedate ? new Date(deal.closedate) : null,
          probability: parseInt(deal.hs_deal_stage_probability) || 0,
          source: "hubspot",
          lastSync: new Date(),
        },
      });

      console.log(`Synced HubSpot deal: ${deal.dealname}`);
    } catch (error) {
      console.error(`Error syncing HubSpot deal ${dealId}:`, error);
      throw error;
    }
  }

  private async syncShopifyOrder(
    orderId: string,
    accessToken: string,
    userId: string
  ): Promise<void> {
    try {
      const response = await fetch(
        `https://${process.env.SHOPIFY_SHOP_DOMAIN}/admin/api/2023-10/orders/${orderId}.json`,
        {
          headers: {
            "X-Shopify-Access-Token": accessToken,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch Shopify order: ${response.statusText}`
        );
      }

      const orderData = await response.json();
      const order = orderData.order;

      // Save or update order in Lumio database
      await prisma.order.upsert({
        where: {
          userId_externalId: {
            userId,
            externalId: orderId,
          },
        },
        update: {
          orderNumber: order.order_number,
          totalAmount: parseFloat(order.total_price),
          currency: order.currency,
          status: order.financial_status,
          customerEmail: order.customer?.email,
          customerName: `${order.customer?.first_name} ${order.customer?.last_name}`,
          source: "shopify",
          lastSync: new Date(),
        },
        create: {
          userId,
          externalId: orderId,
          orderNumber: order.order_number,
          totalAmount: parseFloat(order.total_price),
          currency: order.currency,
          status: order.financial_status,
          customerEmail: order.customer?.email,
          customerName: `${order.customer?.first_name} ${order.customer?.last_name}`,
          source: "shopify",
          lastSync: new Date(),
        },
      });

      console.log(`Synced Shopify order: ${order.order_number}`);
    } catch (error) {
      console.error(`Error syncing Shopify order ${orderId}:`, error);
      throw error;
    }
  }

  private async syncShopifyCustomer(
    customerId: string,
    accessToken: string,
    userId: string
  ): Promise<void> {
    try {
      const response = await fetch(
        `https://${process.env.SHOPIFY_SHOP_DOMAIN}/admin/api/2023-10/customers/${customerId}.json`,
        {
          headers: {
            "X-Shopify-Access-Token": accessToken,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch Shopify customer: ${response.statusText}`
        );
      }

      const customerData = await response.json();
      const customer = customerData.customer;

      // Save or update customer in Lumio database
      await prisma.lead.upsert({
        where: {
          userId_email: {
            userId,
            email: customer.email,
          },
        },
        update: {
          firstName: customer.first_name,
          lastName: customer.last_name,
          phone: customer.phone,
          company: customer.default_address?.company,
          status: customer.state,
          source: "shopify",
          lastSync: new Date(),
        },
        create: {
          userId,
          email: customer.email,
          firstName: customer.first_name,
          lastName: customer.last_name,
          phone: customer.phone,
          company: customer.default_address?.company,
          status: customer.state,
          source: "shopify",
          score: 50,
          lastSync: new Date(),
        },
      });

      console.log(`Synced Shopify customer: ${customer.email}`);
    } catch (error) {
      console.error(`Error syncing Shopify customer ${customerId}:`, error);
      throw error;
    }
  }

  private async syncShopifyProduct(
    productId: string,
    accessToken: string,
    userId: string
  ): Promise<void> {
    try {
      const response = await fetch(
        `https://${process.env.SHOPIFY_SHOP_DOMAIN}/admin/api/2023-10/products/${productId}.json`,
        {
          headers: {
            "X-Shopify-Access-Token": accessToken,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch Shopify product: ${response.statusText}`
        );
      }

      const productData = await response.json();
      const product = productData.product;

      // Save or update product in Lumio database
      await prisma.product.upsert({
        where: {
          userId_externalId: {
            userId,
            externalId: productId,
          },
        },
        update: {
          name: product.title,
          description: product.body_html,
          price: parseFloat(product.variants[0]?.price) || 0,
          sku: product.variants[0]?.sku,
          status: product.status,
          source: "shopify",
          lastSync: new Date(),
        },
        create: {
          userId,
          externalId: productId,
          name: product.title,
          description: product.body_html,
          price: parseFloat(product.variants[0]?.price) || 0,
          sku: product.variants[0]?.sku,
          status: product.status,
          source: "shopify",
          lastSync: new Date(),
        },
      });

      console.log(`Synced Shopify product: ${product.title}`);
    } catch (error) {
      console.error(`Error syncing Shopify product ${productId}:`, error);
      throw error;
    }
  }

  private async updateHubSpotContact(
    contactId: string,
    data: any,
    accessToken: string,
    userId: string
  ): Promise<void> {
    // Implementation for updating HubSpot contact
    console.log(`Updating HubSpot contact ${contactId} with data:`, data);
  }

  private async updateHubSpotDeal(
    dealId: string,
    data: any,
    accessToken: string,
    userId: string
  ): Promise<void> {
    // Implementation for updating HubSpot deal
    console.log(`Updating HubSpot deal ${dealId} with data:`, data);
  }
}

export const webhookHandler = new WebhookHandler();
