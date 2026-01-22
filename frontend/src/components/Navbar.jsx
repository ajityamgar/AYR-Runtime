import React from "react";
import { NavLink, Link } from "react-router-dom";

export default function Navbar() {
  const linkClass = ({ isActive }) =>
    `text-sm transition ${
      isActive ? "text-cyan-300" : "text-white/70 hover:text-white"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#070B12]/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-cyan-300 text-xl font-bold">{`</>`}</span>
          <span className="text-lg font-semibold tracking-wide">AYR Runtime</span>
        </Link>

        <nav className="flex items-center gap-6">
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
            className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-cyan-400"
          >
            Code Now
          </Link>
        </nav>
      </div>
    </header>
  );
}
