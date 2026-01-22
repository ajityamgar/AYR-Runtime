import React, { useEffect, useState } from "react";
import { NavLink, Link } from "react-router-dom";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition ${
      isActive
        ? "text-cyan-300"
        : "text-white/70 hover:text-white"
    }`;

  return (
    <header
      className={`sticky top-0 z-50 border-b backdrop-blur-xl transition ${
        scrolled
          ? "border-white/10 bg-[#070B12]/75"
          : "border-white/10 bg-[#070B12]/55"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        {/* Brand */}
        <Link to="/" className="group flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-2xl border border-white/10 bg-white/5 text-cyan-300 text-sm font-bold transition group-hover:bg-white/10">
            {"</>"}
          </span>
          <div className="leading-tight">
            <div className="text-sm font-extrabold tracking-wide text-white">
              AYR Runtime
            </div>
            <div className="text-[10px] text-white/40">
              Hindi Keywords • Web IDE • Debugger
            </div>
          </div>
        </Link>

        {/* Nav */}
        <nav className="hidden items-center gap-6 md:flex">
          <NavLink to="/" className={linkClass}>
            Home
          </NavLink>
          <NavLink to="/about" className={linkClass}>
            About
          </NavLink>
          <NavLink to="/learn" className={linkClass}>
            Learn
          </NavLink>

          <Link
            to="/code-now"
            className="rounded-2xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-cyan-400"
          >
            Code Now →
          </Link>
        </nav>

        {/* Mobile CTA (simple) */}
        <div className="flex items-center gap-2 md:hidden">
          <Link
            to="/code-now"
            className="rounded-2xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-cyan-400"
          >
            Code →
          </Link>
        </div>
      </div>
    </header>
  );
}
