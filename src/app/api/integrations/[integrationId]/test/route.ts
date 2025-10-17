import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { testPremiumIntegrationConnection } from "@/lib/premium-integrations";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: { integrationId: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { integrationId } = params;

    // Get the integration connection from database
    const connection = await prisma.integrationConnection.findUnique({
      where: {
        userId_integrationId: {
          userId,
          integrationId,
        },
      },
    });

    if (!connection || connection.status !== "connected") {
      return NextResponse.json(
        { success: false, error: "Integration not connected" },
        { status: 400 }
      );
    }

    // Test the premium integration connection
    const credentials = JSON.parse(connection.credentials);
    const isValid = await testPremiumIntegrationConnection(
      integrationId,
      credentials
    );

    if (isValid) {
      // Update last sync time
      await prisma.integrationConnection.update({
        where: {
          userId_integrationId: {
            userId,
            integrationId,
          },
        },
        data: {
          lastSync: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: "Integration test successful",
      });
    } else {
      // Mark as error
      await prisma.integrationConnection.update({
        where: {
          userId_integrationId: {
            userId,
            integrationId,
          },
        },
        data: {
          status: "error",
        },
      });

      return NextResponse.json(
        { success: false, error: "Integration test failed" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error testing integration:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
