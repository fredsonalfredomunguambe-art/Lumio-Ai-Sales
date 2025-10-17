import { SignUp } from "@clerk/nextjs";
import Image from "next/image";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left Section - Background Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <Image
          src="/fotos/91.png"
          alt="Background"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Right Section - Form */}
      <div className="flex-1 bg-white flex items-center justify-center">
        <div className="w-full max-w-md px-8 py-12">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 font-outfit">
              Create Account
            </h1>
            <p className="text-gray-600 font-inter">
              Transform your marketing with AI
            </p>
          </div>

          {/* Sign Up Form */}
          <div className="space-y-8">
            <SignUp
              appearance={{
                elements: {
                  formButtonPrimary:
                    "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-xl w-full text-lg shadow-lg hover:shadow-xl transition-all duration-200 font-outfit",
                  card: "bg-transparent shadow-none",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  socialButtonsBlockButton:
                    "bg-white text-gray-700 font-medium py-3 px-6 rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:text-blue-600 w-full shadow-sm hover:shadow-md transition-all duration-200 font-outfit",
                  formFieldInput:
                    "bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200 font-inter",
                  formFieldLabel:
                    "text-gray-700 font-semibold text-sm font-outfit",
                  footerActionLink:
                    "text-blue-600 hover:text-blue-700 font-semibold font-outfit",
                  dividerLine: "bg-gray-200",
                  dividerText: "text-gray-500 font-medium font-inter",
                },
              }}
            />
          </div>

          {/* Trust Indicators */}
          <div className="mt-10 text-center">
            <div className="flex items-center justify-center space-x-6 text-xs text-gray-400">
              <div className="flex items-center space-x-1">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-inter">SSL Secure</span>
              </div>
              <div className="flex items-center space-x-1">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-inter">GDPR Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
