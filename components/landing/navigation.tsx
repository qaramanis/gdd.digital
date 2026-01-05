"use client";

import { Menu, Quote, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full backdrop-blur-xl z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Quote className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                gdd.digital
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="flex flex-row gap-[2rem]">
            <div className="hidden md:flex items-center space-x-8 bg-gradient-to-br from-violet-500/10 to-pink-500/10 px-6 py-2.5 rounded-full border border-white/10">
              <a
                href="#"
                className="text-gray-400 hover:text-white transition font-medium"
              >
                Features
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition font-medium"
              >
                Challenges
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition font-medium"
              >
                Demo
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition font-medium"
              >
                Docs
              </a>
            </div>

            {/* CTA Button */}
            <div className="hidden md:block">
              <button className="h-full bg-gradient-to-r cursor-pointer from-violet-600 to-pink-600 text-white px-6 py-2.5 rounded-full font-medium hover:shadow-lg hover:shadow-violet-500/25 transition-all transform hover:scale-105">
                <Link href="/sign-in">Get Started</Link>
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-xl border-t border-white/10">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <a
              href="#"
              className="block px-3 py-2 text-gray-400 hover:text-white"
            >
              Features
            </a>
            <a
              href="#"
              className="block px-3 py-2 text-gray-400 hover:text-white"
            >
              Challenges
            </a>
            <a
              href="#"
              className="block px-3 py-2 text-gray-400 hover:text-white"
            >
              Demo
            </a>
            <a
              href="#"
              className="block px-3 py-2 text-gray-400 hover:text-white"
            >
              Docs
            </a>
            <button className="w-full mt-2 bg-gradient-to-r from-violet-600 to-pink-600 text-white px-6 py-2.5 rounded-full">
              Get Started
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
