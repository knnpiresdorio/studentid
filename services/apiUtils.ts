/**
 * Utility for handling API interactions with resilience.
 */

export class ServiceError extends Error {
    public serviceName: string;
    public operation: string;
    public originalError: any;

    constructor(serviceName: string, operation: string, originalError: any) {
        super(`Erro no serviço ${serviceName} durante ${operation}: ${originalError.message || originalError}`);
        this.name = 'ServiceError';
        this.serviceName = serviceName;
        this.operation = operation;
        this.originalError = originalError;
    }
}

interface RetryOptions {
    retries?: number;
    delay?: number;
    backoff?: number;
}

/**
 * Retries an async operation with exponential backoff.
 * @param operation The async function to execute.
 * @param options Retry configuration { retries, delay, backoff }.
 * @returns The result of the operation.
 */
export async function retryOperation<T>(
    operation: () => Promise<T>,
    options: RetryOptions = {}
): Promise<T> {
    const { retries = 3, delay = 1000, backoff = 2 } = options;

    let lastError: any;
    let currentDelay = delay;

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error;
            console.warn(`Tentativa ${attempt}/${retries} falhou:`, error);

            if (attempt < retries) {
                await new Promise(resolve => setTimeout(resolve, currentDelay));
                currentDelay *= backoff;
            }
        }
    }

    throw lastError;
}
