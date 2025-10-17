import { auth } from "@clerk/nextjs/server";
import { db } from "./db";

export async function getCurrentUser() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  // Get or create user in our database
  let user = await db.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) {
    // Create user if doesn't exist
    user = await db.user.create({
      data: {
        clerkId: userId,
        email: null, // Will be updated from Clerk webhook
        firstName: null,
        lastName: null,
        imageUrl: null,
      },
    });
  }

  return user;
}

export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  return user;
}
