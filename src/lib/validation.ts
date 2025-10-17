// Data validation and sanitization utilities

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitized?: any;
}

// Sanitize HTML content to prevent XSS
export function sanitizeHtml(content: string): string {
  if (!content) return "";

  // Remove script tags and their content
  content = content.replace(/<script[^>]*>.*?<\/script>/gi, "");

  // Remove dangerous attributes
  content = content.replace(/\s(on\w+|javascript:|data:)="[^"]*"/gi, "");
  content = content.replace(/\s(on\w+|javascript:|data:)='[^']*'/gi, "");

  // Allow only safe HTML tags
  const allowedTags = [
    "p",
    "br",
    "strong",
    "em",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "ul",
    "ol",
    "li",
    "div",
    "span",
    "code",
    "pre",
    "blockquote",
  ];

  const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)[^>]*>/g;
  content = content.replace(tagRegex, (match, tagName) => {
    if (allowedTags.includes(tagName.toLowerCase())) {
      return match;
    }
    return "";
  });

  return content.trim();
}

// Validate task data
export function validateTask(data: any): ValidationResult {
  const errors: string[] = [];

  // Title validation
  if (!data.title || typeof data.title !== "string") {
    errors.push("Title is required and must be a string");
  } else if (data.title.trim().length === 0) {
    errors.push("Title cannot be empty");
  } else if (data.title.length > 200) {
    errors.push("Title must be less than 200 characters");
  }

  // Description validation
  if (data.description && typeof data.description !== "string") {
    errors.push("Description must be a string");
  } else if (data.description && data.description.length > 2000) {
    errors.push("Description must be less than 2000 characters");
  }

  // Priority validation
  const validPriorities = ["LOW", "MEDIUM", "HIGH"];
  if (data.priority && !validPriorities.includes(data.priority)) {
    errors.push("Priority must be one of: LOW, MEDIUM, HIGH");
  }

  // Status validation
  const validStatuses = ["TODO", "IN_PROGRESS", "DONE"];
  if (data.status && !validStatuses.includes(data.status)) {
    errors.push("Status must be one of: TODO, IN_PROGRESS, DONE");
  }

  // Due date validation
  if (data.dueDate) {
    const date = new Date(data.dueDate);
    if (isNaN(date.getTime())) {
      errors.push("Due date must be a valid date");
    } else if (date < new Date(Date.now() - 24 * 60 * 60 * 1000)) {
      // Allow dates from yesterday onwards
      errors.push("Due date cannot be more than 1 day in the past");
    }
  }

  // Order validation
  if (data.order !== undefined) {
    if (typeof data.order !== "number" || data.order < 0) {
      errors.push("Order must be a non-negative number");
    }
  }

  const sanitized = {
    title: data.title ? data.title.trim().slice(0, 200) : "",
    description: data.description
      ? sanitizeHtml(data.description.trim().slice(0, 2000))
      : undefined,
    priority: data.priority || "MEDIUM",
    status: data.status || "TODO",
    dueDate: data.dueDate || undefined,
    order: typeof data.order === "number" ? Math.max(0, data.order) : undefined,
  };

  return {
    isValid: errors.length === 0,
    errors,
    sanitized: errors.length === 0 ? sanitized : undefined,
  };
}

// Validate Marvin AI input
export function validateMarvinInput(data: any): ValidationResult {
  const errors: string[] = [];

  // Message validation
  if (data.message && typeof data.message !== "string") {
    errors.push("Message must be a string");
  } else if (data.message && data.message.length > 5000) {
    errors.push("Message must be less than 5000 characters");
  }

  // Mode validation
  const validModes = ["chat", "insights", "calendar_insights"];
  if (data.mode && !validModes.includes(data.mode)) {
    errors.push("Mode must be one of: chat, insights, calendar_insights");
  }

  // Tasks validation
  if (data.tasks && !Array.isArray(data.tasks)) {
    errors.push("Tasks must be an array");
  } else if (data.tasks && data.tasks.length > 200) {
    errors.push("Too many tasks provided (max 200)");
  }

  // Events validation
  if (data.events && !Array.isArray(data.events)) {
    errors.push("Events must be an array");
  } else if (data.events && data.events.length > 300) {
    errors.push("Too many events provided (max 300)");
  }

  // UserName validation
  if (data.userName && typeof data.userName !== "string") {
    errors.push("UserName must be a string");
  } else if (data.userName && data.userName.length > 100) {
    errors.push("UserName must be less than 100 characters");
  }

  const sanitized = {
    message: data.message
      ? sanitizeHtml(data.message.trim().slice(0, 5000))
      : undefined,
    mode: data.mode || "chat",
    tasks: Array.isArray(data.tasks) ? data.tasks.slice(0, 200) : [],
    events: Array.isArray(data.events) ? data.events.slice(0, 300) : [],
    userName: data.userName ? data.userName.trim().slice(0, 100) : undefined,
    stream: typeof data.stream === "boolean" ? Boolean(data.stream) : undefined,
  };

  return {
    isValid: errors.length === 0,
    errors,
    sanitized: errors.length === 0 ? sanitized : undefined,
  };
}

// Validate AI response
export function validateAIResponse(response: string): ValidationResult {
  const errors: string[] = [];

  if (!response || typeof response !== "string") {
    errors.push("Response must be a non-empty string");
  } else if (response.trim().length === 0) {
    errors.push("Response cannot be empty");
  } else if (response.length > 50000) {
    errors.push("Response too long (max 50000 characters)");
  }

  // Check for potential security issues
  if (response.includes("<script")) {
    errors.push("Response contains potentially dangerous content");
  }

  const sanitized = response ? sanitizeHtml(response.trim()) : "";

  return {
    isValid: errors.length === 0,
    errors,
    sanitized: errors.length === 0 ? sanitized : undefined,
  };
}

// Rate limiting validation
export function validateRateLimit(
  requests: number,
  windowMs: number,
  limit: number
): ValidationResult {
  const errors: string[] = [];

  if (requests > limit) {
    errors.push(
      `Rate limit exceeded: ${requests}/${limit} requests in ${Math.ceil(
        windowMs / 1000
      )}s`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// General purpose input sanitization
export function sanitizeInput(input: any, maxLength: number = 1000): string {
  if (typeof input !== "string") {
    return String(input).slice(0, maxLength);
  }

  return sanitizeHtml(input.trim().slice(0, maxLength));
}

// Email validation
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// URL validation
export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Safe JSON parsing
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

// Validate file upload
export function validateFileUpload(
  file: File,
  options: {
    maxSize?: number;
    allowedTypes?: string[];
    allowedExtensions?: string[];
  }
): ValidationResult {
  const errors: string[] = [];
  const {
    maxSize = 5 * 1024 * 1024,
    allowedTypes = [],
    allowedExtensions = [],
  } = options;

  if (file.size > maxSize) {
    errors.push(
      `File size too large (max ${Math.round(maxSize / 1024 / 1024)}MB)`
    );
  }

  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    errors.push(`File type not allowed (allowed: ${allowedTypes.join(", ")})`);
  }

  if (allowedExtensions.length > 0) {
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!extension || !allowedExtensions.includes(extension)) {
      errors.push(
        `File extension not allowed (allowed: ${allowedExtensions.join(", ")})`
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Database query validation
export function validateDatabaseInput(input: any): ValidationResult {
  const errors: string[] = [];

  // Check for SQL injection patterns
  const sqlPatterns = [
    /('|(\\')|(;|\\;)|(--|\-\-)|(\/\*|\*\/))/i,
    /(exec|execute|sp_|xp_)/i,
    /(union|select|insert|update|delete|drop|create|alter)/i,
  ];

  const inputStr = String(input).toLowerCase();

  for (const pattern of sqlPatterns) {
    if (pattern.test(inputStr)) {
      errors.push("Input contains potentially dangerous SQL patterns");
      break;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized: errors.length === 0 ? input : undefined,
  };
}
