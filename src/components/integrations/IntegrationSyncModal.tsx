import React, { useState, useEffect } from "react";
import { X, Check, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Integration {
  id: string;
  name: string;
  status: "connected" | "error" | "disconnected";
}

interface SyncOption {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  estimatedRecords?: number;
  estimatedTime?: number; // seconds
}

interface IntegrationSyncModalProps {
  integration: Integration;
  isOpen: boolean;
  onClose: () => void;
  onStartSync: (options: Record<string, boolean>) => Promise<void>;
}

const syncOptionsConfig: Record<string, SyncOption[]> = {
  hubspot: [
    {
      id: "contacts",
      label: "Contacts",
      description: "Sync all HubSpot contacts to Leads",
      enabled: true,
      estimatedTime: 60,
    },
    {
      id: "deals",
      label: "Deals",
      description: "Import deals data to Insights",
      enabled: true,
      estimatedTime: 45,
    },
    {
      id: "companies",
      label: "Companies",
      description: "Sync company information",
      enabled: false,
      estimatedTime: 30,
    },
  ],
  shopify: [
    {
      id: "products",
      label: "Products",
      description: "Import all products from your store",
      enabled: true,
      estimatedTime: 90,
    },
    {
      id: "orders",
      label: "Orders",
      description: "Sync order history and revenue data",
      enabled: true,
      estimatedTime: 60,
    },
    {
      id: "customers",
      label: "Customers",
      description: "Import customer data to Leads",
      enabled: false,
      estimatedTime: 75,
    },
  ],
  salesforce: [
    {
      id: "contacts",
      label: "Leads & Contacts",
      description: "Sync all leads and contacts",
      enabled: true,
      estimatedTime: 120,
    },
    {
      id: "deals",
      label: "Opportunities",
      description: "Import opportunities/deals",
      enabled: true,
      estimatedTime: 90,
    },
    {
      id: "companies",
      label: "Accounts",
      description: "Sync account information",
      enabled: false,
      estimatedTime: 60,
    },
  ],
  whatsapp: [
    {
      id: "messages",
      label: "Message History",
      description: "Import conversation history",
      enabled: true,
      estimatedTime: 120,
    },
  ],
  mailchimp: [
    {
      id: "campaigns",
      label: "Email Campaigns",
      description: "Import campaign performance data",
      enabled: true,
      estimatedTime: 45,
    },
    {
      id: "contacts",
      label: "Audience Lists",
      description: "Sync subscriber lists to Leads",
      enabled: false,
      estimatedTime: 90,
    },
  ],
  slack: [
    {
      id: "channels",
      label: "Channels",
      description: "Configure notification channels",
      enabled: true,
      estimatedTime: 10,
    },
  ],
  linkedin: [
    {
      id: "connections",
      label: "Connections",
      description: "Import LinkedIn connections",
      enabled: true,
      estimatedTime: 60,
    },
  ],
  pipedrive: [
    {
      id: "contacts",
      label: "Contacts",
      description: "Sync all contacts to Leads",
      enabled: true,
      estimatedTime: 60,
    },
    {
      id: "deals",
      label: "Deals",
      description: "Import pipeline deals",
      enabled: true,
      estimatedTime: 45,
    },
  ],
};

export default function IntegrationSyncModal({
  integration,
  isOpen,
  onClose,
  onStartSync,
}: IntegrationSyncModalProps) {
  const [syncOptions, setSyncOptions] = useState<SyncOption[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncStatus, setSyncStatus] = useState<
    "idle" | "syncing" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && integration) {
      const options = syncOptionsConfig[integration.id] || [];
      setSyncOptions(options);
      setSyncStatus("idle");
      setSyncProgress(0);
      setErrorMessage(null);
    }
  }, [isOpen, integration]);

  const toggleOption = (optionId: string) => {
    setSyncOptions((prev) =>
      prev.map((opt) =>
        opt.id === optionId ? { ...opt, enabled: !opt.enabled } : opt
      )
    );
  };

  const getTotalEstimatedTime = () => {
    return syncOptions
      .filter((opt) => opt.enabled)
      .reduce((total, opt) => total + (opt.estimatedTime || 0), 0);
  };

  const handleStartSync = async () => {
    try {
      setIsSyncing(true);
      setSyncStatus("syncing");
      setErrorMessage(null);

      // Build options object
      const options: Record<string, boolean> = {};
      syncOptions.forEach((opt) => {
        options[opt.id] = opt.enabled;
      });

      // Start sync
      await onStartSync(options);

      // Simulate progress (in real implementation, this would come from the API)
      const totalTime = getTotalEstimatedTime() * 1000;
      const interval = setInterval(() => {
        setSyncProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setSyncStatus("success");
            setIsSyncing(false);
            setTimeout(() => onClose(), 2000); // Close after 2 seconds
            return 100;
          }
          return prev + 100 / (totalTime / 500); // Update every 500ms
        });
      }, 500);
    } catch (error: any) {
      setSyncStatus("error");
      setErrorMessage(error.message || "Failed to start sync");
      setIsSyncing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !isSyncing && onClose()}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Configure {integration.name} Sync
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Choose what data to sync to your Lumio dashboard
                  </p>
                </div>
                {!isSyncing && (
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Body */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {syncStatus === "idle" && (
                <div className="space-y-4">
                  {/* Sync Options */}
                  <div className="space-y-3">
                    {syncOptions.map((option) => (
                      <motion.div
                        key={option.id}
                        whileHover={{ scale: 1.01 }}
                        className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          option.enabled
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                        onClick={() => toggleOption(option.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-0.5">
                            <div
                              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                                option.enabled
                                  ? "border-blue-600 bg-blue-600"
                                  : "border-gray-300 bg-white"
                              }`}
                            >
                              {option.enabled && (
                                <Check className="w-3.5 h-3.5 text-white" />
                              )}
                            </div>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">
                              {option.label}
                            </h4>
                            <p className="text-sm text-gray-500 mt-0.5">
                              {option.description}
                            </p>
                            {option.estimatedTime && (
                              <p className="text-xs text-gray-400 mt-1">
                                ⏱️ ~{option.estimatedTime}s
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Estimated Time */}
                  {getTotalEstimatedTime() > 0 && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-blue-800">
                        <RefreshCw className="w-4 h-4" />
                        <span>
                          <strong>Estimated sync time:</strong>{" "}
                          {Math.ceil(getTotalEstimatedTime() / 60)} minutes
                        </span>
                      </div>
                      <p className="text-xs text-blue-600 mt-1">
                        Sync happens in the background. You can continue
                        working.
                      </p>
                    </div>
                  )}

                  {/* Info Box */}
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex gap-2">
                      <AlertCircle className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-gray-600">
                        <p className="font-medium mb-1">What happens next?</p>
                        <ul className="space-y-1 text-xs">
                          <li>✓ Data will be synced in the background</li>
                          <li>
                            ✓ You'll see it appear in your dashboard pages
                          </li>
                          <li>✓ Auto-sync every 30 minutes</li>
                          <li>✓ You can filter by source in each page</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {syncStatus === "syncing" && (
                <div className="text-center py-8">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="inline-block"
                  >
                    <Loader2 className="w-12 h-12 text-blue-600" />
                  </motion.div>
                  <h4 className="text-lg font-medium text-gray-900 mt-4">
                    Syncing data...
                  </h4>
                  <p className="text-sm text-gray-500 mt-2">
                    This may take a few moments
                  </p>

                  {/* Progress Bar */}
                  <div className="mt-6 max-w-sm mx-auto">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                      <motion.div
                        className="bg-gradient-to-r from-blue-600 to-blue-700 h-2.5 rounded-full"
                        initial={{ width: "0%" }}
                        animate={{ width: `${syncProgress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {Math.round(syncProgress)}% complete
                    </p>
                  </div>
                </div>
              )}

              {syncStatus === "success" && (
                <div className="text-center py-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", duration: 0.5 }}
                    className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4"
                  >
                    <Check className="w-8 h-8 text-green-600" />
                  </motion.div>
                  <h4 className="text-lg font-medium text-gray-900">
                    Sync completed!
                  </h4>
                  <p className="text-sm text-gray-500 mt-2">
                    Your {integration.name} data is now available in the
                    dashboard
                  </p>
                </div>
              )}

              {syncStatus === "error" && (
                <div className="text-center py-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", duration: 0.5 }}
                    className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4"
                  >
                    <AlertCircle className="w-8 h-8 text-red-600" />
                  </motion.div>
                  <h4 className="text-lg font-medium text-gray-900">
                    Sync failed
                  </h4>
                  <p className="text-sm text-gray-500 mt-2">
                    {errorMessage || "An error occurred during sync"}
                  </p>
                  <button
                    onClick={() => {
                      setSyncStatus("idle");
                      setErrorMessage(null);
                    }}
                    className="mt-4 px-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            {syncStatus === "idle" && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                  disabled={isSyncing}
                >
                  Cancel
                </button>
                <button
                  onClick={handleStartSync}
                  disabled={
                    isSyncing || !syncOptions.some((opt) => opt.enabled)
                  }
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                >
                  {isSyncing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Start Sync
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
