import { useState, useEffect } from "react";

interface AutomationTrigger {
  type: string;
  conditions: Record<string, unknown>;
}

interface AutomationAction {
  type: string;
  config: Record<string, unknown>;
}

interface Automation {
  id: string;
  name: string;
  description?: string;
  trigger: AutomationTrigger;
  actions: AutomationAction[];
  conditions?: Record<string, unknown>;
  status: "ACTIVE" | "PAUSED" | "INACTIVE" | "ERROR";
  lastRun?: string;
  nextRun?: string;
  totalRuns: number;
  successRate: number;
  createdAt: string;
  updatedAt: string;
}

export function useAutomations() {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAutomations = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/automations");
      if (response.ok) {
        const data = await response.json();
        setAutomations(data.automations || []);
      }
    } catch (error) {
      console.error("Error fetching automations:", error);
    } finally {
      setLoading(false);
    }
  };

  const createAutomation = async (automationData: {
    name: string;
    description?: string;
    trigger: AutomationTrigger;
    actions: AutomationAction[];
    conditions?: Record<string, unknown>;
  }) => {
    try {
      const response = await fetch("/api/automations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(automationData),
      });

      if (response.ok) {
        const data = await response.json();
        setAutomations((prev) => [data.automation, ...prev]);
        return data.automation;
      } else {
        throw new Error("Failed to create automation");
      }
    } catch (error) {
      console.error("Error creating automation:", error);
      throw error;
    }
  };

  const updateAutomation = async (id: string, updates: Partial<Automation>) => {
    try {
      const response = await fetch(`/api/automations/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const data = await response.json();
        setAutomations((prev) =>
          prev.map((automation) =>
            automation.id === id
              ? { ...automation, ...data.automation }
              : automation
          )
        );
        return data.automation;
      } else {
        throw new Error("Failed to update automation");
      }
    } catch (error) {
      console.error("Error updating automation:", error);
      throw error;
    }
  };

  const deleteAutomation = async (id: string) => {
    try {
      const response = await fetch(`/api/automations/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setAutomations((prev) =>
          prev.filter((automation) => automation.id !== id)
        );
      } else {
        throw new Error("Failed to delete automation");
      }
    } catch (error) {
      console.error("Error deleting automation:", error);
      throw error;
    }
  };

  const executeAutomation = async (automationId: string, leadId?: string) => {
    try {
      const response = await fetch("/api/automations/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ automationId, leadId }),
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        throw new Error("Failed to execute automation");
      }
    } catch (error) {
      console.error("Error executing automation:", error);
      throw error;
    }
  };

  const toggleAutomationStatus = async (id: string) => {
    const automation = automations.find((a) => a.id === id);
    if (!automation) return;

    const newStatus = automation.status === "ACTIVE" ? "PAUSED" : "ACTIVE";
    await updateAutomation(id, { status: newStatus });
  };

  useEffect(() => {
    fetchAutomations();
  }, []);

  return {
    automations,
    loading,
    fetchAutomations,
    createAutomation,
    updateAutomation,
    deleteAutomation,
    executeAutomation,
    toggleAutomationStatus,
  };
}
