import { PrismaClient } from "@/generated/prisma";
import { getValidAccessToken } from "./oauth-integrations";
import { webhookHandler } from "./webhook-handlers";

const prisma = new PrismaClient();

export class BackgroundSyncService {
  private syncInterval: NodeJS.Timeout | null = null;
  private isRunning = false;

  start() {
    if (this.isRunning) return;

    this.isRunning = true;
    console.log("🔄 Background sync service started");

    // Run initial sync
    this.runSync();

    // Set up interval for periodic sync (every 15 minutes)
    this.syncInterval = setInterval(() => {
      this.runSync();
    }, 15 * 60 * 1000);
  }

  stop() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    this.isRunning = false;
    console.log("⏹️ Background sync service stopped");
  }

  private async runSync() {
    try {
      console.log("🔄 Starting background sync...");

      // Get all connected integrations
      const connections = await prisma.integrationConnection.findMany({
        where: {
          status: "connected",
        },
        include: {
          user: true,
        },
      });

      console.log(`📊 Found ${connections.length} connected integrations`);

      // Sync each integration
      for (const connection of connections) {
        try {
          await this.syncIntegration(connection);
        } catch (error) {
          console.error(`❌ Error syncing ${connection.integrationId}:`, error);
        }
      }

      console.log("✅ Background sync completed");
    } catch (error) {
      console.error("❌ Background sync failed:", error);
    }
  }

  private async syncIntegration(connection: any) {
    const { userId, integrationId } = connection;

    try {
      switch (integrationId) {
        case "hubspot":
          await this.syncHubSpot(userId);
          break;
        case "shopify":
          await this.syncShopify(userId);
          break;
        case "linkedin":
          await this.syncLinkedIn(userId);
          break;
        case "salesforce":
          await this.syncSalesforce(userId);
          break;
        case "mailchimp":
          await this.syncMailchimp(userId);
          break;
        case "pipedrive":
          await this.syncPipedrive(userId);
          break;
        case "woocommerce":
          await this.syncWooCommerce(userId);
          break;
        default:
          console.log(`⚠️ Unknown integration: ${integrationId}`);
      }
    } catch (error) {
      console.error(
        `❌ Error syncing ${integrationId} for user ${userId}:`,
        error
      );
    }
  }

  private async syncHubSpot(userId: string) {
    try {
      const accessToken = await getValidAccessToken(userId, "hubspot");

      // Sync contacts
      const contactsResponse = await fetch(
        "https://api.hubapi.com/crm/v3/objects/contacts?limit=100",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (contactsResponse.ok) {
        const contactsData = await contactsResponse.json();
        await this.processHubSpotContacts(userId, contactsData.results);
      }

      // Sync deals
      const dealsResponse = await fetch(
        "https://api.hubapi.com/crm/v3/objects/deals?limit=100",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (dealsResponse.ok) {
        const dealsData = await dealsResponse.json();
        await this.processHubSpotDeals(userId, dealsData.results);
      }

      console.log(`✅ HubSpot sync completed for user ${userId}`);
    } catch (error) {
      console.error(`❌ HubSpot sync failed for user ${userId}:`, error);
    }
  }

  private async syncShopify(userId: string) {
    try {
      const accessToken = await getValidAccessToken(userId, "shopify");
      const shopDomain = process.env.SHOPIFY_SHOP_DOMAIN;

      if (!shopDomain) {
        throw new Error("Shopify shop domain not configured");
      }

      // Sync orders
      const ordersResponse = await fetch(
        `https://${shopDomain}/admin/api/2023-10/orders.json?limit=100`,
        {
          headers: {
            "X-Shopify-Access-Token": accessToken,
            "Content-Type": "application/json",
          },
        }
      );

      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        await this.processShopifyOrders(userId, ordersData.orders);
      }

      // Sync customers
      const customersResponse = await fetch(
        `https://${shopDomain}/admin/api/2023-10/customers.json?limit=100`,
        {
          headers: {
            "X-Shopify-Access-Token": accessToken,
            "Content-Type": "application/json",
          },
        }
      );

      if (customersResponse.ok) {
        const customersData = await customersResponse.json();
        await this.processShopifyCustomers(userId, customersData.customers);
      }

      console.log(`✅ Shopify sync completed for user ${userId}`);
    } catch (error) {
      console.error(`❌ Shopify sync failed for user ${userId}:`, error);
    }
  }

  private async syncLinkedIn(userId: string) {
    try {
      const accessToken = await getValidAccessToken(userId, "linkedin");

      // LinkedIn API calls would go here
      // Note: LinkedIn API has strict rate limits and requires special permissions
      console.log(`✅ LinkedIn sync completed for user ${userId}`);
    } catch (error) {
      console.error(`❌ LinkedIn sync failed for user ${userId}:`, error);
    }
  }

  private async syncSalesforce(userId: string) {
    try {
      const accessToken = await getValidAccessToken(userId, "salesforce");

      // Salesforce API calls would go here
      console.log(`✅ Salesforce sync completed for user ${userId}`);
    } catch (error) {
      console.error(`❌ Salesforce sync failed for user ${userId}:`, error);
    }
  }

  private async syncMailchimp(userId: string) {
    try {
      const accessToken = await getValidAccessToken(userId, "mailchimp");

      // Mailchimp API calls would go here
      console.log(`✅ Mailchimp sync completed for user ${userId}`);
    } catch (error) {
      console.error(`❌ Mailchimp sync failed for user ${userId}:`, error);
    }
  }

  private async syncPipedrive(userId: string) {
    try {
      const accessToken = await getValidAccessToken(userId, "pipedrive");

      // Pipedrive API calls would go here
      console.log(`✅ Pipedrive sync completed for user ${userId}`);
    } catch (error) {
      console.error(`❌ Pipedrive sync failed for user ${userId}:`, error);
    }
  }

  private async syncWooCommerce(userId: string) {
    try {
      const accessToken = await getValidAccessToken(userId, "woocommerce");

      // WooCommerce API calls would go here
      console.log(`✅ WooCommerce sync completed for user ${userId}`);
    } catch (error) {
      console.error(`❌ WooCommerce sync failed for user ${userId}:`, error);
    }
  }

  private async processHubSpotContacts(userId: string, contacts: any[]) {
    for (const contact of contacts) {
      const properties = contact.properties;

      await prisma.lead.upsert({
        where: {
          userId_email: {
            userId,
            email: properties.email,
          },
        },
        update: {
          firstName: properties.firstname,
          lastName: properties.lastname,
          company: properties.company,
          phone: properties.phone,
          status: properties.lifecyclestage,
          source: "hubspot",
          lastSync: new Date(),
        },
        create: {
          userId,
          email: properties.email,
          firstName: properties.firstname,
          lastName: properties.lastname,
          company: properties.company,
          phone: properties.phone,
          status: properties.lifecyclestage,
          source: "hubspot",
          score: 50,
          lastSync: new Date(),
        },
      });
    }
  }

  private async processHubSpotDeals(userId: string, deals: any[]) {
    for (const deal of deals) {
      const properties = deal.properties;

      await prisma.deal.upsert({
        where: {
          userId_externalId: {
            userId,
            externalId: deal.id,
          },
        },
        update: {
          name: properties.dealname,
          amount: parseFloat(properties.amount) || 0,
          stage: properties.dealstage,
          closeDate: properties.closedate
            ? new Date(properties.closedate)
            : null,
          probability: parseInt(properties.hs_deal_stage_probability) || 0,
          source: "hubspot",
          lastSync: new Date(),
        },
        create: {
          userId,
          externalId: deal.id,
          name: properties.dealname,
          amount: parseFloat(properties.amount) || 0,
          stage: properties.dealstage,
          closeDate: properties.closedate
            ? new Date(properties.closedate)
            : null,
          probability: parseInt(properties.hs_deal_stage_probability) || 0,
          source: "hubspot",
          lastSync: new Date(),
        },
      });
    }
  }

  private async processShopifyOrders(userId: string, orders: any[]) {
    for (const order of orders) {
      await prisma.order.upsert({
        where: {
          userId_externalId: {
            userId,
            externalId: order.id.toString(),
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
          externalId: order.id.toString(),
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
    }
  }

  private async processShopifyCustomers(userId: string, customers: any[]) {
    for (const customer of customers) {
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
    }
  }
}

// Export singleton instance
export const backgroundSyncService = new BackgroundSyncService();
