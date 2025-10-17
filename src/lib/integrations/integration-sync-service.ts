import { PrismaClient } from "@/generated/prisma";
import HubSpotClient, {
  HubSpotContact,
  HubSpotDeal,
  HubSpotCompany,
} from "./providers/hubspot/hubspot-client";
import ShopifyClient, {
  ShopifyCustomer,
  ShopifyOrder,
  ShopifyProduct,
  ShopifyAbandonedCheckout,
} from "./providers/shopify/shopify-client";
import SalesforceClient, {
  SalesforceLead,
  SalesforceContact,
  SalesforceOpportunity,
} from "./providers/salesforce/salesforce-client";
import MailchimpClient, {
  MailchimpMember,
  MailchimpCampaign,
} from "./providers/mailchimp/mailchimp-client";
import WhatsAppClient from "./providers/whatsapp/whatsapp-client";
import SlackClient from "./providers/slack/slack-client";
import PipedriveClient, {
  PipedrivePerson,
  PipedriveDeal,
} from "./providers/pipedrive/pipedrive-client";
import { logInfo, logError } from "@/lib/logger";
import { getValidAccessToken } from "./oauth-integrations";

const prisma = new PrismaClient();

export interface SyncOptions {
  contacts?: boolean;
  deals?: boolean;
  companies?: boolean;
  products?: boolean;
  orders?: boolean;
  messages?: boolean;
  campaigns?: boolean;
}

export interface SyncResult {
  success: boolean;
  syncType: string;
  recordsProcessed: number;
  recordsCreated: number;
  recordsUpdated: number;
  recordsFailed: number;
  errors: string[];
  duration: number;
  jobId?: string;
}

export interface SyncProgress {
  jobId: string;
  status: "queued" | "running" | "completed" | "failed" | "cancelled";
  progress: number; // 0-100
  totalRecords?: number;
  processedRecords: number;
  estimatedTimeLeft?: number; // seconds
}

export class IntegrationSyncService {
  /**
   * Start sync job for an integration
   */
  async startSync(
    userId: string,
    integrationId: string,
    syncOptions: SyncOptions,
    mode: "initial" | "incremental" | "manual" = "initial"
  ): Promise<{ jobId: string; estimatedTime: number }> {
    try {
      // Create sync jobs for each selected sync type
      const jobIds: string[] = [];
      let estimatedTime = 0;

      if (syncOptions.contacts) {
        const job = await this.createSyncJob(
          userId,
          integrationId,
          "contacts",
          mode
        );
        jobIds.push(job.id);
        estimatedTime += 60; // 1 minute estimate
      }

      if (syncOptions.deals) {
        const job = await this.createSyncJob(
          userId,
          integrationId,
          "deals",
          mode
        );
        jobIds.push(job.id);
        estimatedTime += 45;
      }

      if (syncOptions.companies) {
        const job = await this.createSyncJob(
          userId,
          integrationId,
          "companies",
          mode
        );
        jobIds.push(job.id);
        estimatedTime += 30;
      }

      if (syncOptions.products) {
        const job = await this.createSyncJob(
          userId,
          integrationId,
          "products",
          mode
        );
        jobIds.push(job.id);
        estimatedTime += 90;
      }

      if (syncOptions.orders) {
        const job = await this.createSyncJob(
          userId,
          integrationId,
          "orders",
          mode
        );
        jobIds.push(job.id);
        estimatedTime += 60;
      }

      if (syncOptions.messages) {
        const job = await this.createSyncJob(
          userId,
          integrationId,
          "messages",
          mode
        );
        jobIds.push(job.id);
        estimatedTime += 120;
      }

      if (syncOptions.campaigns) {
        const job = await this.createSyncJob(
          userId,
          integrationId,
          "campaigns",
          mode
        );
        jobIds.push(job.id);
        estimatedTime += 45;
      }

      // Start processing jobs in background
      this.processSyncJobs(userId, integrationId, jobIds);

      logInfo("Sync jobs created", {
        userId,
        integrationId,
        jobIds,
        estimatedTime,
      });

      return {
        jobId: jobIds[0], // Return first job ID as primary
        estimatedTime,
      };
    } catch (error: any) {
      logError(error, {
        message: "Failed to start sync",
        userId,
        integrationId,
      });
      throw error;
    }
  }

  /**
   * Create a sync job in database
   */
  private async createSyncJob(
    userId: string,
    integrationId: string,
    syncType: string,
    mode: string
  ) {
    return await prisma.integrationSyncJob.create({
      data: {
        userId,
        integrationId,
        syncType,
        mode,
        status: "queued",
        progress: 0,
      },
    });
  }

  /**
   * Process sync jobs in background
   */
  private async processSyncJobs(
    userId: string,
    integrationId: string,
    jobIds: string[]
  ): Promise<void> {
    // Process jobs asynchronously
    for (const jobId of jobIds) {
      this.processSingleJob(userId, integrationId, jobId).catch((error) => {
        logError(error, {
          message: "Sync job failed",
          userId,
          integrationId,
          jobId,
        });
      });
    }
  }

  /**
   * Process a single sync job
   */
  private async processSingleJob(
    userId: string,
    integrationId: string,
    jobId: string
  ): Promise<void> {
    const job = await prisma.integrationSyncJob.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new Error(`Sync job ${jobId} not found`);
    }

    try {
      // Update job status to running
      await prisma.integrationSyncJob.update({
        where: { id: jobId },
        data: {
          status: "running",
          startedAt: new Date(),
          progress: 0,
        },
      });

      // Execute sync based on integration and type
      let result: SyncResult;

      switch (integrationId) {
        case "hubspot":
          result = await this.syncHubSpot(userId, job.syncType);
          break;
        case "shopify":
          result = await this.syncShopify(userId, job.syncType);
          break;
        case "salesforce":
          result = await this.syncSalesforce(userId, job.syncType);
          break;
        case "whatsapp":
          result = await this.syncWhatsApp(userId, job.syncType);
          break;
        case "mailchimp":
          result = await this.syncMailchimp(userId, job.syncType);
          break;
        case "pipedrive":
          result = await this.syncPipedrive(userId, job.syncType);
          break;
        default:
          throw new Error(`Unsupported integration: ${integrationId}`);
      }

      // Update job as completed
      await prisma.integrationSyncJob.update({
        where: { id: jobId },
        data: {
          status: result.success ? "completed" : "failed",
          progress: 100,
          totalRecords: result.recordsProcessed,
          processedRecords: result.recordsProcessed,
          createdRecords: result.recordsCreated,
          updatedRecords: result.recordsUpdated,
          failedRecords: result.recordsFailed,
          errors:
            result.errors.length > 0 ? JSON.stringify(result.errors) : null,
          completedAt: new Date(),
        },
      });

      // Update integration connection last sync time
      await prisma.integrationConnection.updateMany({
        where: {
          userId,
          integrationId,
        },
        data: {
          lastSync: new Date(),
        },
      });

      logInfo("Sync job completed", {
        jobId,
        integrationId,
        syncType: job.syncType,
        result,
      });
    } catch (error: any) {
      // Update job as failed
      await prisma.integrationSyncJob.update({
        where: { id: jobId },
        data: {
          status: "failed",
          errors: JSON.stringify([error.message]),
          completedAt: new Date(),
        },
      });

      logError(error, {
        message: "Sync job failed",
        jobId,
        integrationId,
        syncType: job.syncType,
      });
    }
  }

  // ==================== HUBSPOT SYNC ====================

  /**
   * Sync data from HubSpot
   */
  private async syncHubSpot(
    userId: string,
    syncType: string
  ): Promise<SyncResult> {
    const startTime = Date.now();
    const result: SyncResult = {
      success: true,
      syncType,
      recordsProcessed: 0,
      recordsCreated: 0,
      recordsUpdated: 0,
      recordsFailed: 0,
      errors: [],
      duration: 0,
    };

    try {
      const accessToken = await getValidAccessToken(userId, "hubspot");
      const hubspot = new HubSpotClient({
        provider: "hubspot",
        credentials: { accessToken },
      });

      switch (syncType) {
        case "contacts":
          return await this.syncHubSpotContacts(userId, hubspot);
        case "deals":
          return await this.syncHubSpotDeals(userId, hubspot);
        case "companies":
          return await this.syncHubSpotCompanies(userId, hubspot);
        default:
          throw new Error(`Unsupported HubSpot sync type: ${syncType}`);
      }
    } catch (error: any) {
      result.success = false;
      result.errors.push(error.message);
      result.duration = Date.now() - startTime;
      return result;
    }
  }

  /**
   * Sync HubSpot contacts to Lumio leads
   */
  private async syncHubSpotContacts(
    userId: string,
    hubspot: HubSpotClient
  ): Promise<SyncResult> {
    const startTime = Date.now();
    const result: SyncResult = {
      success: true,
      syncType: "contacts",
      recordsProcessed: 0,
      recordsCreated: 0,
      recordsUpdated: 0,
      recordsFailed: 0,
      errors: [],
      duration: 0,
    };

    try {
      // Get all contacts from HubSpot
      const contacts = await hubspot.getContacts(500);
      result.recordsProcessed = contacts.length;

      // Map and upsert each contact
      for (const contact of contacts) {
        try {
          await this.upsertLeadFromHubSpotContact(userId, contact);
          result.recordsUpdated++;
        } catch (error: any) {
          result.recordsFailed++;
          result.errors.push(
            `Failed to sync contact ${contact.email}: ${error.message}`
          );
        }
      }

      result.duration = Date.now() - startTime;

      logInfo("HubSpot contacts synced", {
        userId,
        processed: result.recordsProcessed,
        updated: result.recordsUpdated,
        failed: result.recordsFailed,
      });

      return result;
    } catch (error: any) {
      result.success = false;
      result.errors.push(error.message);
      result.duration = Date.now() - startTime;
      return result;
    }
  }

  /**
   * Map HubSpot contact to Lumio lead and upsert
   */
  private async upsertLeadFromHubSpotContact(
    userId: string,
    contact: HubSpotContact
  ): Promise<void> {
    await prisma.lead.upsert({
      where: {
        userId_email: {
          userId,
          email: contact.email,
        },
      },
      update: {
        firstName: contact.firstname || "Unknown",
        lastName: contact.lastname || "",
        company: contact.company,
        phone: contact.phone,
        jobTitle: contact.jobtitle,
        source: "hubspot",
        externalId: contact.id,
        lastSyncedAt: new Date(),
        syncMetadata: JSON.stringify({
          lifecyclestage: contact.lifecyclestage,
          originalData: contact,
        }),
        updatedAt: new Date(),
      },
      create: {
        userId,
        email: contact.email,
        firstName: contact.firstname || "Unknown",
        lastName: contact.lastname || "",
        company: contact.company,
        phone: contact.phone,
        jobTitle: contact.jobtitle,
        source: "hubspot",
        externalId: contact.id,
        lastSyncedAt: new Date(),
        syncMetadata: JSON.stringify({
          lifecyclestage: contact.lifecyclestage,
          originalData: contact,
        }),
        status: this.mapHubSpotStageToLeadStatus(contact.lifecyclestage),
        score: 50,
      },
    });
  }

  /**
   * Sync HubSpot deals (to analytics/insights)
   */
  private async syncHubSpotDeals(
    userId: string,
    hubspot: HubSpotClient
  ): Promise<SyncResult> {
    const startTime = Date.now();
    const result: SyncResult = {
      success: true,
      syncType: "deals",
      recordsProcessed: 0,
      recordsCreated: 0,
      recordsUpdated: 0,
      recordsFailed: 0,
      errors: [],
      duration: 0,
    };

    try {
      const deals = await hubspot.getDeals(500);
      result.recordsProcessed = deals.length;

      // Store deals as analytics data
      for (const deal of deals) {
        try {
          await prisma.analytics.create({
            data: {
              userId,
              type: "REVENUE_FORECAST",
              period: "monthly",
              data: JSON.stringify({
                source: "hubspot",
                dealId: deal.id,
                dealname: deal.dealname,
                amount: deal.amount || 0,
                stage: deal.dealstage,
                closedate: deal.closedate,
                pipeline: deal.pipeline,
                syncedAt: new Date().toISOString(),
              }),
            },
          });
          result.recordsCreated++;
        } catch (error: any) {
          result.recordsFailed++;
          result.errors.push(
            `Failed to sync deal ${deal.dealname}: ${error.message}`
          );
        }
      }

      result.duration = Date.now() - startTime;
      return result;
    } catch (error: any) {
      result.success = false;
      result.errors.push(error.message);
      result.duration = Date.now() - startTime;
      return result;
    }
  }

  /**
   * Sync HubSpot companies
   */
  private async syncHubSpotCompanies(
    userId: string,
    hubspot: HubSpotClient
  ): Promise<SyncResult> {
    const startTime = Date.now();
    const result: SyncResult = {
      success: true,
      syncType: "companies",
      recordsProcessed: 0,
      recordsCreated: 0,
      recordsUpdated: 0,
      recordsFailed: 0,
      errors: [],
      duration: 0,
    };

    try {
      const companies = await hubspot.getCompanies(500);
      result.recordsProcessed = companies.length;

      // Store as metadata for now (could create Company model later)
      for (const company of companies) {
        try {
          // Store in analytics for now
          await prisma.analytics.create({
            data: {
              userId,
              type: "SEGMENT_ANALYSIS",
              period: "monthly",
              data: JSON.stringify({
                source: "hubspot",
                type: "company",
                companyId: company.id,
                name: company.name,
                domain: company.domain,
                industry: company.industry,
                syncedAt: new Date().toISOString(),
              }),
            },
          });
          result.recordsCreated++;
        } catch (error: any) {
          result.recordsFailed++;
          result.errors.push(
            `Failed to sync company ${company.name}: ${error.message}`
          );
        }
      }

      result.duration = Date.now() - startTime;
      return result;
    } catch (error: any) {
      result.success = false;
      result.errors.push(error.message);
      result.duration = Date.now() - startTime;
      return result;
    }
  }

  // ==================== SHOPIFY SYNC ====================

  private async syncShopify(
    userId: string,
    syncType: string
  ): Promise<SyncResult> {
    const startTime = Date.now();
    const result: SyncResult = {
      success: true,
      syncType,
      recordsProcessed: 0,
      recordsCreated: 0,
      recordsUpdated: 0,
      recordsFailed: 0,
      errors: [],
      duration: 0,
    };

    try {
      const connection = await prisma.integrationConnection.findUnique({
        where: {
          userId_integrationId: {
            userId,
            integrationId: "shopify",
          },
        },
      });

      if (!connection) {
        throw new Error("Shopify connection not found");
      }

      const credentials = JSON.parse(connection.credentials);
      const shopify = new ShopifyClient({
        provider: "shopify",
        credentials: {
          accessToken: credentials.accessToken,
          shop: credentials.shop,
        },
      });

      switch (syncType) {
        case "customers":
          return await this.syncShopifyCustomers(userId, shopify);
        case "orders":
          return await this.syncShopifyOrders(userId, shopify);
        case "products":
          return await this.syncShopifyProducts(userId, shopify);
        default:
          throw new Error(`Unsupported Shopify sync type: ${syncType}`);
      }
    } catch (error: any) {
      result.success = false;
      result.errors.push(error.message);
      result.duration = Date.now() - startTime;
      return result;
    }
  }

  /**
   * Sync Shopify customers to Lumio leads
   */
  private async syncShopifyCustomers(
    userId: string,
    shopify: ShopifyClient
  ): Promise<SyncResult> {
    const startTime = Date.now();
    const result: SyncResult = {
      success: true,
      syncType: "customers",
      recordsProcessed: 0,
      recordsCreated: 0,
      recordsUpdated: 0,
      recordsFailed: 0,
      errors: [],
      duration: 0,
    };

    try {
      const customers = await shopify.getCustomers(500);
      result.recordsProcessed = customers.length;

      for (const customer of customers) {
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
              externalId: customer.id,
              lastSyncedAt: new Date(),
              syncMetadata: JSON.stringify({
                ordersCount: customer.orders_count,
                totalSpent: customer.total_spent,
                tags: customer.tags,
              }),
              status: customer.orders_count > 0 ? "CONVERTED" : "NEW",
              score: Math.min(50 + customer.orders_count * 10, 100),
            },
            create: {
              userId,
              email: customer.email,
              firstName: customer.first_name || "Shopify",
              lastName: customer.last_name || "Customer",
              phone: customer.phone,
              source: "shopify",
              externalId: customer.id,
              status: customer.orders_count > 0 ? "CONVERTED" : "NEW",
              score: Math.min(50 + customer.orders_count * 10, 100),
              lastSyncedAt: new Date(),
              syncMetadata: JSON.stringify({
                ordersCount: customer.orders_count,
                totalSpent: customer.total_spent,
              }),
            },
          });
          result.recordsUpdated++;
        } catch (error: any) {
          result.recordsFailed++;
          result.errors.push(
            `Failed to sync customer ${customer.email}: ${error.message}`
          );
        }
      }

      result.duration = Date.now() - startTime;
      return result;
    } catch (error: any) {
      result.success = false;
      result.errors.push(error.message);
      result.duration = Date.now() - startTime;
      return result;
    }
  }

  /**
   * Sync Shopify orders to analytics
   */
  private async syncShopifyOrders(
    userId: string,
    shopify: ShopifyClient
  ): Promise<SyncResult> {
    const startTime = Date.now();
    const result: SyncResult = {
      success: true,
      syncType: "orders",
      recordsProcessed: 0,
      recordsCreated: 0,
      recordsUpdated: 0,
      recordsFailed: 0,
      errors: [],
      duration: 0,
    };

    try {
      const orders = await shopify.getOrders(500);
      result.recordsProcessed = orders.length;

      for (const order of orders) {
        try {
          await prisma.analytics.create({
            data: {
              userId,
              type: "REVENUE_FORECAST",
              period: "daily",
              data: JSON.stringify({
                source: "shopify",
                orderId: order.id,
                orderNumber: order.order_number,
                amount: parseFloat(order.total_price),
                currency: order.currency,
                status: order.financial_status,
                createdAt: order.created_at,
                syncedAt: new Date().toISOString(),
              }),
            },
          });
          result.recordsCreated++;
        } catch (error: any) {
          result.recordsFailed++;
          result.errors.push(
            `Failed to sync order ${order.order_number}: ${error.message}`
          );
        }
      }

      result.duration = Date.now() - startTime;
      return result;
    } catch (error: any) {
      result.success = false;
      result.errors.push(error.message);
      result.duration = Date.now() - startTime;
      return result;
    }
  }

  /**
   * Sync Shopify products to analytics
   */
  private async syncShopifyProducts(
    userId: string,
    shopify: ShopifyClient
  ): Promise<SyncResult> {
    const startTime = Date.now();
    const result: SyncResult = {
      success: true,
      syncType: "products",
      recordsProcessed: 0,
      recordsCreated: 0,
      recordsUpdated: 0,
      recordsFailed: 0,
      errors: [],
      duration: 0,
    };

    try {
      const products = await shopify.getProducts(500);
      result.recordsProcessed = products.length;

      for (const product of products) {
        try {
          await prisma.analytics.create({
            data: {
              userId,
              type: "SEGMENT_ANALYSIS",
              period: "daily",
              data: JSON.stringify({
                source: "shopify",
                type: "product",
                productId: product.id,
                title: product.title,
                vendor: product.vendor,
                productType: product.product_type,
                variants: product.variants?.length || 0,
                syncedAt: new Date().toISOString(),
              }),
            },
          });
          result.recordsCreated++;
        } catch (error: any) {
          result.recordsFailed++;
          result.errors.push(
            `Failed to sync product ${product.title}: ${error.message}`
          );
        }
      }

      result.duration = Date.now() - startTime;
      return result;
    } catch (error: any) {
      result.success = false;
      result.errors.push(error.message);
      result.duration = Date.now() - startTime;
      return result;
    }
  }

  // ==================== SALESFORCE SYNC ====================

  private async syncSalesforce(
    userId: string,
    syncType: string
  ): Promise<SyncResult> {
    const startTime = Date.now();
    const result: SyncResult = {
      success: true,
      syncType,
      recordsProcessed: 0,
      recordsCreated: 0,
      recordsUpdated: 0,
      recordsFailed: 0,
      errors: [],
      duration: 0,
    };

    try {
      const accessToken = await getValidAccessToken(userId, "salesforce");
      const connection = await prisma.integrationConnection.findUnique({
        where: {
          userId_integrationId: {
            userId,
            integrationId: "salesforce",
          },
        },
      });

      if (!connection) {
        throw new Error("Salesforce connection not found");
      }

      const credentials = JSON.parse(connection.credentials);
      const salesforce = new SalesforceClient({
        provider: "salesforce",
        credentials: {
          accessToken: credentials.accessToken,
          instanceUrl: credentials.instanceUrl,
        },
      });

      switch (syncType) {
        case "leads":
          return await this.syncSalesforceLeads(userId, salesforce);
        case "contacts":
          return await this.syncSalesforceContacts(userId, salesforce);
        case "deals":
          return await this.syncSalesforceOpportunities(userId, salesforce);
        default:
          throw new Error(`Unsupported Salesforce sync type: ${syncType}`);
      }
    } catch (error: any) {
      result.success = false;
      result.errors.push(error.message);
      result.duration = Date.now() - startTime;
      return result;
    }
  }

  /**
   * Sync Salesforce leads
   */
  private async syncSalesforceLeads(
    userId: string,
    salesforce: SalesforceClient
  ): Promise<SyncResult> {
    const startTime = Date.now();
    const result: SyncResult = {
      success: true,
      syncType: "leads",
      recordsProcessed: 0,
      recordsCreated: 0,
      recordsUpdated: 0,
      recordsFailed: 0,
      errors: [],
      duration: 0,
    };

    try {
      const leads = await salesforce.getLeads(500);
      result.recordsProcessed = leads.length;

      for (const lead of leads) {
        try {
          await prisma.lead.upsert({
            where: {
              userId_email: {
                userId,
                email: lead.Email,
              },
            },
            update: {
              firstName: lead.FirstName || "Salesforce",
              lastName: lead.LastName || "Lead",
              company: lead.Company,
              phone: lead.Phone,
              jobTitle: lead.Title,
              source: "salesforce",
              externalId: lead.Id,
              lastSyncedAt: new Date(),
              syncMetadata: JSON.stringify({
                status: lead.Status,
                leadSource: lead.LeadSource,
                industry: lead.Industry,
              }),
              status: this.mapSalesforceStatusToLeadStatus(lead.Status),
            },
            create: {
              userId,
              email: lead.Email,
              firstName: lead.FirstName || "Salesforce",
              lastName: lead.LastName || "Lead",
              company: lead.Company,
              phone: lead.Phone,
              jobTitle: lead.Title,
              source: "salesforce",
              externalId: lead.Id,
              status: this.mapSalesforceStatusToLeadStatus(lead.Status),
              score: 50,
              lastSyncedAt: new Date(),
              syncMetadata: JSON.stringify({
                status: lead.Status,
                leadSource: lead.LeadSource,
              }),
            },
          });
          result.recordsUpdated++;
        } catch (error: any) {
          result.recordsFailed++;
          result.errors.push(
            `Failed to sync lead ${lead.Email}: ${error.message}`
          );
        }
      }

      result.duration = Date.now() - startTime;
      return result;
    } catch (error: any) {
      result.success = false;
      result.errors.push(error.message);
      result.duration = Date.now() - startTime;
      return result;
    }
  }

  /**
   * Sync Salesforce contacts
   */
  private async syncSalesforceContacts(
    userId: string,
    salesforce: SalesforceClient
  ): Promise<SyncResult> {
    const startTime = Date.now();
    const result: SyncResult = {
      success: true,
      syncType: "contacts",
      recordsProcessed: 0,
      recordsCreated: 0,
      recordsUpdated: 0,
      recordsFailed: 0,
      errors: [],
      duration: 0,
    };

    try {
      const contacts = await salesforce.getContacts(500);
      result.recordsProcessed = contacts.length;

      for (const contact of contacts) {
        try {
          await prisma.lead.upsert({
            where: {
              userId_email: {
                userId,
                email: contact.Email,
              },
            },
            update: {
              firstName: contact.FirstName || "Salesforce",
              lastName: contact.LastName || "Contact",
              phone: contact.Phone,
              jobTitle: contact.Title,
              source: "salesforce",
              externalId: contact.Id,
              lastSyncedAt: new Date(),
              status: "QUALIFIED",
            },
            create: {
              userId,
              email: contact.Email,
              firstName: contact.FirstName || "Salesforce",
              lastName: contact.LastName || "Contact",
              phone: contact.Phone,
              jobTitle: contact.Title,
              source: "salesforce",
              externalId: contact.Id,
              status: "QUALIFIED",
              score: 60,
              lastSyncedAt: new Date(),
            },
          });
          result.recordsUpdated++;
        } catch (error: any) {
          result.recordsFailed++;
          result.errors.push(
            `Failed to sync contact ${contact.Email}: ${error.message}`
          );
        }
      }

      result.duration = Date.now() - startTime;
      return result;
    } catch (error: any) {
      result.success = false;
      result.errors.push(error.message);
      result.duration = Date.now() - startTime;
      return result;
    }
  }

  /**
   * Sync Salesforce opportunities to analytics
   */
  private async syncSalesforceOpportunities(
    userId: string,
    salesforce: SalesforceClient
  ): Promise<SyncResult> {
    const startTime = Date.now();
    const result: SyncResult = {
      success: true,
      syncType: "deals",
      recordsProcessed: 0,
      recordsCreated: 0,
      recordsUpdated: 0,
      recordsFailed: 0,
      errors: [],
      duration: 0,
    };

    try {
      const opportunities = await salesforce.getOpportunities(500);
      result.recordsProcessed = opportunities.length;

      for (const opp of opportunities) {
        try {
          await prisma.analytics.create({
            data: {
              userId,
              type: "REVENUE_FORECAST",
              period: "monthly",
              data: JSON.stringify({
                source: "salesforce",
                opportunityId: opp.Id,
                name: opp.Name,
                amount: opp.Amount,
                stage: opp.StageName,
                probability: opp.Probability,
                closeDate: opp.CloseDate,
                syncedAt: new Date().toISOString(),
              }),
            },
          });
          result.recordsCreated++;
        } catch (error: any) {
          result.recordsFailed++;
          result.errors.push(
            `Failed to sync opportunity ${opp.Name}: ${error.message}`
          );
        }
      }

      result.duration = Date.now() - startTime;
      return result;
    } catch (error: any) {
      result.success = false;
      result.errors.push(error.message);
      result.duration = Date.now() - startTime;
      return result;
    }
  }

  /**
   * Map Salesforce status to Lumio lead status
   */
  private mapSalesforceStatusToLeadStatus(
    status: string
  ): "NEW" | "CONTACTED" | "QUALIFIED" | "UNQUALIFIED" | "CONVERTED" | "LOST" {
    const statusLower = status.toLowerCase();

    if (statusLower.includes("open") || statusLower.includes("not contacted")) {
      return "NEW";
    } else if (
      statusLower.includes("working") ||
      statusLower.includes("contacted")
    ) {
      return "CONTACTED";
    } else if (statusLower.includes("qualified")) {
      return "QUALIFIED";
    } else if (statusLower.includes("unqualified")) {
      return "UNQUALIFIED";
    } else if (statusLower.includes("converted")) {
      return "CONVERTED";
    } else if (statusLower.includes("lost")) {
      return "LOST";
    }

    return "NEW";
  }

  // ==================== WHATSAPP SYNC ====================

  private async syncWhatsApp(
    userId: string,
    syncType: string
  ): Promise<SyncResult> {
    const startTime = Date.now();
    const result: SyncResult = {
      success: true,
      syncType,
      recordsProcessed: 0,
      recordsCreated: 0,
      recordsUpdated: 0,
      recordsFailed: 0,
      errors: [],
      duration: 0,
    };

    // WhatsApp sync is primarily webhook-based (real-time)
    // Manual sync not typically needed
    result.success = true;
    result.duration = Date.now() - startTime;
    return result;
  }

  // ==================== MAILCHIMP SYNC ====================

  private async syncMailchimp(
    userId: string,
    syncType: string
  ): Promise<SyncResult> {
    const startTime = Date.now();
    const result: SyncResult = {
      success: true,
      syncType,
      recordsProcessed: 0,
      recordsCreated: 0,
      recordsUpdated: 0,
      recordsFailed: 0,
      errors: [],
      duration: 0,
    };

    try {
      const connection = await prisma.integrationConnection.findUnique({
        where: {
          userId_integrationId: {
            userId,
            integrationId: "mailchimp",
          },
        },
      });

      if (!connection) {
        throw new Error("Mailchimp connection not found");
      }

      const credentials = JSON.parse(connection.credentials);
      const mailchimp = new MailchimpClient({
        provider: "mailchimp",
        credentials: {
          apiKey: credentials.apiKey || credentials.accessToken,
        },
      });

      switch (syncType) {
        case "campaigns":
          return await this.syncMailchimpCampaigns(userId, mailchimp);
        case "contacts":
          return await this.syncMailchimpContacts(
            userId,
            mailchimp,
            credentials.audienceId
          );
        default:
          throw new Error(`Unsupported Mailchimp sync type: ${syncType}`);
      }
    } catch (error: any) {
      result.success = false;
      result.errors.push(error.message);
      result.duration = Date.now() - startTime;
      return result;
    }
  }

  /**
   * Sync Mailchimp campaigns to analytics
   */
  private async syncMailchimpCampaigns(
    userId: string,
    mailchimp: MailchimpClient
  ): Promise<SyncResult> {
    const startTime = Date.now();
    const result: SyncResult = {
      success: true,
      syncType: "campaigns",
      recordsProcessed: 0,
      recordsCreated: 0,
      recordsUpdated: 0,
      recordsFailed: 0,
      errors: [],
      duration: 0,
    };

    try {
      const campaigns = await mailchimp.getCampaigns(100);
      result.recordsProcessed = campaigns.length;

      for (const campaign of campaigns) {
        try {
          await prisma.analytics.create({
            data: {
              userId,
              type: "CAMPAIGN_PERFORMANCE",
              period: "daily",
              data: JSON.stringify({
                source: "mailchimp",
                campaignId: campaign.id,
                subject: campaign.settings.subject_line,
                sendTime: campaign.send_time,
                emailsSent: campaign.emails_sent,
                opens: campaign.report_summary.opens,
                uniqueOpens: campaign.report_summary.unique_opens,
                openRate: campaign.report_summary.open_rate,
                clicks: campaign.report_summary.clicks,
                clickRate: campaign.report_summary.click_rate,
                syncedAt: new Date().toISOString(),
              }),
            },
          });
          result.recordsCreated++;
        } catch (error: any) {
          result.recordsFailed++;
          result.errors.push(
            `Failed to sync campaign ${campaign.id}: ${error.message}`
          );
        }
      }

      result.duration = Date.now() - startTime;
      return result;
    } catch (error: any) {
      result.success = false;
      result.errors.push(error.message);
      result.duration = Date.now() - startTime;
      return result;
    }
  }

  /**
   * Sync Mailchimp audience members to leads
   */
  private async syncMailchimpContacts(
    userId: string,
    mailchimp: MailchimpClient,
    audienceId: string
  ): Promise<SyncResult> {
    const startTime = Date.now();
    const result: SyncResult = {
      success: true,
      syncType: "contacts",
      recordsProcessed: 0,
      recordsCreated: 0,
      recordsUpdated: 0,
      recordsFailed: 0,
      errors: [],
      duration: 0,
    };

    try {
      const members = await mailchimp.getAudienceMembers(audienceId, 1000);
      result.recordsProcessed = members.length;

      for (const member of members) {
        try {
          if (member.status === "subscribed") {
            await prisma.lead.upsert({
              where: {
                userId_email: {
                  userId,
                  email: member.email_address,
                },
              },
              update: {
                firstName: member.merge_fields.FNAME || "Mailchimp",
                lastName: member.merge_fields.LNAME || "Subscriber",
                source: "mailchimp",
                externalId: member.id,
                lastSyncedAt: new Date(),
                tags: member.tags.map((t) => t.name).join(","),
              },
              create: {
                userId,
                email: member.email_address,
                firstName: member.merge_fields.FNAME || "Mailchimp",
                lastName: member.merge_fields.LNAME || "Subscriber",
                source: "mailchimp",
                externalId: member.id,
                status: "NEW",
                score: 40,
                lastSyncedAt: new Date(),
                tags: member.tags.map((t) => t.name).join(","),
              },
            });
            result.recordsUpdated++;
          }
        } catch (error: any) {
          result.recordsFailed++;
          result.errors.push(
            `Failed to sync member ${member.email_address}: ${error.message}`
          );
        }
      }

      result.duration = Date.now() - startTime;
      return result;
    } catch (error: any) {
      result.success = false;
      result.errors.push(error.message);
      result.duration = Date.now() - startTime;
      return result;
    }
  }

  // ==================== PIPEDRIVE SYNC ====================

  private async syncPipedrive(
    userId: string,
    syncType: string
  ): Promise<SyncResult> {
    const startTime = Date.now();
    const result: SyncResult = {
      success: true,
      syncType,
      recordsProcessed: 0,
      recordsCreated: 0,
      recordsUpdated: 0,
      recordsFailed: 0,
      errors: [],
      duration: 0,
    };

    try {
      const connection = await prisma.integrationConnection.findUnique({
        where: {
          userId_integrationId: {
            userId,
            integrationId: "pipedrive",
          },
        },
      });

      if (!connection) {
        throw new Error("Pipedrive connection not found");
      }

      const credentials = JSON.parse(connection.credentials);
      const pipedrive = new PipedriveClient({
        provider: "pipedrive",
        credentials: {
          apiToken: credentials.apiToken,
          companyDomain: credentials.companyDomain,
        },
      });

      switch (syncType) {
        case "contacts":
          return await this.syncPipedrivePersons(userId, pipedrive);
        case "deals":
          return await this.syncPipedriveDeals(userId, pipedrive);
        default:
          throw new Error(`Unsupported Pipedrive sync type: ${syncType}`);
      }
    } catch (error: any) {
      result.success = false;
      result.errors.push(error.message);
      result.duration = Date.now() - startTime;
      return result;
    }
  }

  /**
   * Sync Pipedrive persons to leads
   */
  private async syncPipedrivePersons(
    userId: string,
    pipedrive: PipedriveClient
  ): Promise<SyncResult> {
    const startTime = Date.now();
    const result: SyncResult = {
      success: true,
      syncType: "contacts",
      recordsProcessed: 0,
      recordsCreated: 0,
      recordsUpdated: 0,
      recordsFailed: 0,
      errors: [],
      duration: 0,
    };

    try {
      const persons = await pipedrive.getPersons(500);
      result.recordsProcessed = persons.length;

      for (const person of persons) {
        try {
          const primaryEmail =
            person.email?.find((e) => e.primary)?.value ||
            person.email?.[0]?.value;
          if (!primaryEmail) continue;

          const primaryPhone =
            person.phone?.find((p) => p.primary)?.value ||
            person.phone?.[0]?.value;

          await prisma.lead.upsert({
            where: {
              userId_email: {
                userId,
                email: primaryEmail,
              },
            },
            update: {
              firstName: person.first_name || "Pipedrive",
              lastName: person.last_name || "Person",
              phone: primaryPhone,
              source: "pipedrive",
              externalId: person.id.toString(),
              lastSyncedAt: new Date(),
            },
            create: {
              userId,
              email: primaryEmail,
              firstName: person.first_name || "Pipedrive",
              lastName: person.last_name || "Person",
              phone: primaryPhone,
              source: "pipedrive",
              externalId: person.id.toString(),
              status: "NEW",
              score: 50,
              lastSyncedAt: new Date(),
            },
          });
          result.recordsUpdated++;
        } catch (error: any) {
          result.recordsFailed++;
          result.errors.push(
            `Failed to sync person ${person.id}: ${error.message}`
          );
        }
      }

      result.duration = Date.now() - startTime;
      return result;
    } catch (error: any) {
      result.success = false;
      result.errors.push(error.message);
      result.duration = Date.now() - startTime;
      return result;
    }
  }

  /**
   * Sync Pipedrive deals to analytics
   */
  private async syncPipedriveDeals(
    userId: string,
    pipedrive: PipedriveClient
  ): Promise<SyncResult> {
    const startTime = Date.now();
    const result: SyncResult = {
      success: true,
      syncType: "deals",
      recordsProcessed: 0,
      recordsCreated: 0,
      recordsUpdated: 0,
      recordsFailed: 0,
      errors: [],
      duration: 0,
    };

    try {
      const deals = await pipedrive.getDeals(500, "all");
      result.recordsProcessed = deals.length;

      for (const deal of deals) {
        try {
          await prisma.analytics.create({
            data: {
              userId,
              type: "REVENUE_FORECAST",
              period: "monthly",
              data: JSON.stringify({
                source: "pipedrive",
                dealId: deal.id,
                title: deal.title,
                value: deal.value,
                currency: deal.currency,
                status: deal.status,
                probability: deal.probability,
                expectedCloseDate: deal.expected_close_date,
                syncedAt: new Date().toISOString(),
              }),
            },
          });
          result.recordsCreated++;
        } catch (error: any) {
          result.recordsFailed++;
          result.errors.push(
            `Failed to sync deal ${deal.id}: ${error.message}`
          );
        }
      }

      result.duration = Date.now() - startTime;
      return result;
    } catch (error: any) {
      result.success = false;
      result.errors.push(error.message);
      result.duration = Date.now() - startTime;
      return result;
    }
  }

  // ==================== HELPER METHODS ====================

  /**
   * Map HubSpot lifecycle stage to Lumio lead status
   */
  private mapHubSpotStageToLeadStatus(
    stage?: string
  ): "NEW" | "CONTACTED" | "QUALIFIED" | "UNQUALIFIED" | "CONVERTED" | "LOST" {
    if (!stage) return "NEW";

    const stageMap: Record<string, any> = {
      subscriber: "NEW",
      lead: "CONTACTED",
      marketingqualifiedlead: "QUALIFIED",
      salesqualifiedlead: "QUALIFIED",
      opportunity: "QUALIFIED",
      customer: "CONVERTED",
      evangelist: "CONVERTED",
      other: "UNQUALIFIED",
    };

    return stageMap[stage.toLowerCase()] || "NEW";
  }

  /**
   * Get sync progress for a job
   */
  async getSyncProgress(jobId: string): Promise<SyncProgress | null> {
    const job = await prisma.integrationSyncJob.findUnique({
      where: { id: jobId },
    });

    if (!job) return null;

    return {
      jobId: job.id,
      status: job.status as any,
      progress: job.progress,
      totalRecords: job.totalRecords || undefined,
      processedRecords: job.processedRecords,
      estimatedTimeLeft: job.estimatedTimeLeft || undefined,
    };
  }

  /**
   * Get all sync jobs for a user and integration
   */
  async getSyncJobs(userId: string, integrationId?: string): Promise<any[]> {
    return await prisma.integrationSyncJob.findMany({
      where: {
        userId,
        ...(integrationId ? { integrationId } : {}),
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });
  }

  /**
   * Cancel a running sync job
   */
  async cancelSync(jobId: string): Promise<boolean> {
    try {
      const job = await prisma.integrationSyncJob.findUnique({
        where: { id: jobId },
      });

      if (!job) return false;

      if (job.status === "running" || job.status === "queued") {
        await prisma.integrationSyncJob.update({
          where: { id: jobId },
          data: {
            status: "cancelled",
            completedAt: new Date(),
          },
        });
        return true;
      }

      return false;
    } catch (error: any) {
      logError(error, { message: "Failed to cancel sync", jobId });
      return false;
    }
  }

  /**
   * Get connected integrations for a user
   */
  async getConnectedIntegrations(userId: string): Promise<string[]> {
    const connections = await prisma.integrationConnection.findMany({
      where: {
        userId,
        status: "connected",
      },
      select: {
        integrationId: true,
      },
    });

    return connections.map((c) => c.integrationId);
  }
}

// Singleton instance
let syncServiceInstance: IntegrationSyncService | null = null;

export function getIntegrationSyncService(): IntegrationSyncService {
  if (!syncServiceInstance) {
    syncServiceInstance = new IntegrationSyncService();
  }
  return syncServiceInstance;
}

export default getIntegrationSyncService;
