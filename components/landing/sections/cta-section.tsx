"use client";

import Link from "next/link";
import { useSession } from "@/lib/auth/auth-client";

const CTASection = () => {
  const { data: session } = useSession();
  const getStartedHref = session?.user ? "/dashboard" : "/sign-in";

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-violet-600 via-pink-600 to-violet-600">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Ready to Build Something Amazing?
        </h2>
        <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
          Join thousands of people who are already building the future
          <br></br>
          of game development
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="px-8 py-3 bg-white text-gray-900 rounded-full font-medium hover:bg-gray-100 transition-all transform hover:scale-105">
            <Link href={getStartedHref}>Get Started Free</Link>
          </button>
          <button className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-full font-medium hover:bg-white/10 transition-all">
            View Documentation
          </button>
        </div>

        {/* <p className="mt-8 text-white/70 text-sm">
          No credit card required • Start building in minutes
        </p> */}
      </div>
    </section>
  );
};

export default CTASection;
