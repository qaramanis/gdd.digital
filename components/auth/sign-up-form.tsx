"use client";

import { useState } from "react";
import { signIn, signUp } from "@/lib/auth/auth-client";
import Link from "next/link";

export default function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);

  const handleSocialSignIn = async (provider: "google" | "github" | "gitlab") => {
    setSocialLoading(provider);
    try {
      await signIn.social({
        provider,
        callbackURL: "/dashboard",
      });
    } catch (error) {
      console.error(`${provider} sign in error:`, error);
    } finally {
      setSocialLoading(null);
    }
  };

  const handleEmailSignUp = async () => {
    setLoading(true);
    try {
      await signUp.email({
        email,
        password,
        name: name || email.split("@")[0],
        callbackURL: "/dashboard",
      });
    } catch (error) {
      console.error("Sign up error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center h-screen w-screen">
      <div className="h-150 w-250 rounded-xl flex items-center justify-center">
        <div className="w-110 h-full text-background bg-foreground/90 flex flex-col p-12 justify-between rounded-xl">
          <Link href="/">Logo</Link>
          <div>
            <div className="text-2xl font-bold">Sign Up</div>
            <div className="mb-8 text-accent">Create a new gdd.now account</div>
            <div className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Name (optional)"
                className="bg-accent/20 focus-within:bg-accent/30 outline-none transition-all duration-300 rounded-lg px-4 py-2"
                onChange={(e) => setName(e.target.value)}
                value={name}
              />
              <input
                type="email"
                placeholder="Email"
                className="bg-accent/20 focus-within:bg-accent/30 outline-none transition-all duration-300 rounded-lg px-4 py-2"
                required
                onChange={(e) => setEmail(e.target.value)}
                value={email}
              />
              <input
                type="password"
                placeholder="Password"
                className="bg-accent/20 focus-within:bg-accent/30 outline-none transition-all duration-300 rounded-lg px-4 py-2"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="submit"
                className="w-full h-10 text-foreground bg-background/85 hover:bg-background/75 flex items-center justify-center transition-all duration-300 rounded-lg"
                disabled={loading}
                onClick={handleEmailSignUp}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
                ) : (
                  "Create Account"
                )}
              </button>
            </div>
            <div className="w-full flex flex-row items-center justify-center text-center my-4">
              <div className="w-3/10 h-px bg-accent"></div>
              <div className="w-4/10 -mt-1 text-accent">or register via</div>
              <div className="w-3/10 h-px bg-accent"></div>
            </div>
            <div className="flex flex-row gap-2 items-center justify-center text-center my-4">
              <button
                onClick={() => handleSocialSignIn("google")}
                disabled={socialLoading !== null}
                className="w-full h-10 bg-accent/20 hover:bg-accent/30 disabled:opacity-50 flex items-center justify-center transition-all duration-300 rounded-lg cursor-pointer"
              >
                {socialLoading === "google" ? (
                  <div className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="1.2em"
                    height="1.2em"
                    viewBox="0 0 256 262"
                  >
                    <path
                      fill="#4285F4"
                      d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
                    ></path>
                    <path
                      fill="#34A853"
                      d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13l-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
                    ></path>
                    <path
                      fill="#FBBC05"
                      d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602z"
                    ></path>
                    <path
                      fill="#EB4335"
                      d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
                    ></path>
                  </svg>
                )}
              </button>
              <button
                onClick={() => handleSocialSignIn("github")}
                disabled={socialLoading !== null}
                className="w-full h-10 bg-accent/20 hover:bg-accent/30 disabled:opacity-50 flex items-center justify-center transition-all duration-300 rounded-lg cursor-pointer"
              >
                {socialLoading === "github" ? (
                  <div className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="1.5em"
                    height="1.5em"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="currentColor"
                      d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33s1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2"
                    ></path>
                  </svg>
                )}
              </button>
              <button
                onClick={() => handleSocialSignIn("gitlab")}
                disabled={socialLoading !== null}
                className="w-full h-10 bg-accent/20 hover:bg-accent/30 disabled:opacity-50 flex items-center justify-center transition-all duration-300 rounded-lg cursor-pointer"
              >
                {socialLoading === "gitlab" ? (
                  <div className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="3em"
                    height="3em"
                    viewBox="0 0 375 375"
                  >
                    <path
                      fill="#e24329"
                      d="M265.26416,174.37243l-.2134-.55822-21.19899-55.30908c-.4236-1.08359-1.18542-1.99642-2.17699-2.62689-.98837-.63373-2.14749-.93253-3.32305-.87014-1.1689.06239-2.29195.48925-3.20809,1.21821-.90957.73554-1.56629,1.73047-1.87493,2.85346l-14.31327,43.80662h-57.90965l-14.31327-43.80662c-.30864-1.12299-.96536-2.11791-1.87493-2.85346-.91614-.72895-2.03911-1.1558.20809-1.21821-1.17548-.06239-2.33468.23641-3.32297.87014-.99166.63047-1.75348,1.5433-2.17707,2.62689l-21.19891,55.31237-.21348.55493c-6.28158,16.38521-.92929,34.90803,13.05891,45.48782.02621.01641.04922.03611.07552.05582l.18719.14119,32.29094,24.17392,15.97151,12.09024,9.71951,7.34871c2.34117,1.77316,5.57877,1.77316,7.92002,0l9.71943-7.34871,15.96822-12.09024,32.48142-24.31511c.02958-.02299.05588-.04269.08538-.06568,13.97834-10.57977,19.32735-29.09604,13.04905-45.47796Z"
                    />
                    <path
                      fill="#fc6d26"
                      d="M265.26416,174.37243l-.2134-.55822c-10.5174,2.16062-20.20405,6.6099-28.49844,12.81593-.1346.0985-25.20497,19.05805-46.55171,35.19699,15.84998,11.98517,29.6477,22.40405,29.6477,22.40405l32.48142-24.31511c.02958-.02299.05588-.04269.08538-.06568,13.97834-10.57977,19.32735-29.09604,13.04905-45.47796Z"
                    />
                    <path
                      fill="#fca326"
                      d="M160.34962,244.23117l15.97151,12.09024,9.71951,7.34871c2.34117,1.77316,5.57877,1.77316,7.92002,0l9.71943-7.34871,15.96822-12.09024s-13.79772-10.41888-29.6477-22.40405c-15.85327,11.98517-29.65099,22.40405-29.65099,22.40405Z"
                    />
                    <path
                      fill="#fc6d26"
                      d="M143.44561,186.63014c-8.29111-6.20274-17.97446-10.65531-28.49507-12.81264l-.21348.55493c-6.28158,16.38521-.92929,34.90803,13.05891,45.48782.02621.01641.04922.03611.07552.05582l.18719.14119,32.29094,24.17392s13.79772-10.41888,29.65099-22.40405c-21.34673-16.13894-46.42031-35.09848-46.55499-35.19699Z"
                    />
                  </svg>
                )}
              </button>
            </div>
            <div className="text-center text-accent">
              Already have an account? Sign In{" "}
              <a
                href="/sign-in"
                className="text-background hover:text-secondary transition-all duration-300"
              >
                here
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
