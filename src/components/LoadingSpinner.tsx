import React from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  className = "",
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`${sizeClasses[size]} relative`}>
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-2 border-gray-200 border-t-blue-600 animate-spin"></div>

        {/* Inner ring */}
        <div
          className="absolute inset-1 rounded-full border-2 border-gray-100 border-t-indigo-500 animate-spin"
          style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
        ></div>

        {/* Center dot */}
        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 animate-pulse"></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
