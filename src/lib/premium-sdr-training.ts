import { z } from "zod";

// Premium SDR Training Schemas
export const SDRTrainingModuleSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.enum([
    "prospecting",
    "outreach",
    "qualification",
    "objection_handling",
    "closing",
    "follow_up",
    "relationship_building",
  ]),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  duration: z.number(), // in minutes
  completionRate: z.number().min(0).max(100),
  isCompleted: z.boolean(),
  prerequisites: z.array(z.string()).optional(),
  skills: z.array(z.string()),
  exercises: z.array(
    z.object({
      id: z.string(),
      type: z.enum(["roleplay", "scenario", "quiz", "simulation"]),
      title: z.string(),
      description: z.string(),
      points: z.number(),
      isCompleted: z.boolean(),
    })
  ),
});

export const SDRTrainingSessionSchema = z.object({
  id: z.string(),
  moduleId: z.string(),
  userId: z.string(),
  startTime: z.string(),
  endTime: z.string().optional(),
  score: z.number().min(0).max(100).optional(),
  feedback: z.string().optional(),
  exercisesCompleted: z.array(z.string()),
  timeSpent: z.number(), // in minutes
  status: z.enum(["in_progress", "completed", "paused", "abandoned"]),
});

export const SDRPerformanceMetricsSchema = z.object({
  userId: z.string(),
  overallScore: z.number().min(0).max(100),
  modulesCompleted: z.number(),
  totalTimeSpent: z.number(),
  averageScore: z.number(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  recommendations: z.array(z.string()),
  lastTrainingDate: z.string(),
  nextRecommendedModule: z.string().optional(),
  skillLevel: z.enum(["novice", "intermediate", "advanced", "expert"]),
});

export type SDRTrainingModule = z.infer<typeof SDRTrainingModuleSchema>;
export type SDRTrainingSession = z.infer<typeof SDRTrainingSessionSchema>;
export type SDRPerformanceMetrics = z.infer<typeof SDRPerformanceMetricsSchema>;

// Premium SDR Training Modules
export const PREMIUM_SDR_MODULES: SDRTrainingModule[] = [
  {
    id: "prospecting-mastery",
    name: "Prospecting Mastery",
    description:
      "Master the art of finding and qualifying high-value prospects using AI-powered tools and data analysis.",
    category: "prospecting",
    difficulty: "beginner",
    duration: 45,
    completionRate: 0,
    isCompleted: false,
    skills: [
      "Lead Research",
      "Data Analysis",
      "ICP Identification",
      "Competitive Intelligence",
    ],
    exercises: [
      {
        id: "prospect-research-simulation",
        type: "simulation",
        title: "AI-Powered Prospect Research",
        description:
          "Use AI tools to research and score prospects based on multiple data points",
        points: 25,
        isCompleted: false,
      },
      {
        id: "icp-identification-quiz",
        type: "quiz",
        title: "Ideal Customer Profile Quiz",
        description:
          "Test your understanding of ICP characteristics and qualification criteria",
        points: 15,
        isCompleted: false,
      },
    ],
  },
  {
    id: "outreach-excellence",
    name: "Outreach Excellence",
    description:
      "Craft compelling, personalized outreach messages that generate responses and build relationships.",
    category: "outreach",
    difficulty: "intermediate",
    duration: 60,
    completionRate: 0,
    isCompleted: false,
    prerequisites: ["prospecting-mastery"],
    skills: [
      "Email Writing",
      "Personalization",
      "Subject Line Optimization",
      "Multi-Channel Outreach",
    ],
    exercises: [
      {
        id: "email-crafting-roleplay",
        type: "roleplay",
        title: "Personalized Email Crafting",
        description:
          "Create personalized emails for different prospect personas and scenarios",
        points: 30,
        isCompleted: false,
      },
      {
        id: "subject-line-optimization",
        type: "scenario",
        title: "Subject Line A/B Testing",
        description: "Test and optimize subject lines for maximum open rates",
        points: 20,
        isCompleted: false,
      },
    ],
  },
  {
    id: "objection-handling-mastery",
    name: "Objection Handling Mastery",
    description:
      "Develop advanced skills to handle common objections and turn them into opportunities.",
    category: "objection_handling",
    difficulty: "advanced",
    duration: 75,
    completionRate: 0,
    isCompleted: false,
    prerequisites: ["outreach-excellence"],
    skills: [
      "Active Listening",
      "Empathy",
      "Solution Positioning",
      "Value Communication",
    ],
    exercises: [
      {
        id: "objection-roleplay-simulation",
        type: "simulation",
        title: "Real-Time Objection Handling",
        description:
          "Practice handling objections in realistic sales scenarios",
        points: 40,
        isCompleted: false,
      },
      {
        id: "objection-pattern-analysis",
        type: "scenario",
        title: "Objection Pattern Recognition",
        description: "Analyze and categorize common objection patterns",
        points: 25,
        isCompleted: false,
      },
    ],
  },
  {
    id: "closing-techniques",
    name: "Advanced Closing Techniques",
    description:
      "Master sophisticated closing strategies and techniques for different sales scenarios.",
    category: "closing",
    difficulty: "advanced",
    duration: 90,
    completionRate: 0,
    isCompleted: false,
    prerequisites: ["objection-handling-mastery"],
    skills: [
      "Closing Strategies",
      "Urgency Creation",
      "Value Demonstration",
      "Commitment Building",
    ],
    exercises: [
      {
        id: "closing-scenario-simulation",
        type: "simulation",
        title: "Multi-Stage Closing Simulation",
        description:
          "Practice closing techniques across different sales stages",
        points: 50,
        isCompleted: false,
      },
      {
        id: "closing-psychology-quiz",
        type: "quiz",
        title: "Closing Psychology & Timing",
        description:
          "Test knowledge of psychological triggers and optimal closing timing",
        points: 30,
        isCompleted: false,
      },
    ],
  },
  {
    id: "relationship-building",
    name: "Strategic Relationship Building",
    description:
      "Build long-term relationships that drive repeat business and referrals.",
    category: "relationship_building",
    difficulty: "intermediate",
    duration: 50,
    completionRate: 0,
    isCompleted: false,
    skills: [
      "Relationship Management",
      "Value Delivery",
      "Referral Generation",
      "Account Expansion",
    ],
    exercises: [
      {
        id: "relationship-mapping-roleplay",
        type: "roleplay",
        title: "Stakeholder Relationship Mapping",
        description:
          "Map and nurture relationships across different stakeholder levels",
        points: 35,
        isCompleted: false,
      },
      {
        id: "referral-strategy-scenario",
        type: "scenario",
        title: "Referral Generation Strategy",
        description:
          "Develop strategies for generating referrals from existing clients",
        points: 25,
        isCompleted: false,
      },
    ],
  },
];

// Premium Training Features
export class PremiumSDRTrainingEngine {
  private modules: SDRTrainingModule[] = PREMIUM_SDR_MODULES;
  private sessions: SDRTrainingSession[] = [];
  private performanceMetrics: Map<string, SDRPerformanceMetrics> = new Map();

  // Start a training session
  async startTrainingSession(
    userId: string,
    moduleId: string
  ): Promise<SDRTrainingSession> {
    const module = this.modules.find((m) => m.id === moduleId);
    if (!module) {
      throw new Error("Training module not found");
    }

    const session: SDRTrainingSession = {
      id: `session_${Date.now()}`,
      moduleId,
      userId,
      startTime: new Date().toISOString(),
      exercisesCompleted: [],
      timeSpent: 0,
      status: "in_progress",
    };

    this.sessions.push(session);
    return session;
  }

  // Complete an exercise
  async completeExercise(
    sessionId: string,
    exerciseId: string,
    score: number
  ): Promise<void> {
    const session = this.sessions.find((s) => s.id === sessionId);
    if (!session) {
      throw new Error("Training session not found");
    }

    const module = this.modules.find((m) => m.id === session.moduleId);
    if (!module) {
      throw new Error("Module not found");
    }

    const exercise = module.exercises.find((e) => e.id === exerciseId);
    if (!exercise) {
      throw new Error("Exercise not found");
    }

    // Mark exercise as completed
    exercise.isCompleted = true;
    session.exercisesCompleted.push(exerciseId);

    // Update session score
    const totalPoints = module.exercises.reduce(
      (sum, ex) => sum + ex.points,
      0
    );
    const completedPoints = module.exercises
      .filter((ex) => session.exercisesCompleted.includes(ex.id))
      .reduce((sum, ex) => sum + ex.points, 0);

    session.score = Math.round((completedPoints / totalPoints) * 100);

    // Check if module is completed
    if (session.exercisesCompleted.length === module.exercises.length) {
      session.status = "completed";
      session.endTime = new Date().toISOString();
      module.isCompleted = true;
      module.completionRate = 100;
    }
  }

  // Get training progress
  getTrainingProgress(userId: string): SDRPerformanceMetrics {
    const userSessions = this.sessions.filter((s) => s.userId === userId);
    const completedModules = this.modules.filter((m) => m.isCompleted);
    const totalTimeSpent = userSessions.reduce(
      (sum, s) => sum + s.timeSpent,
      0
    );
    const averageScore =
      userSessions.length > 0
        ? userSessions.reduce((sum, s) => sum + (s.score || 0), 0) /
          userSessions.length
        : 0;

    const overallScore = Math.round(averageScore);

    // Determine skill level
    let skillLevel: "novice" | "intermediate" | "advanced" | "expert" =
      "novice";
    if (overallScore >= 90) skillLevel = "expert";
    else if (overallScore >= 75) skillLevel = "advanced";
    else if (overallScore >= 50) skillLevel = "intermediate";

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      completedModules,
      overallScore
    );

    const metrics: SDRPerformanceMetrics = {
      userId,
      overallScore,
      modulesCompleted: completedModules.length,
      totalTimeSpent,
      averageScore,
      strengths: this.identifyStrengths(completedModules),
      weaknesses: this.identifyWeaknesses(completedModules, overallScore),
      recommendations,
      lastTrainingDate:
        userSessions.length > 0
          ? userSessions[userSessions.length - 1].startTime
          : new Date().toISOString(),
      nextRecommendedModule: this.getNextRecommendedModule(completedModules),
      skillLevel,
    };

    this.performanceMetrics.set(userId, metrics);
    return metrics;
  }

  // Get available modules
  getAvailableModules(userId: string): SDRTrainingModule[] {
    const userProgress = this.getTrainingProgress(userId);
    const completedModuleIds = this.modules
      .filter((m) => m.isCompleted)
      .map((m) => m.id);

    return this.modules.filter((module) => {
      // Check if prerequisites are met
      if (module.prerequisites) {
        return module.prerequisites.every((prereq) =>
          completedModuleIds.includes(prereq)
        );
      }
      return true;
    });
  }

  // Generate personalized recommendations
  private generateRecommendations(
    completedModules: SDRTrainingModule[],
    overallScore: number
  ): string[] {
    const recommendations: string[] = [];

    if (overallScore < 60) {
      recommendations.push(
        "Focus on completing more exercises to improve your understanding"
      );
      recommendations.push(
        "Consider reviewing the foundational modules before advancing"
      );
    }

    if (completedModules.length < 3) {
      recommendations.push(
        "Complete more training modules to build comprehensive SDR skills"
      );
    }

    const categories = completedModules.map((m) => m.category);
    if (!categories.includes("prospecting")) {
      recommendations.push(
        "Start with prospecting mastery to build a strong foundation"
      );
    }

    if (!categories.includes("outreach")) {
      recommendations.push(
        "Develop your outreach skills to improve response rates"
      );
    }

    if (overallScore >= 80) {
      recommendations.push(
        "Consider mentoring other team members to reinforce your skills"
      );
      recommendations.push("Explore advanced scenarios and edge cases");
    }

    return recommendations;
  }

  // Identify strengths
  private identifyStrengths(completedModules: SDRTrainingModule[]): string[] {
    const strengths: string[] = [];

    completedModules.forEach((module) => {
      if (module.completionRate >= 80) {
        strengths.push(module.name);
      }
    });

    return strengths;
  }

  // Identify weaknesses
  private identifyWeaknesses(
    completedModules: SDRTrainingModule[],
    overallScore: number
  ): string[] {
    const weaknesses: string[] = [];

    if (overallScore < 70) {
      weaknesses.push("Overall performance needs improvement");
    }

    const lowPerformingModules = completedModules.filter(
      (m) => m.completionRate < 70
    );
    lowPerformingModules.forEach((module) => {
      weaknesses.push(`${module.name} - needs review`);
    });

    return weaknesses;
  }

  // Get next recommended module
  private getNextRecommendedModule(
    completedModules: SDRTrainingModule[]
  ): string | undefined {
    const completedIds = completedModules.map((m) => m.id);

    // Find modules that can be started
    const availableModules = this.modules.filter((module) => {
      if (completedIds.includes(module.id)) return false;
      if (module.prerequisites) {
        return module.prerequisites.every((prereq) =>
          completedIds.includes(prereq)
        );
      }
      return true;
    });

    // Return the first available module
    return availableModules[0]?.name;
  }

  // Get module by ID
  getModule(moduleId: string): SDRTrainingModule | undefined {
    return this.modules.find((m) => m.id === moduleId);
  }

  // Get all modules
  getAllModules(): SDRTrainingModule[] {
    return this.modules;
  }
}

export const premiumSDRTraining = new PremiumSDRTrainingEngine();
