"use client";

import React, { useState, useEffect } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home,
  Users,
  Mail,
  BarChart3,
  Calendar,
  Settings,
  Search,
  Bell,
  Menu,
  X,
  LogOut,
  ChevronRight,
  Lightbulb,
  Grid3x3,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { QueryProvider } from "@/providers/QueryProvider";
import ProtectedRoute from "@/components/ProtectedRoute";
import MarvinDock from "@/components/MarvinDock";
import { NotificationProvider } from "@/components/NotificationSystem";
import { SmartNotificationProvider } from "@/components/SmartNotificationSystem";
import { ToastProvider } from "@/components/ui/Toast";
import {
  prefetchDashboardRoutes,
  prefetchAPIData,
} from "@/lib/performance/prefetch";
import * as Tooltip from "@radix-ui/react-tooltip";
import { motion, AnimatePresence } from "framer-motion";
import { useSmartNotifications } from "@/components/SmartNotificationSystem";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const pathname = usePathname();
  const { user } = useUser();
  const { signOut } = useClerk();

  // Prefetch routes and data on mount for instant navigation
  useEffect(() => {
    prefetchDashboardRoutes();
    prefetchAPIData([
      "/api/analytics/kpis",
      "/api/leads?limit=50",
      "/api/campaigns",
      "/api/analytics",
    ]);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut({ redirectUrl: "/" });
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const navigation = [
    { name: "Home", href: "/dashboard", icon: Home },
    { name: "Leads", href: "/dashboard/leads", icon: Users },
    { name: "Campaigns", href: "/dashboard/campaigns", icon: Mail },
    { name: "Insights", href: "/dashboard/insights", icon: BarChart3 },
    { name: "Calendar", href: "/dashboard/calendar", icon: Calendar },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  // Header Notification Bell Component
  const HeaderNotificationBell = () => {
    const { notifications, getUnreadCount, markAsRead, removeNotification } =
      useSmartNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const unreadCount = getUnreadCount();

    const handleNotificationClick = (notificationId: string) => {
      markAsRead(notificationId);
    };

    const handleRemoveNotification = (
      notificationId: string,
      e: React.MouseEvent
    ) => {
      e.stopPropagation();
      removeNotification(notificationId);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Element;
        if (isOpen && !target.closest("[data-notification-dropdown]")) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
          document.removeEventListener("mousedown", handleClickOutside);
      }
    }, [isOpen]);

    return (
      <div className="relative" data-notification-dropdown>
        <Tooltip.Provider delayDuration={200}>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 h-8 text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all hover:scale-105"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-red-500 dark:bg-red-600 rounded-full ring-2 ring-white dark:ring-zinc-900 animate-pulse"></span>
                )}
              </button>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content
                side="bottom"
                className="px-2 py-1 text-xs font-medium text-white bg-gray-900 dark:bg-zinc-800 rounded-md shadow-lg z-50"
                sideOffset={5}
              >
                Notifications
                <Tooltip.Arrow className="fill-gray-900 dark:fill-zinc-800" />
              </Tooltip.Content>
            </Tooltip.Portal>

            {/* Notifications Dropdown */}
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-[360px] bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-gray-200 dark:border-zinc-800 focus:outline-none z-[999999] max-h-96 overflow-hidden"
                >
                  {/* Header */}
                  <div className="p-4 border-b border-gray-100 dark:border-zinc-800">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-zinc-50 font-outfit">
                        Notifications
                      </h3>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500 dark:text-zinc-400 font-outfit">
                          {notifications.length} total
                        </span>
                        <button
                          onClick={() => setIsOpen(false)}
                          className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg"
                          aria-label="Close notifications"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Notifications List */}
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="text-center py-8 px-4">
                        <Bell className="w-12 h-12 text-gray-300 dark:text-zinc-600 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-zinc-400 font-outfit">
                          No notifications yet
                        </p>
                      </div>
                    ) : (
                      <div className="p-2 space-y-1">
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            onClick={() =>
                              handleNotificationClick(notification.id)
                            }
                            className="group p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`w-2 h-2 rounded-full mt-2 ${
                                  notification.type === "success"
                                    ? "bg-green-500"
                                    : notification.type === "warning"
                                    ? "bg-yellow-500"
                                    : notification.type === "error"
                                    ? "bg-red-500"
                                    : "bg-blue-500"
                                }`}
                              ></div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-zinc-50 truncate font-outfit">
                                  {notification.title}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-zinc-400 mt-1 line-clamp-2 font-outfit">
                                  {notification.message}
                                </p>
                                <div className="flex items-center justify-between mt-2">
                                  <span className="text-xs text-gray-400 dark:text-zinc-500 font-outfit">
                                    {notification.timestamp.toLocaleTimeString()}
                                  </span>
                                  <button
                                    onClick={(e) =>
                                      handleRemoveNotification(
                                        notification.id,
                                        e
                                      )
                                    }
                                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300 transition-opacity"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Tooltip.Root>
        </Tooltip.Provider>
      </div>
    );
  };

  return (
    <ProtectedRoute>
      <QueryProvider>
        <ToastProvider>
          <NotificationProvider>
            <SmartNotificationProvider>
              <div className="h-screen bg-gray-50 dark:bg-zinc-950 flex overflow-hidden dashboard">
                {/* Mobile sidebar */}
                <div
                  className={`fixed inset-0 z-50 lg:hidden ${
                    sidebarOpen ? "block" : "hidden"
                  }`}
                >
                  <div
                    className="fixed inset-0 bg-gray-600 dark:bg-black bg-opacity-75 dark:bg-opacity-80"
                    onClick={() => setSidebarOpen(false)}
                  />
                  <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-zinc-900">
                    <div className="absolute top-0 right-0 -mr-12 pt-2">
                      <button
                        type="button"
                        className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                        onClick={() => setSidebarOpen(false)}
                      >
                        <X className="h-6 w-6 text-white" />
                      </button>
                    </div>
                    <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                      <div className="flex-shrink-0 flex items-center px-4">
                        <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 rounded-lg flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold text-sm">
                            L
                          </span>
                        </div>
                        <span className="ml-3 text-xl font-bold text-gray-900 dark:text-zinc-50 font-outfit">
                          Lumio
                        </span>
                      </div>
                      <nav className="mt-5 px-2 space-y-1">
                        {navigation.map((item) => {
                          const isActive = pathname === item.href;
                          return (
                            <Link
                              key={item.name}
                              href={item.href}
                              className={`${
                                isActive
                                  ? "bg-blue-50 dark:bg-blue-500/10 border-blue-500 dark:border-blue-400 text-blue-700 dark:text-blue-300"
                                  : "border-transparent text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-zinc-100"
                              } group flex items-center px-2 py-2 text-base font-medium rounded-md border-l-4 font-outfit`}
                            >
                              <item.icon
                                className={`${
                                  isActive
                                    ? "text-blue-500 dark:text-blue-400"
                                    : "text-gray-400 dark:text-zinc-500 group-hover:text-gray-500 dark:group-hover:text-zinc-300"
                                } mr-4 h-6 w-6`}
                              />
                              {item.name}
                            </Link>
                          );
                        })}
                      </nav>
                    </div>
                  </div>
                </div>

                {/* Desktop sidebar - Premium Icon-Only Design */}
                <div className="hidden lg:flex lg:flex-shrink-0">
                  <Tooltip.Provider delayDuration={200}>
                    <div className="flex flex-col w-20 h-screen">
                      <div className="flex flex-col h-full bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800 shadow-sm">
                        <div className="flex-1 flex flex-col pt-6 pb-4 overflow-y-auto">
                          {/* Logo Section */}
                          <div className="flex items-center justify-center flex-shrink-0 px-4 mb-8">
                            <Tooltip.Root>
                              <Tooltip.Trigger asChild>
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 dark:from-blue-500 dark:to-blue-700 rounded-xl flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer">
                                  <span className="text-white font-bold text-xl font-outfit">
                                    L
                                  </span>
                                </div>
                              </Tooltip.Trigger>
                              <Tooltip.Portal>
                                <Tooltip.Content
                                  side="right"
                                  className="px-3 py-2 text-sm font-medium text-white bg-gray-900 dark:bg-zinc-800 rounded-lg shadow-lg z-50 font-outfit"
                                  sideOffset={5}
                                >
                                  Lumio
                                  <Tooltip.Arrow className="fill-gray-900 dark:fill-zinc-800" />
                                </Tooltip.Content>
                              </Tooltip.Portal>
                            </Tooltip.Root>
                          </div>

                          {/* Navigation */}
                          <nav className="flex-1 px-3 space-y-3">
                            {navigation.map((item) => {
                              const isActive = pathname === item.href;
                              return (
                                <Tooltip.Root key={item.name}>
                                  <Tooltip.Trigger asChild>
                                    <Link
                                      href={item.href}
                                      prefetch={true}
                                      className={`${
                                        isActive
                                          ? "bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-500/10 dark:to-blue-500/5 text-blue-600 dark:text-blue-400 shadow-md shadow-blue-500/10"
                                          : "text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-zinc-100"
                                      } group flex items-center justify-center w-full h-12 rounded-xl transition-all relative overflow-hidden`}
                                    >
                                      {isActive && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 rounded-r-full shadow-lg shadow-blue-500/50"></div>
                                      )}
                                      <item.icon
                                        className={`${
                                          isActive
                                            ? "scale-110"
                                            : "group-hover:scale-105"
                                        } h-5 w-5 transition-all duration-200`}
                                      />
                                    </Link>
                                  </Tooltip.Trigger>
                                  <Tooltip.Portal>
                                    <Tooltip.Content
                                      side="right"
                                      className="px-3 py-2 text-sm font-medium text-white bg-gray-900 dark:bg-zinc-800 rounded-lg shadow-lg z-50 font-outfit"
                                      sideOffset={5}
                                    >
                                      {item.name}
                                      <Tooltip.Arrow className="fill-gray-900 dark:fill-zinc-800" />
                                    </Tooltip.Content>
                                  </Tooltip.Portal>
                                </Tooltip.Root>
                              );
                            })}
                          </nav>

                          {/* User Section */}
                          <div className="px-3 pt-4 border-t border-gray-200 dark:border-zinc-800">
                            <Tooltip.Root>
                              <Tooltip.Trigger asChild>
                                <div className="flex items-center justify-center p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all cursor-pointer group">
                                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-600 rounded-full flex items-center justify-center transition-all duration-200 group-hover:scale-105 shadow-md">
                                    <span className="text-white text-sm font-medium font-outfit">
                                      {user?.firstName?.charAt(0) || "U"}
                                    </span>
                                  </div>
                                </div>
                              </Tooltip.Trigger>
                              <Tooltip.Portal>
                                <Tooltip.Content
                                  side="right"
                                  className="px-3 py-2 text-sm font-medium text-white bg-gray-900 dark:bg-zinc-800 rounded-lg shadow-lg z-50 font-outfit"
                                  sideOffset={5}
                                >
                                  {user?.firstName} {user?.lastName}
                                  <Tooltip.Arrow className="fill-gray-900 dark:fill-zinc-800" />
                                </Tooltip.Content>
                              </Tooltip.Portal>
                            </Tooltip.Root>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Tooltip.Provider>
                </div>

                {/* Main content */}
                <div className="flex flex-col flex-1 h-screen overflow-hidden">
                  {/* Top navigation - Elite Compact Header */}
                  <div className="relative flex-shrink-0 flex h-12 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm shadow-sm z-50">
                    {/* Premium subtle blue border with gradient */}
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent dark:via-blue-300/20"></div>
                    <button
                      type="button"
                      className="px-4 border-r border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 dark:focus:ring-blue-400 lg:hidden"
                      onClick={() => setSidebarOpen(true)}
                    >
                      <Menu className="h-5 w-5" />
                    </button>
                    <div className="flex-1 px-4 flex items-center justify-between">
                      {/* Left: Page Context */}
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="flex items-center gap-2 text-sm">
                          {(() => {
                            const getPageInfo = () => {
                              if (pathname === "/dashboard")
                                return {
                                  icon: Home,
                                  title: "Home",
                                  breadcrumb: null,
                                };
                              if (pathname === "/dashboard/leads")
                                return {
                                  icon: Users,
                                  title: "Leads",
                                  breadcrumb: null,
                                };
                              if (pathname === "/dashboard/campaigns")
                                return {
                                  icon: Mail,
                                  title: "Campaigns",
                                  breadcrumb: null,
                                };
                              if (pathname === "/dashboard/insights")
                                return {
                                  icon: Lightbulb,
                                  title: "Insights",
                                  breadcrumb: null,
                                };
                              if (pathname === "/dashboard/analytics")
                                return {
                                  icon: BarChart3,
                                  title: "Analytics",
                                  breadcrumb: null,
                                };
                              if (pathname === "/dashboard/calendar")
                                return {
                                  icon: Calendar,
                                  title: "Calendar",
                                  breadcrumb: null,
                                };
                              if (pathname === "/dashboard/kanban")
                                return {
                                  icon: Grid3x3,
                                  title: "Kanban",
                                  breadcrumb: null,
                                };
                              if (pathname.startsWith("/dashboard/settings")) {
                                if (
                                  pathname ===
                                  "/dashboard/settings/integrations"
                                )
                                  return {
                                    icon: Settings,
                                    title: "Integrations",
                                    breadcrumb: "Settings",
                                  };
                                if (
                                  pathname ===
                                  "/dashboard/settings/marvin-training"
                                )
                                  return {
                                    icon: Settings,
                                    title: "Marvin Training",
                                    breadcrumb: "Settings",
                                  };
                                if (
                                  pathname === "/dashboard/settings/sdr-agent"
                                )
                                  return {
                                    icon: Settings,
                                    title: "SDR Agent",
                                    breadcrumb: "Settings",
                                  };
                                return {
                                  icon: Settings,
                                  title: "Settings",
                                  breadcrumb: null,
                                };
                              }
                              if (pathname === "/dashboard/integrations")
                                return {
                                  icon: Settings,
                                  title: "Integrations",
                                  breadcrumb: null,
                                };
                              return {
                                icon: Home,
                                title: "Dashboard",
                                breadcrumb: null,
                              };
                            };
                            const pageInfo = getPageInfo();
                            const PageIcon = pageInfo.icon;
                            return (
                              <>
                                {pageInfo.breadcrumb && (
                                  <>
                                    <span className="text-gray-400 dark:text-zinc-500 text-xs font-medium font-outfit">
                                      {pageInfo.breadcrumb}
                                    </span>
                                    <ChevronRight className="h-3 w-3 text-gray-300 dark:text-zinc-600" />
                                  </>
                                )}
                                <PageIcon className="h-4 w-4 text-gray-600 dark:text-zinc-400 flex-shrink-0" />
                              </>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Right: Action Groups */}
                      <div className="flex items-center gap-2">
                        {/* Group 1: Search with ⌘K */}
                        <div className="relative">
                          <AnimatePresence mode="wait">
                            {searchExpanded ? (
                              <motion.div
                                key="search-expanded"
                                initial={{ width: 0, opacity: 0 }}
                                animate={{ width: 220, opacity: 1 }}
                                exit={{ width: 0, opacity: 0 }}
                                transition={{
                                  duration: 0.2,
                                  ease: "easeInOut",
                                }}
                                className="relative overflow-hidden"
                              >
                                <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none pl-2.5">
                                  <Search className="h-3.5 w-3.5 text-gray-400 dark:text-zinc-500" />
                                </div>
                                <input
                                  autoFocus
                                  type="search"
                                  placeholder="Search..."
                                  className="block w-full h-8 pl-8 pr-8 py-1.5 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-gray-50 dark:bg-zinc-800 shadow-sm font-outfit placeholder:font-outfit"
                                  onBlur={() => setSearchExpanded(false)}
                                />
                                <button
                                  onClick={() => setSearchExpanded(false)}
                                  className="absolute inset-y-0 right-0 flex items-center pr-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </motion.div>
                            ) : (
                              <motion.button
                                key="search-button"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.15 }}
                                onClick={() => setSearchExpanded(true)}
                                className="group flex items-center gap-1.5 px-2.5 h-8 text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                              >
                                <Search className="h-4 w-4" />
                                <span className="hidden sm:flex items-center gap-1 text-xs font-outfit">
                                  <kbd className="px-1.5 py-0.5 text-[10px] font-semibold text-gray-500 dark:text-zinc-400 bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded font-outfit">
                                    ⌘K
                                  </kbd>
                                </span>
                              </motion.button>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Divider */}
                        <div className="h-6 w-px bg-gray-200 dark:bg-zinc-700"></div>

                        {/* Group 2: Theme Toggle */}
                        <ThemeToggle />

                        {/* Divider */}
                        <div className="h-6 w-px bg-gray-200 dark:bg-zinc-700"></div>

                        {/* Group 3: Notifications */}
                        <HeaderNotificationBell />

                        {/* Divider */}
                        <div className="h-6 w-px bg-gray-200 dark:bg-zinc-700"></div>

                        {/* Group 4: Profile */}
                        <div className="relative">
                          <button
                            type="button"
                            className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all hover:scale-105"
                            onClick={() => setProfileOpen(!profileOpen)}
                          >
                            <div className="relative h-7 w-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-600 flex items-center justify-center shadow-sm transition-all duration-200 hover:shadow-md">
                              <span className="text-white text-xs font-semibold">
                                {user?.firstName?.charAt(0) || "U"}
                              </span>
                              {/* Status Indicator */}
                              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 bg-green-500 dark:bg-green-400 rounded-full ring-2 ring-white dark:ring-zinc-900"></span>
                            </div>
                          </button>
                          <AnimatePresence>
                            {profileOpen && (
                              <motion.div
                                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                                transition={{ duration: 0.12 }}
                                className="absolute right-0 mt-2 w-56 rounded-lg shadow-xl py-1.5 bg-white dark:bg-zinc-900 ring-1 ring-gray-200 dark:ring-zinc-800 focus:outline-none z-[999999]"
                              >
                                <div className="px-4 py-2.5 border-b border-gray-100 dark:border-zinc-800">
                                  <div className="font-medium text-sm text-gray-900 dark:text-zinc-50 font-outfit">
                                    {user?.firstName} {user?.lastName}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5 truncate font-outfit">
                                    {user?.emailAddresses[0]?.emailAddress}
                                  </div>
                                </div>
                                <div className="py-1">
                                  <Link
                                    href="/dashboard/settings"
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 font-outfit"
                                    onClick={() => setProfileOpen(false)}
                                  >
                                    <Settings className="h-4 w-4 mr-3 text-gray-400 dark:text-zinc-500" />
                                    Settings
                                  </Link>
                                  <button
                                    onClick={handleSignOut}
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 font-outfit"
                                  >
                                    <LogOut className="h-4 w-4 mr-3 text-gray-400 dark:text-zinc-500" />
                                    Sign out
                                  </button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Page content */}
                  <main className="flex-1 bg-gray-50 dark:bg-zinc-950 overflow-y-auto relative z-10">
                    <div className="h-full w-full p-6">{children}</div>
                  </main>
                </div>

                {/* Marvin Dock - Global floating button */}
                <MarvinDock />
              </div>
            </SmartNotificationProvider>
          </NotificationProvider>
        </ToastProvider>
      </QueryProvider>
    </ProtectedRoute>
  );
}
