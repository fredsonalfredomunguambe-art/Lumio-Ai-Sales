import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import OnboardingPage from "@/components/onboarding/OnboardingPage";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { businessProfileSchema } from "@/lib/onboarding-validation";

// Mock do store
jest.mock("@/stores/onboardingStore");
jest.mock("@/lib/onboarding-analytics");
jest.mock("@/lib/onboarding-cache");
jest.mock("@/lib/onboarding-rate-limit");

const mockUseOnboardingStore = useOnboardingStore as jest.MockedFunction<
  typeof useOnboardingStore
>;

describe("OnboardingPage", () => {
  const mockStore = {
    currentStep: 0,
    businessProfile: {
      companyName: "",
      industry: "",
      businessType: "B2B",
      targetAudience: "",
      mainProduct: "",
      uniqueValue: "",
      goals: [],
      communicationStyle: "",
      brandTone: "",
      competitors: "",
      currentChallenges: "",
      budget: "",
      teamSize: "",
      experience: "",
    },
    steps: [
      {
        id: 0,
        title: "Welcome",
        description: "Welcome to Lumio",
        icon: "marvin",
        isCompleted: false,
        isRequired: false,
      },
      {
        id: 1,
        title: "Company Profile",
        description: "Tell us about your business",
        icon: "building",
        isCompleted: false,
        isRequired: true,
      },
    ],
    validationErrors: {},
    isValid: false,
    isLoading: false,
    isSaving: false,
    isGeneratingAI: false,
    setCurrentStep: jest.fn(),
    nextStep: jest.fn(),
    previousStep: jest.fn(),
    updateProfile: jest.fn(),
    validateStep: jest.fn(() => true),
    completeOnboarding: jest.fn(),
    setLoading: jest.fn(),
    setSaving: jest.fn(),
    setGeneratingAI: jest.fn(),
    getCompletionRate: jest.fn(() => 0),
  };

  beforeEach(() => {
    mockUseOnboardingStore.mockReturnValue(mockStore);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders welcome step correctly", () => {
      render(<OnboardingPage />);

      expect(screen.getByText("Welcome to Lumio!")).toBeInTheDocument();
      expect(
        screen.getByText("I'm Marvin, your AI SDR agent")
      ).toBeInTheDocument();
    });

    it("renders company profile step correctly", () => {
      mockUseOnboardingStore.mockReturnValue({
        ...mockStore,
        currentStep: 1,
      });

      render(<OnboardingPage />);

      expect(
        screen.getByText("Tell us about your company")
      ).toBeInTheDocument();
      expect(screen.getByLabelText("Company Name")).toBeInTheDocument();
      expect(screen.getByLabelText("Industry")).toBeInTheDocument();
    });

    it("renders target audience step correctly", () => {
      mockUseOnboardingStore.mockReturnValue({
        ...mockStore,
        currentStep: 2,
      });

      render(<OnboardingPage />);

      expect(
        screen.getByText("Who are your ideal customers?")
      ).toBeInTheDocument();
      expect(screen.getByLabelText("Target Audience")).toBeInTheDocument();
    });
  });

  describe("Navigation", () => {
    it("calls nextStep when Next button is clicked", () => {
      render(<OnboardingPage />);

      const nextButton = screen.getByText("Next");
      fireEvent.click(nextButton);

      expect(mockStore.nextStep).toHaveBeenCalled();
    });

    it("calls previousStep when Previous button is clicked", () => {
      mockUseOnboardingStore.mockReturnValue({
        ...mockStore,
        currentStep: 1,
      });

      render(<OnboardingPage />);

      const previousButton = screen.getByText("Previous");
      fireEvent.click(previousButton);

      expect(mockStore.previousStep).toHaveBeenCalled();
    });

    it("disables Next button when validation fails", () => {
      mockUseOnboardingStore.mockReturnValue({
        ...mockStore,
        validateStep: jest.fn(() => false),
      });

      render(<OnboardingPage />);

      const nextButton = screen.getByText("Next");
      expect(nextButton).toBeDisabled();
    });
  });

  describe("Form Interactions", () => {
    it("updates company name when input changes", () => {
      mockUseOnboardingStore.mockReturnValue({
        ...mockStore,
        currentStep: 1,
      });

      render(<OnboardingPage />);

      const companyNameInput = screen.getByLabelText("Company Name");
      fireEvent.change(companyNameInput, { target: { value: "Test Company" } });

      expect(mockStore.updateProfile).toHaveBeenCalledWith({
        companyName: "Test Company",
      });
    });

    it("updates industry when select changes", () => {
      mockUseOnboardingStore.mockReturnValue({
        ...mockStore,
        currentStep: 1,
      });

      render(<OnboardingPage />);

      const industrySelect = screen.getByLabelText("Industry");
      fireEvent.change(industrySelect, { target: { value: "Technology" } });

      expect(mockStore.updateProfile).toHaveBeenCalledWith({
        industry: "Technology",
      });
    });

    it("toggles goals when goal buttons are clicked", () => {
      mockUseOnboardingStore.mockReturnValue({
        ...mockStore,
        currentStep: 4,
      });

      render(<OnboardingPage />);

      const goalButton = screen.getByText("Increase Sales");
      fireEvent.click(goalButton);

      expect(mockStore.updateProfile).toHaveBeenCalled();
    });
  });

  describe("Validation", () => {
    it("shows validation errors when present", () => {
      mockUseOnboardingStore.mockReturnValue({
        ...mockStore,
        currentStep: 1,
        validationErrors: {
          companyName: "Company name is required",
        },
      });

      render(<OnboardingPage />);

      expect(screen.getByText("Company name is required")).toBeInTheDocument();
    });

    it("validates on input change when validateOnChange is true", async () => {
      mockUseOnboardingStore.mockReturnValue({
        ...mockStore,
        currentStep: 1,
      });

      render(<OnboardingPage />);

      const companyNameInput = screen.getByLabelText("Company Name");
      fireEvent.change(companyNameInput, { target: { value: "Test" } });

      await waitFor(() => {
        expect(mockStore.updateProfile).toHaveBeenCalled();
      });
    });
  });

  describe("AI Chat", () => {
    it("renders chat interface in demo step", () => {
      mockUseOnboardingStore.mockReturnValue({
        ...mockStore,
        currentStep: 6,
      });

      render(<OnboardingPage />);

      expect(
        screen.getByText("Test your personalized Marvin")
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText(
          "Ask Marvin anything about your business..."
        )
      ).toBeInTheDocument();
    });

    it("shows loading state when generating AI response", () => {
      mockUseOnboardingStore.mockReturnValue({
        ...mockStore,
        currentStep: 6,
        isGeneratingAI: true,
      });

      render(<OnboardingPage />);

      expect(screen.getByText("Marvin is thinking...")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA labels", () => {
      mockUseOnboardingStore.mockReturnValue({
        ...mockStore,
        currentStep: 1,
      });

      render(<OnboardingPage />);

      const companyNameInput = screen.getByLabelText("Company Name");
      expect(companyNameInput).toHaveAttribute("aria-required", "true");
    });

    it("shows keyboard shortcuts help", () => {
      render(<OnboardingPage />);

      const keyboardButton = screen.getByLabelText("Show keyboard shortcuts");
      fireEvent.click(keyboardButton);

      expect(screen.getByText("Keyboard Shortcuts")).toBeInTheDocument();
    });
  });

  describe("Progress", () => {
    it("shows progress indicator", () => {
      render(<OnboardingPage />);

      expect(screen.getByText("Progress")).toBeInTheDocument();
      expect(screen.getByText("1/2")).toBeInTheDocument();
    });

    it("updates progress when step changes", () => {
      mockUseOnboardingStore.mockReturnValue({
        ...mockStore,
        currentStep: 1,
      });

      render(<OnboardingPage />);

      expect(screen.getByText("2/2")).toBeInTheDocument();
    });
  });
});

describe("Business Profile Validation", () => {
  it("validates required fields", () => {
    const validProfile = {
      companyName: "Test Company",
      industry: "Technology",
      businessType: "B2B" as const,
      targetAudience: "Small business owners who need software solutions",
      mainProduct: "AI-powered CRM software",
      uniqueValue: "3x faster than competitors with 24/7 support",
      goals: ["Increase Sales", "Lead Generation"],
      communicationStyle: "friendly",
      brandTone: "helpful",
      competitors: "Company A, Company B",
      currentChallenges: "Manual processes and low lead quality",
      budget: "$1K-$5K",
      teamSize: "6-20",
      experience: "Intermediate",
    };

    const result = businessProfileSchema.safeParse(validProfile);
    expect(result.success).toBe(true);
  });

  it("fails validation for missing required fields", () => {
    const invalidProfile = {
      companyName: "",
      industry: "",
      businessType: "B2B" as const,
      targetAudience: "",
      mainProduct: "",
      uniqueValue: "",
      goals: [],
      communicationStyle: "",
      brandTone: "",
      competitors: "",
      currentChallenges: "",
      budget: "",
      teamSize: "",
      experience: "",
    };

    const result = businessProfileSchema.safeParse(invalidProfile);
    expect(result.success).toBe(false);
  });

  it("validates field lengths", () => {
    const profileWithLongName = {
      companyName: "A".repeat(101), // Too long
      industry: "Technology",
      businessType: "B2B" as const,
      targetAudience: "Small business owners",
      mainProduct: "Software",
      uniqueValue: "Good software",
      goals: ["Increase Sales"],
      communicationStyle: "friendly",
      brandTone: "helpful",
      competitors: "",
      currentChallenges: "Manual processes",
      budget: "",
      teamSize: "",
      experience: "",
    };

    const result = businessProfileSchema.safeParse(profileWithLongName);
    expect(result.success).toBe(false);
  });
});

describe("Error Handling", () => {
  it("handles API errors gracefully", async () => {
    // Mock fetch to return error
    global.fetch = jest.fn().mockRejectedValue(new Error("API Error"));

    mockUseOnboardingStore.mockReturnValue({
      ...mockStore,
      currentStep: 6,
    });

    render(<OnboardingPage />);

    const testButton = screen.getByText("Test Sample Questions");
    fireEvent.click(testButton);

    await waitFor(() => {
      expect(
        screen.getByText(/Desculpe, não consegui gerar uma resposta/)
      ).toBeInTheDocument();
    });
  });

  it("shows loading states during operations", () => {
    mockUseOnboardingStore.mockReturnValue({
      ...mockStore,
      isLoading: true,
    });

    render(<OnboardingPage />);

    expect(screen.getByText("Loading onboarding data...")).toBeInTheDocument();
  });
});

describe("Performance", () => {
  it("renders without performance issues", () => {
    const startTime = performance.now();

    render(<OnboardingPage />);

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    // Should render in less than 100ms
    expect(renderTime).toBeLessThan(100);
  });

  it("handles large datasets efficiently", () => {
    const largeProfile = {
      ...mockStore.businessProfile,
      goals: Array(100).fill("Test Goal"),
    };

    mockUseOnboardingStore.mockReturnValue({
      ...mockStore,
      businessProfile: largeProfile,
      currentStep: 4,
    });

    const startTime = performance.now();
    render(<OnboardingPage />);
    const endTime = performance.now();

    expect(endTime - startTime).toBeLessThan(200);
  });
});
