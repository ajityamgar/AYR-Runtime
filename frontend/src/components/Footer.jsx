import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#070B12]">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-10 md:grid-cols-[1.3fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <Link to="/" className="group flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-2xl border border-white/10 bg-white/5 text-cyan-300 text-sm font-bold transition group-hover:bg-white/10">
                {"</>"}
              </span>
              <div className="leading-tight">
                <div className="text-base font-extrabold text-white">
                  AYR Runtime
                </div>
                <div className="text-xs text-white/40">
                  Hindi-keyword Language + Web IDE
                </div>
              </div>
            </Link>

            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/55">
              AYR Runtime is an open-source learning-first platform to write,
              run and debug AYR code snippets directly in the browser.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                Web IDE
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                Debugger
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                Timeline
              </span>
            </div>
          </div>

          {/* Links */}
          <div>
            <div className="text-sm font-semibold text-white/85">Resources</div>
            <ul className="mt-4 space-y-2 text-sm text-white/60">
              <li>
                <Link
                  to="/learn"
                  className="hover:text-white transition"
                >
                  Documentation / Learn
                </Link>
              </li>
              <li>
                <Link
                  to="/code-now"
                  className="hover:text-white transition"
                >
                  Playground (Code Now)
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="hover:text-white transition"
                >
                  About Project
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <div className="text-sm font-semibold text-white/85">Community</div>
            <ul className="mt-4 space-y-2 text-sm text-white/60">
              <li>
                <a
                  href="https://github.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="mailto:your-email@example.com"
                  className="hover:text-white transition"
                >
                  Contact / Feedback
                </a>
              </li>
              <li className="text-white/40 text-xs pt-2">
                Suggest features & report bugs
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 md:flex-row md:items-center md:justify-between">
          <div className="text-xs text-white/40">
            © {new Date().getFullYear()} AYR Runtime. Built for learning.
          </div>
          <div className="text-xs text-white/40">
            Made with React + Tailwind • Debugging-first UX
          </div>
        </div>
      </div>
    </footer>
  );
}
