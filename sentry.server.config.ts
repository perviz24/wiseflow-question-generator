import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: "https://679bd1e56b89abf3864cf8cf60c85503@o4510636919947264.ingest.de.sentry.io/4510885912248400",

  // Only send errors in production
  enabled: process.env.NODE_ENV === "production",

  // Sample 100% of errors
  sampleRate: 1.0,

  // Performance monitoring — sample 20% of transactions
  tracesSampleRate: 0.2,
})
