/**
 * Tour Progress Tracking System
 * Tracks which tours users have completed and manages tour state
 */

export interface TourState {
  tourId: string;
  completed: boolean;
  completedAt?: string;
  currentStep?: number;
  dismissed?: boolean;
}

export class TourProgress {
  private storageKey = "lumio-tour-progress";

  /**
   * Mark a tour as completed
   */
  markCompleted(tourId: string): void {
    const state = this.getTourState(tourId);
    state.completed = true;
    state.completedAt = new Date().toISOString();
    state.currentStep = undefined;
    this.saveTourState(tourId, state);

    // Track analytics event
    this.trackEvent("tour_completed", { tourId });
  }

  /**
   * Mark a tour as dismissed (user skipped it)
   */
  markDismissed(tourId: string): void {
    const state = this.getTourState(tourId);
    state.dismissed = true;
    this.saveTourState(tourId, state);

    this.trackEvent("tour_dismissed", { tourId });
  }

  /**
   * Save current step progress
   */
  saveProgress(tourId: string, currentStep: number): void {
    const state = this.getTourState(tourId);
    state.currentStep = currentStep;
    this.saveTourState(tourId, state);
  }

  /**
   * Check if tour should be shown
   */
  shouldShow(tourId: string): boolean {
    const state = this.getTourState(tourId);
    return !state.completed && !state.dismissed;
  }

  /**
   * Check if tour was completed
   */
  isCompleted(tourId: string): boolean {
    const state = this.getTourState(tourId);
    return state.completed;
  }

  /**
   * Reset a tour (allow re-watching)
   */
  reset(tourId: string): void {
    const allStates = this.getAllStates();
    delete allStates[tourId];
    this.saveAllStates(allStates);

    this.trackEvent("tour_reset", { tourId });
  }

  /**
   * Reset all tours
   */
  resetAll(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.storageKey);
    }
  }

  /**
   * Get tour state
   */
  getTourState(tourId: string): TourState {
    const allStates = this.getAllStates();
    return (
      allStates[tourId] || {
        tourId,
        completed: false,
      }
    );
  }

  /**
   * Get all tour states
   */
  private getAllStates(): Record<string, TourState> {
    if (typeof window === "undefined") return {};

    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error("Error loading tour progress:", error);
      return {};
    }
  }

  /**
   * Save tour state
   */
  private saveTourState(tourId: string, state: TourState): void {
    const allStates = this.getAllStates();
    allStates[tourId] = state;
    this.saveAllStates(allStates);
  }

  /**
   * Save all states
   */
  private saveAllStates(states: Record<string, TourState>): void {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(states));
    } catch (error) {
      console.error("Error saving tour progress:", error);
    }
  }

  /**
   * Track analytics event
   */
  private trackEvent(event: string, data: Record<string, any>): void {
    // Integration with analytics (Google Analytics, Mixpanel, etc.)
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", event, data);
    }

    // Console log for development
    if (process.env.NODE_ENV === "development") {
      console.log(`[Tour Analytics] ${event}:`, data);
    }
  }

  /**
   * Get completion stats
   */
  getStats(): {
    totalTours: number;
    completedTours: number;
    completionRate: number;
  } {
    const allStates = this.getAllStates();
    const states = Object.values(allStates);
    const completed = states.filter((s) => s.completed).length;

    return {
      totalTours: states.length,
      completedTours: completed,
      completionRate: states.length > 0 ? (completed / states.length) * 100 : 0,
    };
  }
}

// Global instance
export const tourProgress = new TourProgress();

