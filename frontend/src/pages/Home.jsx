import React, { useState } from "react";
import { Link } from "react-router-dom";

const FeatureCard = ({ title, desc }) => {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] transition hover:bg-white/7">
      <div className="mb-6 h-12 w-12 rounded-2xl bg-cyan-500/10 text-cyan-300 grid place-items-center text-xl">
        ⚡
      </div>
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-white/55">{desc}</p>
    </div>
  );
};

export default function Home() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("email", form.email);
    fd.append("subject", form.subject);
    fd.append("message", form.message);

    const res = await fetch(
      "https://script.google.com/macros/s/AKfycbyn3hQyOSpR394y2PbP5YimpjAY95VgP1XGVRIcVR0fNfhKh8rmPE8Yk_ifU5NOM1JB/exec",
      {
        method: "POST",
        body: fd,
      }
    );

    const text = await res.text();
    console.log("Google Script Response:", text);

    if (text.includes("OK")) {
      alert("Message sent successfully ✅");
      setForm({ name: "", email: "", subject: "", message: "" });
    } else {
      alert("Failed: " + text);
    }
  } catch (err) {
    console.error(err);
    alert("Failed to send message ❌");
  }
};


  return (
    <div className="bg-[#070B12]">
      {/* HERO */}
      <section className="mx-auto max-w-6xl px-4 py-20 text-center">
        <h1 className="text-5xl font-extrabold tracking-tight md:text-6xl">
          AYR Runtime
        </h1>
        <p className="mt-4 text-lg text-white/70">
          Hindi-Keyword Programming Language + Web IDE with Debugging
        </p>

        <p className="mx-auto mt-8 max-w-2xl text-sm leading-relaxed text-white/55">
          AYR Runtime is a Hindi-keyword based programming language and runtime
          platform built completely from scratch using Python. Write code, run
          instantly, and debug step-by-step inside the browser.
        </p>

        <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            to="/code-now"
            className="w-full sm:w-auto rounded-2xl bg-cyan-500 px-8 py-4 text-sm font-semibold text-black transition hover:bg-cyan-400"
          >
            &gt;_ Code Now
          </Link>

          <Link
            to="/learn"
            className="w-full sm:w-auto rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-sm font-semibold text-white/90 transition hover:bg-white/10"
          >
            Learn AYR Runtime
          </Link>
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="text-center">
          <h2 className="text-4xl font-bold">Why Choose AYR Runtime?</h2>
          <p className="mt-3 text-sm text-white/55">
            Powerful features designed for modern development workflows
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <FeatureCard
            title="Beginner Friendly Syntax"
            desc="Hindi-like keywords make programming more readable and easier to learn."
          />
          <FeatureCard
            title="Web-Based IDE"
            desc="No setup needed. Write and run AYR code directly in your browser."
          />
          <FeatureCard
            title="Built-in Debugger"
            desc="Step through execution and navigate with Back/Next for timeline-style debugging."
          />
          <FeatureCard
            title="Human-friendly error messages"
            desc="Clear, beginner-friendly runtime errors with line-based messages and expression context."
          />
          <FeatureCard
            title="Full Debug Panels"
            desc="Track execution using Output, Variables, Timeline, Memory, and Detail panels in real-time."
          />
          <FeatureCard
            title="Step-by-Step Debugging"
            desc="Run in Debug mode and control execution using Step, Back, and Next for timeline-style debugging."
          />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-6xl px-4 py-24 text-center">
        <h2 className="text-5xl font-extrabold">How It Works</h2>
        <p className="mt-3 text-sm text-white/55">
          Get started in three simple steps
        </p>

        <div className="mt-16 grid gap-14 md:grid-cols-3">
          {[
            {
              n: 1,
              title: "Write Your Code",
              desc: "Use the online editor to write AYR programs with Hindi keywords.",
            },
            {
              n: 2,
              title: "Run & Debug",
              desc: "Execute instantly or enter Debug mode to step through execution and inspect variables.",
            },
            {
              n: 3,
              title: "Learn by Building",
              desc: "Understand how real languages work internally using Lexer → Parser → Interpreter flow.",
            },
          ].map((s) => (
            <div key={s.n} className="mx-auto max-w-sm">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border-2 border-cyan-400/60 text-cyan-300 font-bold">
                {s.n}
              </div>
              <h3 className="mt-8 text-xl font-semibold">{s.title}</h3>
              <p className="mt-3 text-sm text-white/55">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-24">
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-12 text-center shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
          <div className="mx-auto mb-6 grid h-14 w-14 place-items-center rounded-2xl bg-cyan-500/10 text-cyan-300 text-2xl">
            🚀
          </div>
          <h2 className="text-4xl font-extrabold">
            Ready to Start Coding in AYR Runtime?
          </h2>
          <p className="mt-3 text-white/60">
            Write your first AYR program, run it instantly, and explore debugging
            with step-by-step execution.
          </p>

          <Link
            to="/code-now"
            className="mt-10 inline-flex items-center justify-center rounded-2xl bg-cyan-500 px-10 py-4 text-sm font-semibold text-black transition hover:bg-cyan-400"
          >
            Start Coding Now →
          </Link>
        </div>
      </section>

      {/* CONTACT */}
      <section className="mx-auto max-w-6xl px-4 pb-28">
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-10 md:p-12 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
          <div className="text-center">
            <h2 className="text-4xl font-extrabold">Contact Us</h2>
            <p className="mt-3 text-sm text-white/55">
              Have feedback, feature ideas, or want to collaborate on AYR Runtime?
              Send a message and I’ll get back to you.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-10 grid max-w-3xl gap-5"
          >
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="text-sm text-white/70">Full Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-[#070B12] px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/60"
                  required
                />
              </div>

              <div>
                <label className="text-sm text-white/70">Email Address</label>
                <input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  type="email"
                  placeholder="Enter your email"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-[#070B12] px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/60"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-white/70">Subject</label>
              <input
                name="subject"
                value={form.subject}
                onChange={handleChange}
                placeholder="What is this about?"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-[#070B12] px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/60"
                required
              />
            </div>

            <div>
              <label className="text-sm text-white/70">Message</label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="Write your message here..."
                rows={5}
                className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-[#070B12] px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/60"
                required
              />
            </div>

            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
              <p className="text-xs text-white/40">
                By submitting this form, you agree to be contacted back regarding
                your request.
              </p>

              <button
                type="submit"
                className="w-full sm:w-auto rounded-2xl bg-cyan-500 px-8 py-3 text-sm font-semibold text-black transition hover:bg-cyan-400"
              >
                Send Message →
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
