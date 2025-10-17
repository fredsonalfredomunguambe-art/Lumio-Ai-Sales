"use client";

import React, { useState, useEffect } from "react";
import {
  Trophy,
  Star,
  Zap,
  Target,
  Users,
  Mail,
  TrendingUp,
  Calendar,
  Award,
  Crown,
  Gem,
  Flame,
  CheckCircle,
  Lock,
  Sparkles,
  ArrowRight,
  X,
} from "lucide-react";
import { useSmartNotifications } from "@/components/SmartNotificationSystem";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category:
    | "getting-started"
    | "campaigns"
    | "leads"
    | "performance"
    | "marvin"
    | "milestone";
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
  points: number;
  unlocked: boolean;
  unlockedAt?: Date;
  progress: number;
  maxProgress: number;
  requirements: string[];
  rewards?: {
    type: "points" | "badge" | "feature" | "discount";
    value: string;
    description: string;
  }[];
  marvinMessage?: string;
}

interface Streak {
  type:
    | "daily-login"
    | "campaigns-created"
    | "leads-contacted"
    | "marvin-interactions";
  current: number;
  best: number;
  lastActivity: Date;
}

interface AchievementSystemProps {
  userId: string;
  className?: string;
}

export default function AchievementSystem({
  userId,
  className = "",
}: AchievementSystemProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [streaks, setStreaks] = useState<Streak[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedAchievement, setSelectedAchievement] =
    useState<Achievement | null>(null);
  const [showUnlocked, setShowUnlocked] = useState(false);
  const [recentlyUnlocked, setRecentlyUnlocked] = useState<Achievement[]>([]);
  const { addNotification } = useSmartNotifications();

  // Mock data - in real app, this would come from API
  useEffect(() => {
    const mockAchievements: Achievement[] = [
      {
        id: "first-campaign",
        title: "First Steps",
        description: "Create your first email campaign",
        icon: Mail,
        category: "getting-started",
        rarity: "common",
        points: 10,
        unlocked: true,
        unlockedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        progress: 1,
        maxProgress: 1,
        requirements: ["Create 1 campaign"],
        rewards: [
          {
            type: "points",
            value: "10",
            description: "10 points earned",
          },
        ],
        marvinMessage:
          "Great start! You're on your way to becoming a marketing pro! 🚀",
      },
      {
        id: "lead-master",
        title: "Lead Master",
        description: "Import 100 leads into your database",
        icon: Users,
        category: "leads",
        rarity: "uncommon",
        points: 50,
        unlocked: false,
        progress: 67,
        maxProgress: 100,
        requirements: ["Import 100 leads"],
        rewards: [
          {
            type: "points",
            value: "50",
            description: "50 points earned",
          },
          {
            type: "badge",
            value: "Lead Master",
            description: "Exclusive badge for your profile",
          },
        ],
        marvinMessage:
          "You're 67% there! Keep importing those high-quality leads! 💪",
      },
      {
        id: "campaign-wizard",
        title: "Campaign Wizard",
        description: "Create 10 successful campaigns",
        icon: Target,
        category: "campaigns",
        rarity: "rare",
        points: 100,
        unlocked: false,
        progress: 3,
        maxProgress: 10,
        requirements: ["Create 10 campaigns", "Achieve 20%+ open rate"],
        rewards: [
          {
            type: "points",
            value: "100",
            description: "100 points earned",
          },
          {
            type: "feature",
            value: "Advanced Templates",
            description: "Unlock premium email templates",
          },
        ],
        marvinMessage:
          "3 down, 7 to go! Your campaigns are getting better each time! ✨",
      },
      {
        id: "marvin-buddy",
        title: "Marvin's Best Friend",
        description: "Interact with Marvin 50 times",
        icon: Sparkles,
        category: "marvin",
        rarity: "epic",
        points: 200,
        unlocked: false,
        progress: 23,
        maxProgress: 50,
        requirements: ["50 Marvin interactions", "Use Marvin suggestions"],
        rewards: [
          {
            type: "points",
            value: "200",
            description: "200 points earned",
          },
          {
            type: "feature",
            value: "Marvin Pro",
            description: "Unlock advanced Marvin AI features",
          },
        ],
        marvinMessage:
          "I love working with you! 23 interactions and counting! Let's keep this partnership going! 🤖💙",
      },
      {
        id: "conversion-king",
        title: "Conversion King",
        description: "Achieve 5% conversion rate across all campaigns",
        icon: Crown,
        category: "performance",
        rarity: "legendary",
        points: 500,
        unlocked: false,
        progress: 2.3,
        maxProgress: 5,
        requirements: ["5% conversion rate", "100+ conversions"],
        rewards: [
          {
            type: "points",
            value: "500",
            description: "500 points earned",
          },
          {
            type: "badge",
            value: "Conversion King",
            description: "Legendary status badge",
          },
          {
            type: "discount",
            value: "20%",
            description: "20% off next month's subscription",
          },
        ],
        marvinMessage:
          "2.3% is solid! With some optimization, you'll reach that 5% goal in no time! 👑",
      },
    ];

    const mockStreaks: Streak[] = [
      {
        type: "daily-login",
        current: 7,
        best: 15,
        lastActivity: new Date(),
      },
      {
        type: "campaigns-created",
        current: 3,
        best: 8,
        lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        type: "leads-contacted",
        current: 5,
        best: 12,
        lastActivity: new Date(Date.now() - 30 * 60 * 1000),
      },
      {
        type: "marvin-interactions",
        current: 2,
        best: 5,
        lastActivity: new Date(Date.now() - 10 * 60 * 1000),
      },
    ];

    setAchievements(mockAchievements);
    setStreaks(mockStreaks);

    // Check for newly unlocked achievements
    const newlyUnlocked = mockAchievements.filter(
      (a) =>
        a.unlocked &&
        a.unlockedAt &&
        new Date(a.unlockedAt).getTime() > Date.now() - 24 * 60 * 60 * 1000
    );

    if (newlyUnlocked.length > 0) {
      setRecentlyUnlocked(newlyUnlocked);
      setShowUnlocked(true);
    }
  }, [userId]);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "uncommon":
        return "bg-green-100 text-green-800 border-green-200";
      case "rare":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "epic":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "legendary":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case "common":
        return <Star className="w-4 h-4" />;
      case "uncommon":
        return <Gem className="w-4 h-4" />;
      case "rare":
        return <Award className="w-4 h-4" />;
      case "epic":
        return <Crown className="w-4 h-4" />;
      case "legendary":
        return <Trophy className="w-4 h-4" />;
      default:
        return <Star className="w-4 h-4" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "getting-started":
        return <Zap className="w-4 h-4" />;
      case "campaigns":
        return <Mail className="w-4 h-4" />;
      case "leads":
        return <Users className="w-4 h-4" />;
      case "performance":
        return <TrendingUp className="w-4 h-4" />;
      case "marvin":
        return <Sparkles className="w-4 h-4" />;
      case "milestone":
        return <Trophy className="w-4 h-4" />;
      default:
        return <Award className="w-4 h-4" />;
    }
  };

  const getStreakIcon = (type: string) => {
    switch (type) {
      case "daily-login":
        return <Calendar className="w-4 h-4" />;
      case "campaigns-created":
        return <Mail className="w-4 h-4" />;
      case "leads-contacted":
        return <Users className="w-4 h-4" />;
      case "marvin-interactions":
        return <Sparkles className="w-4 h-4" />;
      default:
        return <Flame className="w-4 h-4" />;
    }
  };

  const totalPoints = achievements
    .filter((a) => a.unlocked)
    .reduce((sum, a) => sum + a.points, 0);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;

  const handleAchievementClick = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    setShowModal(true);
  };

  const handleUnlockAchievement = (achievementId: string) => {
    setAchievements((prev) =>
      prev.map((a) =>
        a.id === achievementId
          ? { ...a, unlocked: true, unlockedAt: new Date() }
          : a
      )
    );

    const achievement = achievements.find((a) => a.id === achievementId);
    if (achievement) {
      addNotification({
        type: "achievement",
        title: "Achievement Unlocked!",
        message: `${achievement.title}: ${achievement.description}`,
        priority: "medium",
        category: "achievement",
        marvinInsight: achievement.marvinMessage,
        persistent: true,
      });
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Achievements</h2>
          <p className="text-gray-600">
            Track your progress and unlock rewards
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {totalPoints}
            </div>
            <div className="text-sm text-gray-500">Total Points</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {unlockedCount}/{totalCount}
            </div>
            <div className="text-sm text-gray-500">Achievements</div>
          </div>
        </div>
      </div>

      {/* Streaks */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {streaks.map((streak, index) => (
          <div
            key={index}
            className="bg-white rounded-xl p-4 border border-gray-200"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl flex items-center justify-center">
                {getStreakIcon(streak.type)}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900 capitalize">
                  {streak.type.replace("-", " ")}
                </div>
                <div className="text-2xl font-bold text-orange-600">
                  {streak.current}
                </div>
                <div className="text-xs text-gray-500">Best: {streak.best}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            onClick={() => handleAchievementClick(achievement)}
            className={`relative bg-white rounded-xl border-2 p-6 cursor-pointer transition-all duration-200 hover:shadow-lg ${
              achievement.unlocked
                ? "border-green-200 bg-green-50"
                : "border-gray-200 hover:border-blue-300"
            }`}
          >
            {/* Rarity Badge */}
            <div className="absolute top-4 right-4">
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border ${getRarityColor(
                  achievement.rarity
                )}`}
              >
                {getRarityIcon(achievement.rarity)}
                <span className="ml-1 capitalize">{achievement.rarity}</span>
              </span>
            </div>

            {/* Achievement Icon */}
            <div className="flex items-center space-x-4 mb-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  achievement.unlocked
                    ? "bg-gradient-to-br from-green-100 to-green-200"
                    : "bg-gradient-to-br from-gray-100 to-gray-200"
                }`}
              >
                {achievement.unlocked ? (
                  <achievement.icon className="w-6 h-6 text-green-600" />
                ) : (
                  <Lock className="w-6 h-6 text-gray-400" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {achievement.title}
                </h3>
                <p className="text-sm text-gray-500">
                  {achievement.points} points
                </p>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 mb-4">
              {achievement.description}
            </p>

            {/* Progress */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">Progress</span>
                <span className="font-medium text-gray-900">
                  {achievement.progress}/{achievement.maxProgress}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    achievement.unlocked
                      ? "bg-gradient-to-r from-green-400 to-green-500"
                      : "bg-gradient-to-r from-blue-400 to-blue-500"
                  }`}
                  style={{
                    width: `${
                      (achievement.progress / achievement.maxProgress) * 100
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* Requirements */}
            <div className="space-y-1">
              {achievement.requirements.map((requirement, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 text-xs text-gray-500"
                >
                  {achievement.unlocked ? (
                    <CheckCircle className="w-3 h-3 text-green-500" />
                  ) : (
                    <div className="w-3 h-3 border border-gray-300 rounded-full" />
                  )}
                  <span>{requirement}</span>
                </div>
              ))}
            </div>

            {/* Unlock Button */}
            {!achievement.unlocked &&
              achievement.progress >= achievement.maxProgress && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUnlockAchievement(achievement.id);
                  }}
                  className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors text-sm font-medium"
                >
                  Unlock Achievement
                </button>
              )}
          </div>
        ))}
      </div>

      {/* Achievement Detail Modal */}
      {showModal && selectedAchievement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                Achievement Details
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div
                  className={`w-16 h-16 rounded-xl flex items-center justify-center ${
                    selectedAchievement.unlocked
                      ? "bg-gradient-to-br from-green-100 to-green-200"
                      : "bg-gradient-to-br from-gray-100 to-gray-200"
                  }`}
                >
                  {selectedAchievement.unlocked ? (
                    <selectedAchievement.icon className="w-8 h-8 text-green-600" />
                  ) : (
                    <Lock className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">
                    {selectedAchievement.title}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {selectedAchievement.points} points
                  </p>
                </div>
              </div>

              <p className="text-gray-600">{selectedAchievement.description}</p>

              {selectedAchievement.marvinMessage && (
                <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <div className="flex items-start space-x-2">
                    <Sparkles className="w-4 h-4 text-blue-500 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-blue-900">
                        Marvin says:
                      </p>
                      <p className="text-sm text-blue-700">
                        {selectedAchievement.marvinMessage}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedAchievement.rewards && (
                <div>
                  <h5 className="font-semibold text-gray-900 mb-2">Rewards</h5>
                  <div className="space-y-2">
                    {selectedAchievement.rewards.map((reward, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 text-sm"
                      >
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-gray-700">
                          {reward.description}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recently Unlocked Modal */}
      {showUnlocked && recentlyUnlocked.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-10 h-10 text-yellow-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Achievement Unlocked!
              </h3>
              <p className="text-gray-600 mb-6">
                You've unlocked {recentlyUnlocked.length} new achievement
                {recentlyUnlocked.length > 1 ? "s" : ""}!
              </p>

              <div className="space-y-3">
                {recentlyUnlocked.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg"
                  >
                    <achievement.icon className="w-6 h-6 text-green-600" />
                    <div className="text-left">
                      <h4 className="font-semibold text-gray-900">
                        {achievement.title}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {achievement.points} points earned
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowUnlocked(false)}
                className="w-full mt-6 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors"
              >
                Awesome! Let's Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
