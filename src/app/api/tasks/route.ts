import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// Função auxiliar para sincronizar usuário
async function syncUserIfNeeded(userId: string) {
  try {
    console.log("🔄 Syncing user in tasks API...");
    const user = await currentUser();
    if (!user) {
      console.error("❌ No current user found");
      return null;
    }

    let localUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!localUser) {
      console.log("🆕 Creating new user in tasks API...");
      localUser = await prisma.user.create({
        data: {
          clerkId: userId,
          email: user.emailAddresses[0]?.emailAddress || "",
          firstName: user.firstName || null,
          lastName: user.lastName || null,
          imageUrl: user.imageUrl || null,
        },
      });
      console.log("✅ New user created in tasks API");
    } else {
      console.log("✅ User already exists in tasks API");
    }

    return localUser;
  } catch (error) {
    console.error("❌ Error syncing user in tasks API:", error);
    return null;
  }
}

// GET /api/tasks - Listar tarefas do usuário
export async function GET() {
  try {
    console.log("🔄 GET /api/tasks - Starting...");

    const { userId } = await auth();

    if (!userId) {
      console.error("❌ Unauthorized: No userId found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("✅ Auth successful, userId:", userId);

    // Sincronizar usuário se necessário
    const user = await syncUserIfNeeded(userId);
    if (!user) {
      console.error("❌ Failed to sync user");
      return NextResponse.json(
        { error: "Failed to sync user" },
        { status: 500 }
      );
    }

    console.log("✅ User synced, searching for tasks...");

    // Buscar tarefas do usuário ordenadas por ordem
    const tasks = await prisma.task.findMany({
      where: { userId: user.id },
      orderBy: [{ status: "asc" }, { order: "asc" }],
    });

    console.log("✅ Found", tasks.length, "tasks for user");
    return NextResponse.json(tasks);
  } catch (error) {
    console.error("❌ Error fetching tasks:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// POST /api/tasks - Criar nova tarefa
export async function POST(request: NextRequest) {
  try {
    console.log("🔄 POST /api/tasks - Starting...");

    const { userId } = await auth();

    if (!userId) {
      console.error("❌ Unauthorized: No userId found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("✅ Auth successful, userId:", userId);

    const body = await request.json();
    const { title, description, priority, status } = body;

    console.log("📝 Task data:", { title, description, priority, status });

    if (!title) {
      console.error("❌ Title is required");
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // Sincronizar usuário se necessário
    const user = await syncUserIfNeeded(userId);
    if (!user) {
      console.error("❌ Failed to sync user");
      return NextResponse.json(
        { error: "Failed to sync user" },
        { status: 500 }
      );
    }

    console.log("✅ User synced, calculating order...");

    // Calcular a próxima ordem para o status
    const lastTask = await prisma.task.findFirst({
      where: {
        userId: user.id,
        status: status || "TODO",
      },
      orderBy: { order: "desc" },
    });

    const nextOrder = (lastTask?.order || 0) + 1;
    console.log("📊 Next order:", nextOrder);

    // Criar nova tarefa
    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority: priority || "MEDIUM",
        status: status || "TODO",
        order: nextOrder,
        userId: user.id,
      },
    });

    console.log("✅ Task created successfully:", task.id);
    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("❌ Error creating task:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
