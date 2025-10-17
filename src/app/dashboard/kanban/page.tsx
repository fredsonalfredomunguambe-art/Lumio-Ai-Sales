"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { useTasks, KanbanTask } from "@/hooks/use-tasks";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Plus,
  MoreHorizontal,
  Clock,
  Target,
  BarChart3,
  Lightbulb,
  X,
  Edit3,
  CheckCircle2,
  Circle,
  ArrowRight,
  Zap,
  TrendingUp,
  Users,
  Calendar,
  GripVertical,
} from "lucide-react";
import Image from "next/image";

// Interface já definida no hook use-tasks

interface Column {
  id: "TODO" | "IN_PROGRESS" | "DONE";
  title: string;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  bgGradient: string;
  tasks: KanbanTask[];
}

// Helper functions
const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high":
      return "bg-red-100 text-red-800 border-red-200";
    case "medium":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "low":
      return "bg-green-100 text-green-800 border-green-200";
    default:
      return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 transition-colors duration-200 border-gray-200 dark:border-gray-700";
  }
};

const getPriorityIcon = (priority: string) => {
  switch (priority) {
    case "high":
      return "🔴";
    case "medium":
      return "🟡";
    case "low":
      return "🟢";
    default:
      return "⚪";
  }
};

// Sortable Task Component
function SortableTask({
  task,
  onDeleteTask,
}: {
  task: KanbanTask;
  onDeleteTask: (taskId: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-gray-100/50 cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-300 shadow-sm"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.08 }}
    >
      {/* Drag Handle */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2 flex-1">
          <button
            {...attributes}
            {...listeners}
            className="text-gray-400 dark:text-gray-500 transition-colors duration-200 hover:text-gray-600 dark:text-gray-400 dark:text-gray-500 transition-colors duration-200 transition-colors duration-200 transition-colors p-1 rounded-full hover:bg-gray-100 dark:bg-gray-800 cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="w-4 h-4" />
          </button>
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 transition-colors duration-200 font-outfit text-sm leading-tight flex-1">
            {task.title}
          </h4>
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
              task.priority
            )}`}
          >
            {getPriorityIcon(task.priority)} {task.priority}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteTask(task.id);
            }}
            className="text-gray-400 dark:text-gray-500 transition-colors duration-200 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Task Description */}
      {task.description && (
        <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500 transition-colors duration-200 transition-colors duration-200 font-inter text-xs mb-3 leading-relaxed line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Task Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 transition-colors duration-200 transition-colors duration-200">
        <span className="flex items-center bg-gray-50 px-2 py-1 rounded-full">
          <Clock className="w-3 h-3 mr-1" />
          {new Date(task.createdAt).toLocaleDateString()}
        </span>
        <span className="flex items-center bg-gray-50 px-2 py-1 rounded-full">
          <Target className="w-3 h-3 mr-1" />#{task.order}
        </span>
      </div>
    </motion.div>
  );
}

// Sortable Column Component
function SortableColumn({
  column,
  tasks,
  onDeleteTask,
}: {
  column: Column;
  tasks: KanbanTask[];
  onDeleteTask: (taskId: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: column.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.15 }}
    >
      {/* Column Header */}
      <div
        className={`p-4 bg-gradient-to-r ${column.bgGradient} border-b border-white/50`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3">
            <div
              className={`w-8 h-8 rounded-lg bg-gradient-to-br ${column.gradient} flex items-center justify-center shadow-md`}
            >
              <column.icon className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-gray-100 transition-colors duration-200 font-outfit text-lg">
              {column.title}
            </h3>
          </div>
          <span className="bg-white/80 backdrop-blur-sm text-gray-700 px-3 py-1 rounded-full text-sm font-semibold shadow-sm border border-white/50">
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Tasks Container */}
      <div className="p-4 space-y-3 min-h-[400px]">
        <SortableContext
          items={tasks.map((task) => task.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task, taskIndex) => (
            <SortableTask
              key={task.id}
              task={task}
              onDeleteTask={onDeleteTask}
            />
          ))}
        </SortableContext>

        {/* Empty State */}
        {tasks.length === 0 && (
          <motion.div
            className="text-center py-8 text-gray-400 dark:text-gray-500 transition-colors duration-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
              <Plus className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-sm font-inter text-gray-500 dark:text-gray-400 dark:text-gray-500 transition-colors duration-200 transition-colors duration-200">
              No tasks yet
            </p>
            <p className="text-xs font-inter text-gray-400 dark:text-gray-500 transition-colors duration-200 mt-1">
              Add a new task to get started
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export default function KanbanPage() {
  const { user, isLoaded } = useUser();
  const [columns, setColumns] = useState<Column[]>([
    {
      id: "TODO",
      title: "To Do",
      color: "gray",
      icon: Circle,
      gradient: "from-gray-500 to-gray-600",
      bgGradient: "from-gray-50 to-gray-100",
      tasks: [],
    },
    {
      id: "IN_PROGRESS",
      title: "In Progress",
      color: "blue",
      icon: ArrowRight,
      gradient: "from-blue-500 to-indigo-600",
      bgGradient: "from-blue-50 to-indigo-100",
      tasks: [],
    },
    {
      id: "DONE",
      title: "Done",
      color: "green",
      icon: CheckCircle2,
      gradient: "from-green-500 to-emerald-600",
      bgGradient: "from-green-50 to-emerald-100",
      tasks: [],
    },
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high",
    status: "todo" as "todo" | "in-progress" | "done",
  });

  // Drag and Drop state
  const [activeTask, setActiveTask] = useState<KanbanTask | null>(null);

  // Usar o hook personalizado para gerenciar tarefas
  const { tasks, loading, error, createTask, deleteTask, moveTask } =
    useTasks();

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Atualizar colunas quando tasks mudarem
  useEffect(() => {
    if (tasks.length > 0) {
      setColumns((prevColumns) =>
        prevColumns.map((column) => ({
          ...column,
          tasks: tasks.filter((task) => task.status === column.id),
        }))
      );
    }
  }, [tasks]);

  const handleCreateTask = async () => {
    try {
      const newTaskCreated = await createTask({
        title: newTask.title,
        description: newTask.description,
        priority: newTask.priority.toUpperCase() as "LOW" | "MEDIUM" | "HIGH",
        status: newTask.status.toUpperCase() as "TODO" | "IN_PROGRESS" | "DONE",
      });

      if (newTaskCreated) {
        // Reset form
        setNewTask({
          title: "",
          description: "",
          priority: "medium",
          status: "todo",
        });

        setShowCreateModal(false);
      } else {
        console.error("❌ Falha ao criar tarefa");
      }
    } catch (error) {
      console.error("❌ Erro ao criar tarefa:", error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
    } catch (error) {
      console.error("❌ Erro ao deletar tarefa:", error);
    }
  };

  // Drag and Drop handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    setActiveTask(task || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const activeTask = tasks.find((t) => t.id === activeId);
    if (!activeTask) return;

    // Check if dropping on a column
    const isOverColumn = columns.some((col) => col.id === overId);
    if (isOverColumn) {
      const newStatus = overId as "TODO" | "IN_PROGRESS" | "DONE";
      if (activeTask.status !== newStatus) {
        // Atualizar tarefa no backend
        moveTask(activeId.toString(), newStatus);
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const activeTask = tasks.find((t) => t.id === activeId);
    if (!activeTask) return;

    // Check if dropping on a column
    const isOverColumn = columns.some((col) => col.id === overId);
    if (isOverColumn) {
      const newStatus = overId as "TODO" | "IN_PROGRESS" | "DONE";
      if (activeTask.status !== newStatus) {
        // Atualizar tarefa no backend
        moveTask(activeId.toString(), newStatus);
      }
    }

    setActiveTask(null);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 dark:text-gray-500 transition-colors duration-200 transition-colors duration-200 font-inter">
            Loading your kanban board...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 transition-colors duration-200 mb-4 font-outfit">
            Please sign in to access the kanban board
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <motion.div
            className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 transition-colors duration-200 font-outfit mb-1">
                Kanban Board
              </h1>
              <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500 transition-colors duration-200 transition-colors duration-200 font-inter text-sm">
                Organize and track your marketing tasks and projects
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button className="flex items-center space-x-2 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-400 dark:text-gray-500 transition-colors duration-200 transition-colors duration-200 hover:text-gray-900 dark:text-gray-100 transition-colors duration-200 hover:bg-gray-50 transition-all duration-200 text-sm backdrop-blur-sm">
                <BarChart3 className="w-4 h-4" />
                <span className="font-inter">View Analytics</span>
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 font-outfit shadow-md text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Task</span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[
            {
              name: "Total Tasks",
              value: tasks.length.toString(),
              icon: Target,
              color: "blue",
              gradient: "from-blue-500 to-indigo-600",
            },
            {
              name: "In Progress",
              value: tasks
                .filter((t) => t.status === "IN_PROGRESS")
                .length.toString(),
              icon: ArrowRight,
              color: "yellow",
              gradient: "from-yellow-500 to-orange-600",
            },
            {
              name: "Completed",
              value: tasks.filter((t) => t.status === "DONE").length.toString(),
              icon: CheckCircle2,
              color: "green",
              gradient: "from-green-500 to-emerald-600",
            },
            {
              name: "High Priority",
              value: tasks
                .filter((t) => t.priority === "HIGH")
                .length.toString(),
              icon: Zap,
              color: "red",
              gradient: "from-red-500 to-pink-600",
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.name}
              className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}
                  >
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 transition-colors duration-200 font-outfit mb-1">
                  {stat.value}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500 transition-colors duration-200 transition-colors duration-200 font-inter text-sm">
                  {stat.name}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Kanban Board with Drag and Drop */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {columns.map((column, columnIndex) => (
              <SortableColumn
                key={column.id}
                column={column}
                tasks={column.tasks}
                onDeleteTask={deleteTask}
              />
            ))}
          </div>

          {/* Drag Overlay */}
          <DragOverlay>
            {activeTask ? (
              <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 border border-blue-200 shadow-2xl max-w-sm">
                <div className="flex items-center space-x-2 mb-2">
                  <GripVertical className="w-4 h-4 text-blue-500" />
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 transition-colors duration-200 font-outfit text-sm">
                    {activeTask.title}
                  </h4>
                </div>
                {activeTask.description && (
                  <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500 transition-colors duration-200 transition-colors duration-200 font-inter text-xs mb-2 line-clamp-2">
                    {activeTask.description}
                  </p>
                )}
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 transition-colors duration-200 transition-colors duration-200">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
                      activeTask.priority
                    )}`}
                  >
                    {getPriorityIcon(activeTask.priority)} {activeTask.priority}
                  </span>
                  <span className="text-gray-400 dark:text-gray-500 transition-colors duration-200">
                    #{activeTask.order}
                  </span>
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        {/* Marvin AI Insights */}
        <motion.div
          className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 backdrop-blur-sm rounded-2xl p-6 border border-blue-200/50 shadow-lg mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-blue-200/50 shadow-lg">
              <Image
                src="/fotos/marvin.png"
                alt="Marvin AI"
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 transition-colors duration-200 mb-3 font-outfit">
                Marvin AI Task Management Insights
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-gray-700 font-medium font-outfit text-sm mb-1">
                      Workflow Optimization
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 dark:text-gray-500 transition-colors duration-200 transition-colors duration-200 font-inter mb-2">
                      I can help you identify bottlenecks and suggest workflow
                      improvements to increase your team&apos;s productivity.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Users className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-gray-700 font-medium font-outfit text-sm mb-1">
                      Team Collaboration
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 dark:text-gray-500 transition-colors duration-200 transition-colors duration-200 font-inter mb-2">
                      Get insights on task distribution and team workload to
                      ensure balanced project management.
                    </p>
                  </div>
                </div>
              </div>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium font-outfit mt-3">
                Get personalized workflow recommendations →
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 transition-colors duration-200 font-outfit">
                Create New Task
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 dark:text-gray-500 transition-colors duration-200 hover:text-gray-600 dark:text-gray-400 dark:text-gray-500 transition-colors duration-200 transition-colors duration-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-outfit">
                  Task Title
                </label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask({ ...newTask, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-inter"
                  placeholder="Enter task title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-outfit">
                  Description
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(e) =>
                    setNewTask({ ...newTask, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-inter"
                  rows={3}
                  placeholder="Enter task description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-outfit">
                    Priority
                  </label>
                  <select
                    value={newTask.priority}
                    onChange={(e) =>
                      setNewTask({
                        ...newTask,
                        priority: e.target.value as "low" | "medium" | "high",
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-outfit">
                    Status
                  </label>
                  <select
                    value={newTask.status}
                    onChange={(e) =>
                      setNewTask({
                        ...newTask,
                        status: e.target.value as
                          | "todo"
                          | "in-progress"
                          | "done",
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors font-inter"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTask}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300 font-outfit shadow-md"
                >
                  Create Task
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
