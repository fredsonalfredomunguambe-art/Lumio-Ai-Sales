import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    // HubSpot OAuth Provider
    {
      id: "hubspot",
      name: "HubSpot",
      type: "oauth",
      authorization: {
        url: "https://app.hubspot.com/oauth/authorize",
        params: {
          scope:
            "contacts deals companies crm.objects.contacts.read crm.objects.contacts.write",
        },
      },
      token: "https://api.hubapi.com/oauth/v1/token",
      userinfo: "https://api.hubapi.com/oauth/v1/access-tokens",
      clientId: process.env.HUBSPOT_CLIENT_ID,
      clientSecret: process.env.HUBSPOT_CLIENT_SECRET,
      profile(profile) {
        return {
          id: profile.hub_id,
          name: profile.hub_domain,
          email: profile.hub_domain,
          image: null,
        };
      },
    },
    // LinkedIn OAuth Provider
    {
      id: "linkedin",
      name: "LinkedIn",
      type: "oauth",
      authorization: {
        url: "https://www.linkedin.com/oauth/v2/authorization",
        params: {
          scope: "r_liteprofile r_emailaddress w_member_social",
        },
      },
      token: "https://www.linkedin.com/oauth/v2/accessToken",
      userinfo: "https://api.linkedin.com/v2/people/~",
      clientId: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      profile(profile) {
        return {
          id: profile.id,
          name: `${profile.firstName} ${profile.lastName}`,
          email: profile.emailAddress,
          image: profile.profilePicture?.displayImage,
        };
      },
    },
    // Shopify OAuth Provider
    {
      id: "shopify",
      name: "Shopify",
      type: "oauth",
      authorization: {
        url: "https://{shop}.myshopify.com/admin/oauth/authorize",
        params: {
          scope: "read_products,read_orders,read_customers,write_orders",
        },
      },
      token: "https://{shop}.myshopify.com/admin/oauth/access_token",
      userinfo: "https://{shop}.myshopify.com/admin/api/2023-10/shop.json",
      clientId: process.env.SHOPIFY_CLIENT_ID,
      clientSecret: process.env.SHOPIFY_CLIENT_SECRET,
      profile(profile) {
        return {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          image: null,
        };
      },
    },
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.provider = account.provider;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.provider = token.provider;
      return session;
    },
  },
  pages: {
    signIn: "/sign-in",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
