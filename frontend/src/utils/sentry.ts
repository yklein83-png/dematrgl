/**
 * Configuration Sentry pour le tracking des erreurs frontend
 *
 * Installation:
 *   npm install @sentry/react @sentry/tracing
 *
 * Variables d'environnement:
 *   VITE_SENTRY_DSN - DSN Sentry pour le projet
 *   VITE_ENVIRONMENT - Environnement (development, staging, production)
 */

// Types pour Sentry (en attendant l'installation du package)
interface SentryConfig {
  dsn: string;
  environment: string;
  release?: string;
  tracesSampleRate: number;
  replaysSessionSampleRate: number;
  replaysOnErrorSampleRate: number;
}

interface SentryUser {
  id: string;
  email?: string;
  username?: string;
}

// Vérifier si Sentry est disponible
let sentryAvailable = false;
let Sentry: typeof import('@sentry/react') | null = null;

/**
 * Initialise Sentry pour le frontend
 */
export async function initSentry(): Promise<boolean> {
  const dsn = import.meta.env.VITE_SENTRY_DSN;

  if (!dsn) {
    console.info('Sentry DSN not configured, error tracking disabled');
    return false;
  }

  try {
    // Import dynamique de Sentry
    Sentry = await import('@sentry/react');

    const config: SentryConfig = {
      dsn,
      environment: import.meta.env.VITE_ENVIRONMENT || 'development',
      release: import.meta.env.VITE_APP_VERSION,
      tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
    };

    Sentry.init({
      dsn: config.dsn,
      environment: config.environment,
      release: config.release,
      tracesSampleRate: config.tracesSampleRate,

      // Intégrations
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],

      // Ne pas envoyer de données personnelles
      sendDefaultPii: false,

      // Filtrer les erreurs
      beforeSend(event, hint) {
        return filterEvent(event, hint);
      },

      // Filtrer les breadcrumbs
      beforeBreadcrumb(breadcrumb) {
        return filterBreadcrumb(breadcrumb);
      },
    });

    sentryAvailable = true;
    console.info(`Sentry initialized for environment: ${config.environment}`);
    return true;
  } catch (error) {
    console.error('Failed to initialize Sentry:', error);
    return false;
  }
}

/**
 * Filtre les événements avant envoi
 */
function filterEvent(event: Record<string, unknown>, hint: Record<string, unknown>): Record<string, unknown> | null {
  const error = hint.originalException as Error | undefined;

  // Ignorer certaines erreurs communes
  if (error) {
    const ignoredMessages = [
      'ResizeObserver loop',
      'Network request failed',
      'Load failed',
      'ChunkLoadError',
    ];

    const message = error.message || '';
    if (ignoredMessages.some((ignored) => message.includes(ignored))) {
      return null;
    }
  }

  // Supprimer les données sensibles des URLs
  if (event.request && typeof event.request === 'object') {
    const request = event.request as Record<string, unknown>;
    if (typeof request.url === 'string') {
      request.url = sanitizeUrl(request.url);
    }
  }

  return event;
}

/**
 * Filtre les breadcrumbs
 */
function filterBreadcrumb(breadcrumb: Record<string, unknown>): Record<string, unknown> | null {
  // Ignorer les requêtes vers les endpoints de health check
  if (breadcrumb.category === 'fetch' || breadcrumb.category === 'xhr') {
    const url = breadcrumb.data?.url as string | undefined;
    if (url && (url.includes('/health') || url.includes('/metrics'))) {
      return null;
    }
  }

  return breadcrumb;
}

/**
 * Supprime les tokens et données sensibles des URLs
 */
function sanitizeUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const sensitiveParams = ['token', 'access_token', 'refresh_token', 'api_key', 'password'];

    sensitiveParams.forEach((param) => {
      if (urlObj.searchParams.has(param)) {
        urlObj.searchParams.set(param, '[FILTERED]');
      }
    });

    return urlObj.toString();
  } catch {
    return url;
  }
}

/**
 * Capture une exception
 */
export function captureException(
  error: Error,
  context?: {
    tags?: Record<string, string>;
    extra?: Record<string, unknown>;
    user?: SentryUser;
  }
): string | undefined {
  if (!sentryAvailable || !Sentry) {
    console.error('Sentry not available, logging error locally:', error);
    return undefined;
  }

  return Sentry.withScope((scope) => {
    if (context?.tags) {
      Object.entries(context.tags).forEach(([key, value]) => {
        scope.setTag(key, value);
      });
    }

    if (context?.extra) {
      Object.entries(context.extra).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }

    if (context?.user) {
      scope.setUser(context.user);
    }

    return Sentry!.captureException(error);
  });
}

/**
 * Capture un message
 */
export function captureMessage(
  message: string,
  level: 'debug' | 'info' | 'warning' | 'error' | 'fatal' = 'info',
  context?: Record<string, unknown>
): string | undefined {
  if (!sentryAvailable || !Sentry) {
    console.log(`[${level}] ${message}`, context);
    return undefined;
  }

  return Sentry.withScope((scope) => {
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }
    return Sentry!.captureMessage(message, level);
  });
}

/**
 * Définit le contexte utilisateur
 */
export function setUser(user: SentryUser | null): void {
  if (!sentryAvailable || !Sentry) return;

  if (user) {
    Sentry.setUser(user);
  } else {
    Sentry.setUser(null);
  }
}

/**
 * Ajoute un breadcrumb personnalisé
 */
export function addBreadcrumb(
  message: string,
  category: string,
  level: 'debug' | 'info' | 'warning' | 'error' = 'info',
  data?: Record<string, unknown>
): void {
  if (!sentryAvailable || !Sentry) return;

  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data,
  });
}

/**
 * Wrapper ErrorBoundary Sentry
 * Utiliser à la place de notre ErrorBoundary personnalisé si Sentry est disponible
 */
export function getSentryErrorBoundary(): typeof import('@sentry/react').ErrorBoundary | null {
  if (!sentryAvailable || !Sentry) return null;
  return Sentry.ErrorBoundary;
}
