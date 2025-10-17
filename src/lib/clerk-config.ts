export const clerkConfig = {
  publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!,
  signInUrl: "/sign-in",
  signUpUrl: "/sign-up",
  afterSignInUrl: "/dashboard",
  afterSignUpUrl: "/dashboard",
  // Configurações de aparência
  appearance: {
    baseTheme: "light",
    variables: {
      colorPrimary: "#3b82f6",
      colorBackground: "#ffffff",
      colorInputBackground: "#f9fafb",
      colorInputText: "#111827",
      colorText: "#111827",
      colorTextSecondary: "#6b7280",
      colorSuccess: "#10b981",
      colorDanger: "#ef4444",
      colorWarning: "#f59e0b",
    },
  },
};
