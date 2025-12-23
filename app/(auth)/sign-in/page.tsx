import { Suspense } from "react";
import SignInForm from "@/components/auth/sign-in-form";

function SignInFormFallback() {
  return (
    <div className="relative flex items-center justify-center h-screen w-screen">
      <div className="h-150 w-250 rounded-xl flex items-center justify-center">
        <div className="w-110 h-full text-background bg-foreground/90 flex flex-col p-12 justify-between rounded-xl animate-pulse">
          <div className="h-6 w-16 bg-accent/30 rounded" />
          <div className="space-y-4">
            <div className="h-8 w-24 bg-accent/30 rounded" />
            <div className="h-5 w-48 bg-accent/20 rounded" />
            <div className="space-y-3 mt-4">
              <div className="h-10 w-full bg-accent/20 rounded-lg" />
              <div className="h-10 w-full bg-accent/20 rounded-lg" />
              <div className="h-10 w-full bg-accent/30 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<SignInFormFallback />}>
      <SignInForm />
    </Suspense>
  );
}
