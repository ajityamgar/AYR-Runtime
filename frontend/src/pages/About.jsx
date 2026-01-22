// src/pages/about.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Card = ({ title, desc, children }) => {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/5 p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
      <h3 className="text-2xl font-extrabold text-white">{title}</h3>
      {desc ? (
        <p className="mt-3 text-sm leading-relaxed text-white/55">{desc}</p>
      ) : null}
      {children ? <div className="mt-6">{children}</div> : null}
    </div>
  );
};

const Stat = ({ label, value }) => {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#070B12] p-6">
      <div className="text-3xl font-extrabold text-white">{value}</div>
      <div className="mt-1 text-xs text-white/45">{label}</div>
    </div>
  );
};

const Bullet = ({ children }) => (
  <li className="list-disc ml-5 text-sm text-white/60 leading-relaxed">
    {children}
  </li>
);

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#070B12] text-white">
      {/* TOP BAR */}
      <div className="border-b border-white/10 bg-white/5">
        <div className="mx-auto max-w-7xl px-4 py-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80 hover:bg-white/10"
            >
              ← Home
            </button>

            <div>
              <div className="text-lg font-extrabold">About AYR Runtime</div>
              <div className="text-xs text-white/45">
                Hindi Programming Language • Web IDE • Debugging
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Link
              to="/learn"
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-2 text-xs font-semibold text-white/90 hover:bg-white/10"
            >
              Learn →
            </Link>
            <Link
              to="/code-now"
              className="rounded-2xl bg-cyan-500 px-5 py-2 text-xs font-semibold text-black hover:bg-cyan-400"
            >
              Open IDE →
            </Link>
          </div>
        </div>
      </div>

      {/* HERO */}
      <section className="mx-auto max-w-7xl px-4 py-14 md:py-18">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
            AYR Runtime
          </h1>
          <p className="mt-4 text-lg text-white/70">
            Hindi-keyword Programming Language + Web IDE with Debugging
          </p>

          <p className="mx-auto mt-8 max-w-3xl text-sm leading-relaxed text-white/55">
            AYR Runtime ek modern learning-first programming platform hai jo
            beginners ko programming samjhane ke liye design kiya gaya hai.
            Isme Hindi-like keywords, simple syntax, clear error messages, aur
            powerful Web IDE tools hai — jisse user browser me hi code likhkar
            run + debug kar sakta hai.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-3">
            <Link
              to="/code-now"
              className="rounded-2xl bg-cyan-500 px-8 py-4 text-sm font-semibold text-black hover:bg-cyan-400"
            >
              Start Coding Now →
            </Link>
            <Link
              to="/learn"
              className="rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-sm font-semibold text-white/90 hover:bg-white/10"
            >
              Learn AYR Runtime →
            </Link>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="mx-auto max-w-7xl px-4 pb-10">
        <div className="grid gap-4 md:grid-cols-4">
          <Stat label="Hindi Keywords" value="✅" />
          <Stat label="Web IDE" value="⚡" />
          <Stat label="Step Debugging" value="🐞" />
          <Stat label="Time Travel Timeline" value="🕒" />
        </div>
      </section>

      {/* WHAT IS AYR */}
      <section className="mx-auto max-w-7xl px-4 pb-12 grid gap-6 md:grid-cols-2">
        <Card
          title="What is AYR Runtime?"
          desc="AYR Runtime ek programming language + runtime system hai jo Python me build hua hai. Iska main focus beginner-friendly learning aur debugging experience dena hai."
        >
          <ul className="space-y-2">
            <Bullet>
              Hindi-like keywords (dikhao, agar, warna, jabtak, kaam, wapas)
            </Bullet>
            <Bullet>Indentation-based blocks (Python style)</Bullet>
            <Bullet>Strong runtime checks + human readable errors</Bullet>
            <Bullet>Browser-based Web IDE (no setup required)</Bullet>
          </ul>
        </Card>

        <Card
          title="Why AYR Runtime?"
          desc="Aaj ke time me beginners programming start karte hi errors aur confusing syntax ki wajah se quit kar dete hai. AYR Runtime ka goal hai: learning ko simple, visual aur interactive banana."
        >
          <ul className="space-y-2">
            <Bullet>Easy-to-read syntax</Bullet>
            <Bullet>Output + Input directly inside IDE</Bullet>
            <Bullet>Problems panel for clear error explanations</Bullet>
            <Bullet>Timeline panel for step-by-step understanding</Bullet>
          </ul>
        </Card>
      </section>

      {/* CORE SYSTEM */}
      <section className="mx-auto max-w-7xl px-4 pb-12">
        <Card
          title="How AYR Runtime Works (Internals)"
          desc="AYR Runtime ka engine 3 core parts me kaam karta hai. Ye architecture real programming languages jaise hi hota hai."
        >
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-[#070B12] p-6">
              <div className="text-white font-bold">1) Lexer</div>
              <p className="mt-2 text-sm text-white/55">
                Code ko tokens me convert karta hai (keywords, identifiers,
                numbers, strings, operators).
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#070B12] p-6">
              <div className="text-white font-bold">2) Parser</div>
              <p className="mt-2 text-sm text-white/55">
                Tokens ko AST (nodes) me convert karta hai — like IfNode,
                WhileNode, FunctionDefNode, etc.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#070B12] p-6">
              <div className="text-white font-bold">3) Interpreter</div>
              <p className="mt-2 text-sm text-white/55">
                AST ko execute karta hai, env maintain karta hai, output generate
                karta hai, aur debug timeline store karta hai.
              </p>
            </div>
          </div>
        </Card>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-7xl px-4 pb-12 grid gap-6 md:grid-cols-3">
        <Card
          title="Beginner Friendly"
          desc="Hindi keywords + simple syntax ka goal: programming fear remove karna."
        >
          <ul className="space-y-2">
            <Bullet>Readable commands</Bullet>
            <Bullet>Less noise, more clarity</Bullet>
            <Bullet>Fast learning curve</Bullet>
          </ul>
        </Card>

        <Card
          title="Web IDE Experience"
          desc="No installation. Browser me hi editor, files, output aur debugging."
        >
          <ul className="space-y-2">
            <Bullet>Multi-file explorer</Bullet>
            <Bullet>Monaco editor support</Bullet>
            <Bullet>Problems + Output tabs</Bullet>
          </ul>
        </Card>

        <Card
          title="Debugging Power"
          desc="Step-by-step execution + time travel debugging beginner ke liye game changer hai."
        >
          <ul className="space-y-2">
            <Bullet>Back / Next navigation</Bullet>
            <Bullet>Timeline snapshots</Bullet>
            <Bullet>Variables inspector</Bullet>
          </ul>
        </Card>
      </section>

      {/* FUTURE ROADMAP */}
      <section className="mx-auto max-w-7xl px-4 pb-14">
        <Card
          title="Roadmap (Future Plans)"
          desc="AYR Runtime ko aur powerful banane ke liye upcoming features add kiye ja sakte hai."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-[#070B12] p-6">
              <div className="text-white font-semibold">Language Improvements</div>
              <ul className="mt-3 space-y-2">
                <Bullet>Dictionary literal syntax in parser</Bullet>
                <Bullet>Tuple literal parsing</Bullet>
                <Bullet>More built-in functions</Bullet>
              </ul>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#070B12] p-6">
              <div className="text-white font-semibold">IDE Improvements</div>
              <ul className="mt-3 space-y-2">
                <Bullet>Jump-to-line from Timeline</Bullet>
                <Bullet>Better error highlighting + tooltips</Bullet>
                <Bullet>Practice problems + progress tracking</Bullet>
              </ul>
            </div>
          </div>
        </Card>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-20">
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-12 text-center shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
          <div className="mx-auto mb-6 grid h-14 w-14 place-items-center rounded-2xl bg-cyan-500/10 text-cyan-300 text-2xl">
            🚀
          </div>
          <h2 className="text-4xl font-extrabold">
            Ready to Code in AYR Runtime?
          </h2>
          <p className="mt-3 text-white/60">
            Start with Learn page, then build real programs in the Web IDE.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
            <Link
              to="/learn"
              className="rounded-2xl border border-white/10 bg-white/5 px-10 py-4 text-sm font-semibold text-white/90 hover:bg-white/10"
            >
              Learn AYR Runtime →
            </Link>

            <Link
              to="/code-now"
              className="rounded-2xl bg-cyan-500 px-10 py-4 text-sm font-semibold text-black hover:bg-cyan-400"
            >
              Open IDE →
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <div className="border-t border-white/10 bg-white/5">
        <div className="mx-auto max-w-7xl px-4 py-6 text-center text-xs text-white/40">
          AYR Runtime • Built for learning programming with debugging-first experience
        </div>
      </div>
    </div>
  );
}
