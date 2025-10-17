import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// POST /api/users/sync - Sincronizar usuário do Clerk com banco local
export async function POST() {
  try {
    console.log("🔄 Starting user sync...");

    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      console.error("❌ Unauthorized: No userId or user found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("✅ Auth successful, userId:", userId);
    console.log("📧 User email:", user.emailAddresses[0]?.emailAddress);

    // Verificar se o usuário já existe no banco local
    let localUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (localUser) {
      console.log("🔄 User exists, updating if needed...");
      // Atualizar informações do usuário se necessário
      if (localUser.email !== user.emailAddresses[0]?.emailAddress) {
        localUser = await prisma.user.update({
          where: { id: localUser.id },
          data: {
            email: user.emailAddresses[0]?.emailAddress || "",
            firstName: user.firstName || null,
            lastName: user.lastName || null,
            imageUrl: user.imageUrl || null,
          },
        });
        console.log("✅ User updated successfully");
      } else {
        console.log("✅ User already up to date");
      }
      return NextResponse.json(localUser);
    } else {
      console.log("🆕 Creating new user...");
      // Criar novo usuário com informações do Clerk
      localUser = await prisma.user.create({
        data: {
          clerkId: userId,
          email: user.emailAddresses[0]?.emailAddress || "",
          firstName: user.firstName || null,
          lastName: user.lastName || null,
          imageUrl: user.imageUrl || null,
        },
      });
      console.log("✅ New user created successfully");
    }

    return NextResponse.json(localUser);
  } catch (error) {
    console.error("❌ Error syncing user:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
