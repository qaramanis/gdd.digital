import { betterAuth } from "better-auth";
import { Pool } from "pg";

const isProduction = process.env.NODE_ENV === "production";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL,
  emailAndPassword: {
    enabled: true,
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google", "github", "gitlab"],
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      redirectURI: isProduction
        ? "https://gdd.digital/api/auth/callback/google"
        : "http://localhost:3000/api/auth/callback/google",
      enabled: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
      enabled: !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET),
    },
    gitlab: {
      clientId: process.env.GITLAB_CLIENT_ID || "",
      clientSecret: process.env.GITLAB_CLIENT_SECRET || "",
      enabled: !!(process.env.GITLAB_CLIENT_ID && process.env.GITLAB_CLIENT_SECRET),
    },
  },
  database: new Pool({
    connectionString: process.env.DATABASE_URL!,
    ssl: isProduction ? { rejectUnauthorized: false } : false,
  }),
  secret: process.env.BETTER_AUTH_SECRET,
  advanced: {
    cookiePrefix: "better-auth",
    useSecureCookies: isProduction,
  },
  trustedOrigins: isProduction
    ? ["https://gdd.digital"]
    : ["http://localhost:3000"],
});
