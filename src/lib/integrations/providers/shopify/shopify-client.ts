import {
  BaseIntegration,
  IntegrationConfig,
  IntegrationError,
} from "../../core/base-integration";
import { logInfo, logError } from "@/lib/logger";

export interface ShopifyProduct {
  id: string;
  title: string;
  body_html: string;
  vendor: string;
  product_type: string;
  created_at: string;
  updated_at: string;
  published_at: string;
  status: string;
  tags: string;
  variants: ShopifyVariant[];
  images: ShopifyImage[];
}

export interface ShopifyVariant {
  id: string;
  product_id: string;
  title: string;
  price: string;
  sku: string;
  inventory_quantity: number;
}

export interface ShopifyImage {
  id: string;
  product_id: string;
  src: string;
  alt: string;
}

export interface ShopifyOrder {
  id: string;
  order_number: string;
  email: string;
  created_at: string;
  updated_at: string;
  total_price: string;
  subtotal_price: string;
  total_tax: string;
  currency: string;
  financial_status: string;
  fulfillment_status: string;
  customer: ShopifyCustomer;
  line_items: ShopifyLineItem[];
}

export interface ShopifyLineItem {
  id: string;
  product_id: string;
  variant_id: string;
  title: string;
  quantity: number;
  price: string;
}

export interface ShopifyCustomer {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  orders_count: number;
  total_spent: string;
  created_at: string;
  updated_at: string;
  tags: string;
}

export interface ShopifyAbandonedCheckout {
  id: string;
  token: string;
  cart_token: string;
  email: string;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  abandoned_checkout_url: string;
  line_items: ShopifyLineItem[];
  customer: ShopifyCustomer;
  total_price: string;
}

export default class ShopifyClient extends BaseIntegration {
  private shop: string;
  private apiVersion = "2024-01";

  constructor(config: IntegrationConfig) {
    super(config);

    // Extract shop from credentials or access token
    const credentials = config.credentials as any;
    this.shop =
      credentials.shop || this.extractShopFromToken(credentials.accessToken);
  }

  private extractShopFromToken(token: string): string {
    // Shop is typically provided separately
    throw new Error("Shop domain required in credentials");
  }

  private getBaseUrl(): string {
    return `https://${this.shop}/admin/api/${this.apiVersion}`;
  }

  /**
   * Get all products from Shopify store
   */
  async getProducts(limit = 250): Promise<ShopifyProduct[]> {
    return this.executeWithRetry(async () => {
      const cacheKey = `shopify:products:${this.shop}:${limit}`;
      const cached = await this.cache.get<ShopifyProduct[]>(cacheKey);

      if (cached) {
        return cached;
      }

      const products: ShopifyProduct[] = [];
      let pageInfo: string | null = null;

      do {
        await this.rateLimiter.acquire();

        const url = pageInfo
          ? `${this.getBaseUrl()}/products.json?limit=${limit}&page_info=${pageInfo}`
          : `${this.getBaseUrl()}/products.json?limit=${limit}`;

        const response = await fetch(url, {
          headers: {
            "X-Shopify-Access-Token": (this.config.credentials as any)
              .accessToken,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new IntegrationError(
            `Shopify API error: ${response.statusText}`,
            response.status,
            "shopify"
          );
        }

        const data = await response.json();
        products.push(...data.products);

        // Check for pagination
        const linkHeader = response.headers.get("Link");
        pageInfo = this.extractNextPageInfo(linkHeader);
      } while (pageInfo && products.length < limit);

      await this.cache.set(cacheKey, products, 3600); // Cache 1 hour

      logInfo("Shopify products fetched", {
        shop: this.shop,
        count: products.length,
      });

      return products;
    });
  }

  /**
   * Get orders from Shopify store
   */
  async getOrders(limit = 250, status = "any"): Promise<ShopifyOrder[]> {
    return this.executeWithRetry(async () => {
      const orders: ShopifyOrder[] = [];
      let pageInfo: string | null = null;

      do {
        await this.rateLimiter.acquire();

        const url = pageInfo
          ? `${this.getBaseUrl()}/orders.json?limit=${limit}&status=${status}&page_info=${pageInfo}`
          : `${this.getBaseUrl()}/orders.json?limit=${limit}&status=${status}`;

        const response = await fetch(url, {
          headers: {
            "X-Shopify-Access-Token": (this.config.credentials as any)
              .accessToken,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new IntegrationError(
            `Shopify API error: ${response.statusText}`,
            response.status,
            "shopify"
          );
        }

        const data = await response.json();
        orders.push(...data.orders);

        const linkHeader = response.headers.get("Link");
        pageInfo = this.extractNextPageInfo(linkHeader);
      } while (pageInfo && orders.length < limit);

      logInfo("Shopify orders fetched", {
        shop: this.shop,
        count: orders.length,
        status,
      });

      return orders;
    });
  }

  /**
   * Get customers from Shopify store
   */
  async getCustomers(limit = 250): Promise<ShopifyCustomer[]> {
    return this.executeWithRetry(async () => {
      const customers: ShopifyCustomer[] = [];
      let pageInfo: string | null = null;

      do {
        await this.rateLimiter.acquire();

        const url = pageInfo
          ? `${this.getBaseUrl()}/customers.json?limit=${limit}&page_info=${pageInfo}`
          : `${this.getBaseUrl()}/customers.json?limit=${limit}`;

        const response = await fetch(url, {
          headers: {
            "X-Shopify-Access-Token": (this.config.credentials as any)
              .accessToken,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new IntegrationError(
            `Shopify API error: ${response.statusText}`,
            response.status,
            "shopify"
          );
        }

        const data = await response.json();
        customers.push(...data.customers);

        const linkHeader = response.headers.get("Link");
        pageInfo = this.extractNextPageInfo(linkHeader);
      } while (pageInfo && customers.length < limit);

      logInfo("Shopify customers fetched", {
        shop: this.shop,
        count: customers.length,
      });

      return customers;
    });
  }

  /**
   * Get abandoned checkouts
   */
  async getAbandonedCheckouts(
    limit = 250
  ): Promise<ShopifyAbandonedCheckout[]> {
    return this.executeWithRetry(async () => {
      const checkouts: ShopifyAbandonedCheckout[] = [];
      let pageInfo: string | null = null;

      do {
        await this.rateLimiter.acquire();

        const url = pageInfo
          ? `${this.getBaseUrl()}/checkouts.json?limit=${limit}&status=open&page_info=${pageInfo}`
          : `${this.getBaseUrl()}/checkouts.json?limit=${limit}&status=open`;

        const response = await fetch(url, {
          headers: {
            "X-Shopify-Access-Token": (this.config.credentials as any)
              .accessToken,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new IntegrationError(
            `Shopify API error: ${response.statusText}`,
            response.status,
            "shopify"
          );
        }

        const data = await response.json();
        checkouts.push(...data.checkouts);

        const linkHeader = response.headers.get("Link");
        pageInfo = this.extractNextPageInfo(linkHeader);
      } while (pageInfo && checkouts.length < limit);

      logInfo("Shopify abandoned checkouts fetched", {
        shop: this.shop,
        count: checkouts.length,
      });

      return checkouts;
    });
  }

  /**
   * Create a webhook subscription
   */
  async createWebhook(topic: string, address: string): Promise<void> {
    await this.rateLimiter.acquire();

    const response = await fetch(`${this.getBaseUrl()}/webhooks.json`, {
      method: "POST",
      headers: {
        "X-Shopify-Access-Token": (this.config.credentials as any).accessToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        webhook: {
          topic,
          address,
          format: "json",
        },
      }),
    });

    if (!response.ok) {
      throw new IntegrationError(
        `Failed to create webhook: ${response.statusText}`,
        response.status,
        "shopify"
      );
    }

    logInfo("Shopify webhook created", { topic, address });
  }

  /**
   * Get all webhook subscriptions
   */
  async getWebhooks(): Promise<any[]> {
    await this.rateLimiter.acquire();

    const response = await fetch(`${this.getBaseUrl()}/webhooks.json`, {
      headers: {
        "X-Shopify-Access-Token": (this.config.credentials as any).accessToken,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new IntegrationError(
        `Failed to fetch webhooks: ${response.statusText}`,
        response.status,
        "shopify"
      );
    }

    const data = await response.json();
    return data.webhooks;
  }

  /**
   * Delete a webhook subscription
   */
  async deleteWebhook(webhookId: string): Promise<void> {
    await this.rateLimiter.acquire();

    const response = await fetch(
      `${this.getBaseUrl()}/webhooks/${webhookId}.json`,
      {
        method: "DELETE",
        headers: {
          "X-Shopify-Access-Token": (this.config.credentials as any)
            .accessToken,
        },
      }
    );

    if (!response.ok) {
      throw new IntegrationError(
        `Failed to delete webhook: ${response.statusText}`,
        response.status,
        "shopify"
      );
    }

    logInfo("Shopify webhook deleted", { webhookId });
  }

  /**
   * Extract next page info from Link header
   */
  private extractNextPageInfo(linkHeader: string | null): string | null {
    if (!linkHeader) return null;

    const nextLink = linkHeader
      .split(",")
      .find((link) => link.includes('rel="next"'));
    if (!nextLink) return null;

    const match = nextLink.match(/page_info=([^&>]+)/);
    return match ? match[1] : null;
  }

  /**
   * Get shop information
   */
  async getShopInfo(): Promise<any> {
    await this.rateLimiter.acquire();

    const response = await fetch(`${this.getBaseUrl()}/shop.json`, {
      headers: {
        "X-Shopify-Access-Token": (this.config.credentials as any).accessToken,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new IntegrationError(
        `Failed to fetch shop info: ${response.statusText}`,
        response.status,
        "shopify"
      );
    }

    const data = await response.json();
    return data.shop;
  }

  /**
   * Test connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.getShopInfo();
      return true;
    } catch (error) {
      logError(error as Error, { message: "Shopify connection test failed" });
      return false;
    }
  }
}
