import { toast } from "react-hot-toast";

export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  context?: string;
  severity: "low" | "medium" | "high" | "critical";
  recoverable: boolean;
  retryable: boolean;
}

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  step?: number;
  data?: any;
}

// Tipos de erro específicos
export enum ErrorType {
  VALIDATION_ERROR = "VALIDATION_ERROR",
  NETWORK_ERROR = "NETWORK_ERROR",
  API_ERROR = "API_ERROR",
  AUTH_ERROR = "AUTH_ERROR",
  RATE_LIMIT_ERROR = "RATE_LIMIT_ERROR",
  TIMEOUT_ERROR = "TIMEOUT_ERROR",
  STORAGE_ERROR = "STORAGE_ERROR",
  AI_ERROR = "AI_ERROR",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

// Códigos de erro específicos
export enum ErrorCode {
  // Validação
  INVALID_INPUT = "INVALID_INPUT",
  REQUIRED_FIELD_MISSING = "REQUIRED_FIELD_MISSING",
  INVALID_FORMAT = "INVALID_FORMAT",

  // Rede
  NETWORK_UNAVAILABLE = "NETWORK_UNAVAILABLE",
  CONNECTION_TIMEOUT = "CONNECTION_TIMEOUT",
  REQUEST_FAILED = "REQUEST_FAILED",

  // API
  API_UNAVAILABLE = "API_UNAVAILABLE",
  API_RATE_LIMITED = "API_RATE_LIMITED",
  API_UNAUTHORIZED = "API_UNAUTHORIZED",
  API_FORBIDDEN = "API_FORBIDDEN",
  API_NOT_FOUND = "API_NOT_FOUND",
  API_SERVER_ERROR = "API_SERVER_ERROR",

  // Autenticação
  AUTH_EXPIRED = "AUTH_EXPIRED",
  AUTH_INVALID = "AUTH_INVALID",
  AUTH_REQUIRED = "AUTH_REQUIRED",

  // IA
  AI_UNAVAILABLE = "AI_UNAVAILABLE",
  AI_RATE_LIMITED = "AI_RATE_LIMITED",
  AI_INVALID_RESPONSE = "AI_INVALID_RESPONSE",
  AI_TIMEOUT = "AI_TIMEOUT",

  // Armazenamento
  STORAGE_FULL = "STORAGE_FULL",
  STORAGE_UNAVAILABLE = "STORAGE_UNAVAILABLE",
  STORAGE_CORRUPTED = "STORAGE_CORRUPTED",
}

// Configurações de erro
const ERROR_CONFIGS: Record<
  ErrorCode,
  {
    message: string;
    severity: AppError["severity"];
    recoverable: boolean;
    retryable: boolean;
    showToast: boolean;
    toastDuration?: number;
  }
> = {
  [ErrorCode.INVALID_INPUT]: {
    message: "Dados inválidos fornecidos",
    severity: "low",
    recoverable: true,
    retryable: false,
    showToast: true,
    toastDuration: 3000,
  },
  [ErrorCode.REQUIRED_FIELD_MISSING]: {
    message: "Campo obrigatório não preenchido",
    severity: "low",
    recoverable: true,
    retryable: false,
    showToast: true,
    toastDuration: 3000,
  },
  [ErrorCode.INVALID_FORMAT]: {
    message: "Formato inválido",
    severity: "low",
    recoverable: true,
    retryable: false,
    showToast: true,
    toastDuration: 3000,
  },
  [ErrorCode.NETWORK_UNAVAILABLE]: {
    message: "Conexão com a internet indisponível",
    severity: "high",
    recoverable: true,
    retryable: true,
    showToast: true,
    toastDuration: 5000,
  },
  [ErrorCode.CONNECTION_TIMEOUT]: {
    message: "Tempo limite de conexão excedido",
    severity: "medium",
    recoverable: true,
    retryable: true,
    showToast: true,
    toastDuration: 4000,
  },
  [ErrorCode.REQUEST_FAILED]: {
    message: "Falha na requisição",
    severity: "medium",
    recoverable: true,
    retryable: true,
    showToast: true,
    toastDuration: 4000,
  },
  [ErrorCode.API_UNAVAILABLE]: {
    message: "Serviço temporariamente indisponível",
    severity: "high",
    recoverable: true,
    retryable: true,
    showToast: true,
    toastDuration: 5000,
  },
  [ErrorCode.API_RATE_LIMITED]: {
    message: "Muitas requisições. Tente novamente em alguns minutos",
    severity: "medium",
    recoverable: true,
    retryable: true,
    showToast: true,
    toastDuration: 6000,
  },
  [ErrorCode.API_UNAUTHORIZED]: {
    message: "Sessão expirada. Faça login novamente",
    severity: "high",
    recoverable: true,
    retryable: false,
    showToast: true,
    toastDuration: 5000,
  },
  [ErrorCode.API_FORBIDDEN]: {
    message: "Acesso negado",
    severity: "high",
    recoverable: false,
    retryable: false,
    showToast: true,
    toastDuration: 5000,
  },
  [ErrorCode.API_NOT_FOUND]: {
    message: "Recurso não encontrado",
    severity: "medium",
    recoverable: false,
    retryable: false,
    showToast: true,
    toastDuration: 4000,
  },
  [ErrorCode.API_SERVER_ERROR]: {
    message: "Erro interno do servidor",
    severity: "high",
    recoverable: true,
    retryable: true,
    showToast: true,
    toastDuration: 5000,
  },
  [ErrorCode.AUTH_EXPIRED]: {
    message: "Sessão expirada. Faça login novamente",
    severity: "high",
    recoverable: true,
    retryable: false,
    showToast: true,
    toastDuration: 5000,
  },
  [ErrorCode.AUTH_INVALID]: {
    message: "Credenciais inválidas",
    severity: "high",
    recoverable: true,
    retryable: false,
    showToast: true,
    toastDuration: 5000,
  },
  [ErrorCode.AUTH_REQUIRED]: {
    message: "Login necessário",
    severity: "high",
    recoverable: true,
    retryable: false,
    showToast: true,
    toastDuration: 5000,
  },
  [ErrorCode.AI_UNAVAILABLE]: {
    message: "Serviço de IA temporariamente indisponível",
    severity: "medium",
    recoverable: true,
    retryable: true,
    showToast: true,
    toastDuration: 5000,
  },
  [ErrorCode.AI_RATE_LIMITED]: {
    message: "Limite de uso da IA excedido. Tente novamente em alguns minutos",
    severity: "medium",
    recoverable: true,
    retryable: true,
    showToast: true,
    toastDuration: 6000,
  },
  [ErrorCode.AI_INVALID_RESPONSE]: {
    message: "Resposta inválida da IA",
    severity: "medium",
    recoverable: true,
    retryable: true,
    showToast: true,
    toastDuration: 4000,
  },
  [ErrorCode.AI_TIMEOUT]: {
    message: "Tempo limite da IA excedido",
    severity: "medium",
    recoverable: true,
    retryable: true,
    showToast: true,
    toastDuration: 4000,
  },
  [ErrorCode.STORAGE_FULL]: {
    message: "Armazenamento local cheio",
    severity: "medium",
    recoverable: true,
    retryable: false,
    showToast: true,
    toastDuration: 5000,
  },
  [ErrorCode.STORAGE_UNAVAILABLE]: {
    message: "Armazenamento local indisponível",
    severity: "medium",
    recoverable: true,
    retryable: true,
    showToast: true,
    toastDuration: 4000,
  },
  [ErrorCode.STORAGE_CORRUPTED]: {
    message: "Dados corrompidos. Reiniciando armazenamento",
    severity: "high",
    recoverable: true,
    retryable: false,
    showToast: true,
    toastDuration: 5000,
  },
};

// Classe principal de tratamento de erros
export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLog: AppError[] = [];
  private maxLogSize = 100;

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  // Criar erro personalizado
  createError(
    code: ErrorCode,
    message?: string,
    details?: any,
    context?: ErrorContext
  ): AppError {
    const config = ERROR_CONFIGS[code];
    const error: AppError = {
      code,
      message: message || config.message,
      details,
      timestamp: new Date(),
      context: context?.component || "Unknown",
      severity: config.severity,
      recoverable: config.recoverable,
      retryable: config.retryable,
    };

    this.logError(error);
    return error;
  }

  // Tratar erro de rede
  handleNetworkError(error: any, context?: ErrorContext): AppError {
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      return this.createError(
        ErrorCode.NETWORK_UNAVAILABLE,
        undefined,
        error,
        context
      );
    }

    if (error.name === "AbortError") {
      return this.createError(
        ErrorCode.CONNECTION_TIMEOUT,
        undefined,
        error,
        context
      );
    }

    return this.createError(
      ErrorCode.REQUEST_FAILED,
      error.message,
      error,
      context
    );
  }

  // Tratar erro de API
  handleApiError(response: Response, context?: ErrorContext): AppError {
    switch (response.status) {
      case 400:
        return this.createError(
          ErrorCode.INVALID_INPUT,
          "Dados inválidos",
          { status: response.status },
          context
        );
      case 401:
        return this.createError(
          ErrorCode.API_UNAUTHORIZED,
          undefined,
          { status: response.status },
          context
        );
      case 403:
        return this.createError(
          ErrorCode.API_FORBIDDEN,
          undefined,
          { status: response.status },
          context
        );
      case 404:
        return this.createError(
          ErrorCode.API_NOT_FOUND,
          undefined,
          { status: response.status },
          context
        );
      case 429:
        return this.createError(
          ErrorCode.API_RATE_LIMITED,
          undefined,
          { status: response.status },
          context
        );
      case 500:
      case 502:
      case 503:
      case 504:
        return this.createError(
          ErrorCode.API_SERVER_ERROR,
          undefined,
          { status: response.status },
          context
        );
      default:
        return this.createError(
          ErrorCode.API_SERVER_ERROR,
          `Erro HTTP ${response.status}`,
          { status: response.status },
          context
        );
    }
  }

  // Tratar erro de validação
  handleValidationError(
    errors: Record<string, string>,
    context?: ErrorContext
  ): AppError {
    return this.createError(
      ErrorCode.INVALID_INPUT,
      "Dados de validação inválidos",
      { errors },
      context
    );
  }

  // Tratar erro de IA
  handleAIError(error: any, context?: ErrorContext): AppError {
    if (error.message?.includes("rate limit")) {
      return this.createError(
        ErrorCode.AI_RATE_LIMITED,
        undefined,
        error,
        context
      );
    }

    if (error.message?.includes("timeout")) {
      return this.createError(ErrorCode.AI_TIMEOUT, undefined, error, context);
    }

    if (error.message?.includes("invalid response")) {
      return this.createError(
        ErrorCode.AI_INVALID_RESPONSE,
        undefined,
        error,
        context
      );
    }

    return this.createError(
      ErrorCode.AI_UNAVAILABLE,
      error.message,
      error,
      context
    );
  }

  // Log de erro
  private logError(error: AppError): void {
    this.errorLog.push(error);

    // Manter apenas os últimos N erros
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(-this.maxLogSize);
    }

    // Log para console em desenvolvimento
    if (process.env.NODE_ENV === "development") {
      console.error("Error logged:", error);
    }

    // Enviar para serviço de monitoramento em produção
    if (process.env.NODE_ENV === "production") {
      this.sendToMonitoring(error);
    }
  }

  // Enviar para serviço de monitoramento
  private sendToMonitoring(error: AppError): void {
    // Implementar integração com Sentry, LogRocket, etc.
    if (typeof window !== "undefined" && window.Sentry) {
      window.Sentry.captureException(new Error(error.message), {
        extra: {
          code: error.code,
          details: error.details,
          context: error.context,
          severity: error.severity,
        },
      });
    }
  }

  // Mostrar erro para o usuário
  showError(error: AppError): void {
    const config = ERROR_CONFIGS[error.code as ErrorCode];

    if (config.showToast) {
      toast.error(error.message, {
        duration: config.toastDuration || 4000,
        position: "top-right",
      });
    }
  }

  // Mostrar erro com ação de retry
  showErrorWithRetry(error: AppError, onRetry: () => void): void {
    const config = ERROR_CONFIGS[error.code as ErrorCode];

    if (config.showToast) {
      toast.error(error.message, {
        duration: config.toastDuration || 6000,
        position: "top-right",
      });
    }
  }

  // Obter histórico de erros
  getErrorLog(): AppError[] {
    return [...this.errorLog];
  }

  // Limpar log de erros
  clearErrorLog(): void {
    this.errorLog = [];
  }

  // Obter estatísticas de erro
  getErrorStats(): {
    total: number;
    bySeverity: Record<string, number>;
    byCode: Record<string, number>;
    recent: AppError[];
  } {
    const bySeverity = this.errorLog.reduce((acc, error) => {
      acc[error.severity] = (acc[error.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byCode = this.errorLog.reduce((acc, error) => {
      acc[error.code] = (acc[error.code] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: this.errorLog.length,
      bySeverity,
      byCode,
      recent: this.errorLog.slice(-10),
    };
  }
}

// Instância global
export const errorHandler = ErrorHandler.getInstance();

// Hook para usar o error handler
export function useErrorHandler() {
  return {
    createError: errorHandler.createError.bind(errorHandler),
    handleNetworkError: errorHandler.handleNetworkError.bind(errorHandler),
    handleApiError: errorHandler.handleApiError.bind(errorHandler),
    handleValidationError:
      errorHandler.handleValidationError.bind(errorHandler),
    handleAIError: errorHandler.handleAIError.bind(errorHandler),
    showError: errorHandler.showError.bind(errorHandler),
    showErrorWithRetry: errorHandler.showErrorWithRetry.bind(errorHandler),
    getErrorLog: errorHandler.getErrorLog.bind(errorHandler),
    getErrorStats: errorHandler.getErrorStats.bind(errorHandler),
  };
}

// Função utilitária para tratar erros em async functions
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  context?: ErrorContext
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    const appError = errorHandler.handleNetworkError(error, context);
    errorHandler.showError(appError);
    return null;
  }
}

// Função utilitária para tratar erros com retry
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000,
  context?: ErrorContext
): Promise<T | null> {
  let lastError: AppError | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = errorHandler.handleNetworkError(error, context);

      if (!lastError.retryable || i === maxRetries - 1) {
        break;
      }

      // Aguardar antes de tentar novamente
      await new Promise((resolve) =>
        setTimeout(resolve, delay * Math.pow(2, i))
      );
    }
  }

  if (lastError) {
    errorHandler.showError(lastError);
  }

  return null;
}
