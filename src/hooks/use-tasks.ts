import { useState, useEffect, useCallback } from "react";
import { useUser, useAuth } from "@clerk/nextjs";

export interface KanbanTask {
  id: string;
  title: string;
  description?: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface CreateTaskData {
  title: string;
  description?: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "TODO" | "IN_PROGRESS" | "DONE";
}

interface UpdateTaskData {
  title?: string;
  description?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH";
  status?: "TODO" | "IN_PROGRESS" | "DONE";
  order?: number;
}

export function useTasks() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const [tasks, setTasks] = useState<KanbanTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Função auxiliar para fazer requisições com retry e autenticação
  const fetchWithRetry = useCallback(
    async (url: string, options: RequestInit, retries = 2) => {
      // Obter token de autenticação do Clerk
      const token = await getToken();

      const authOptions = {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${token}`,
        },
      };

      for (let i = 0; i < retries; i++) {
        try {
          const response = await fetch(url, authOptions);

          // Se a resposta for bem-sucedida, retornar imediatamente
          if (response.ok) {
            return response;
          }

          // Se não for erro de servidor (5xx), não tentar novamente
          if (response.status < 500) {
            return response;
          }

          // Aguardar antes de tentar novamente (exponential backoff mais suave)
          if (i < retries - 1) {
            await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
          }
        } catch (error) {
          // Se for erro de rede, tentar novamente
          if (i === retries - 1) {
            console.error(`Network error after ${retries} retries:`, error);
            throw error;
          }
          await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
        }
      }

      // Se chegou aqui, todas as tentativas falharam, fazer uma última tentativa
      try {
        const response = await fetch(url, authOptions);
        return response;
      } catch (error) {
        console.error("Final attempt failed:", error);
        throw error;
      }
    },
    [getToken]
  );

  // Sincronizar usuário com banco local
  const syncUser = useCallback(async () => {
    if (!user) return false;

    try {
      setError(null);
      console.log("🔄 Syncing user...");

      const response = await fetchWithRetry("/api/users/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("❌ Sync failed:", errorData);
        throw new Error(errorData.error || "Failed to sync user");
      }

      console.log("✅ User synced successfully");
      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to sync user";
      setError(errorMessage);
      console.error("❌ Error syncing user:", error);
      return false;
    }
  }, [user, fetchWithRetry]);

  // Buscar tarefas do usuário
  const fetchTasks = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      console.log("🔄 Fetching tasks...");
      const response = await fetchWithRetry("/api/tasks", {});

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("❌ Fetch failed:", errorData);
        throw new Error(errorData.error || "Failed to fetch tasks");
      }

      const data = await response.json();
      console.log("✅ Tasks fetched successfully:", data.length, "tasks");
      setTasks(data);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch tasks";
      setError(errorMessage);
      console.error("❌ Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  }, [user, fetchWithRetry]);

  // Criar nova tarefa
  const createTask = useCallback(
    async (taskData: CreateTaskData): Promise<KanbanTask | null> => {
      if (!user) return null;

      try {
        setError(null);
        const response = await fetchWithRetry("/api/tasks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(taskData),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to create task");
        }

        const newTask = await response.json();
        setTasks((prev) => [...prev, newTask]);
        return newTask;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to create task";
        setError(errorMessage);
        console.error("Error creating task:", error);
        return null;
      }
    },
    [user, fetchWithRetry]
  );

  // Atualizar tarefa
  const updateTask = useCallback(
    async (
      taskId: string,
      taskData: UpdateTaskData
    ): Promise<KanbanTask | null> => {
      if (!user) return null;

      try {
        setError(null);
        const response = await fetchWithRetry(`/api/tasks/${taskId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(taskData),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to update task");
        }

        const updatedTask = await response.json();
        setTasks((prev) =>
          prev.map((task) => (task.id === taskId ? updatedTask : task))
        );
        return updatedTask;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to update task";
        setError(errorMessage);
        console.error("Error updating task:", error);
        return null;
      }
    },
    [user, fetchWithRetry]
  );

  // Deletar tarefa
  const deleteTask = useCallback(
    async (taskId: string): Promise<boolean> => {
      if (!user) return false;

      try {
        setError(null);
        const response = await fetchWithRetry(`/api/tasks/${taskId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to delete task");
        }

        setTasks((prev) => prev.filter((task) => task.id !== taskId));
        return true;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to delete task";
        setError(errorMessage);
        console.error("Error deleting task:", error);
        return false;
      }
    },
    [user, fetchWithRetry]
  );

  // Mover tarefa entre colunas
  const moveTask = useCallback(
    async (
      taskId: string,
      newStatus: "TODO" | "IN_PROGRESS" | "DONE"
    ): Promise<boolean> => {
      if (!user) return false;

      try {
        // Calcular nova ordem para o status de destino
        const tasksInNewStatus = tasks.filter(
          (task) => task.status === newStatus
        );
        const newOrder = tasksInNewStatus.length + 1;

        const success = await updateTask(taskId, {
          status: newStatus,
          order: newOrder,
        });

        return success !== null;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to move task";
        setError(errorMessage);
        console.error("Error moving task:", error);
        return false;
      }
    },
    [user, tasks, updateTask]
  );

  // Efeito para sincronizar usuário e buscar tarefas
  useEffect(() => {
    if (isLoaded && user) {
      console.log("🚀 Initializing user data...");
      const initializeData = async () => {
        try {
          const syncSuccess = await syncUser();
          if (syncSuccess) {
            await fetchTasks();
          } else {
            console.error("❌ Failed to sync user, cannot fetch tasks");
          }
        } catch (error) {
          console.error("❌ Error during initialization:", error);
        }
      };

      initializeData();
    }
  }, [isLoaded, user, syncUser, fetchTasks]);

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    refetch: fetchTasks,
    syncUser,
  };
}
