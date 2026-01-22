import React, { useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function encodeCodeToUrl(code) {
  try {
    return encodeURIComponent(code);
  } catch {
    return "";
  }
}

const BackgroundFX = ({ mouseX, mouseY, active }) => {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* glow gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_20%_10%,rgba(34,211,238,0.13),transparent_55%),radial-gradient(900px_circle_at_85%_25%,rgba(56,189,248,0.10),transparent_60%),radial-gradient(1100px_circle_at_55%_95%,rgba(34,211,238,0.08),transparent_60%)]" />

      {/* grid */}
      <div className="absolute inset-0 opacity-[0.055] [background-image:linear-gradient(to_right,rgba(255,255,255,0.18)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.18)_1px,transparent_1px)] [background-size:72px_72px]" />

      {/* dots */}
      <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.14)_1px,transparent_0)] [background-size:22px_22px]" />

      {/* spotlight */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: active ? 1 : 0,
          background: `radial-gradient(560px circle at ${mouseX}px ${mouseY}px, rgba(34,211,238,0.20), transparent 60%)`,
        }}
      />

      {/* top glow blob */}
      <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-cyan-400/10 blur-[120px]" />
    </div>
  );
};

const Particles = () => {
  const dots = useMemo(() => {
    const count = 18;
    return Array.from({ length: count }).map((_, i) => {
      const left = Math.random() * 100;
      const top = Math.random() * 100;
      const size = 1 + Math.random() * 2.4;
      const dur = 4 + Math.random() * 6;
      const delay = Math.random() * 4;
      const opacity = 0.14 + Math.random() * 0.22;
      return { id: i, left, top, size, dur, delay, opacity };
    });
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0">
      {dots.map((d) => (
        <span
          key={d.id}
          className="absolute rounded-full bg-cyan-300/70"
          style={{
            left: `${d.left}%`,
            top: `${d.top}%`,
            width: `${d.size}px`,
            height: `${d.size}px`,
            opacity: d.opacity,
            animation: `floatUp ${d.dur}s ease-in-out ${d.delay}s infinite`,
          }}
        />
      ))}

      <style>{`
        @keyframes floatUp {
          0%   { transform: translateY(0px);   opacity: 0.12; }
          50%  { transform: translateY(-18px); opacity: 0.35; }
          100% { transform: translateY(0px);   opacity: 0.12; }
        }
      `}</style>
    </div>
  );
};

const SmallTag = ({ children }) => {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
      {children}
    </span>
  );
};

const Bullet = ({ children }) => {
  return (
    <li className="text-sm text-white/65 leading-relaxed list-disc ml-5">
      {children}
    </li>
  );
};

const SectionCard = ({ title, subtitle, children }) => {
  return (
    <div className="relative rounded-[28px] border border-white/10 bg-white/5 p-6 md:p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] transition hover:bg-white/7 hover:border-cyan-400/25 hover:shadow-[0_0_90px_rgba(34,211,238,0.10)] overflow-hidden">
      {/* glow border */}
      <div className="pointer-events-none absolute -inset-[2px] rounded-[30px] opacity-55 blur-[18px] bg-[conic-gradient(from_180deg,rgba(34,211,238,0.14),rgba(56,189,248,0.05),rgba(34,211,238,0.14))] animate-spinSlow" />
      <div className="absolute inset-0 rounded-[28px] bg-[#070B12]/35" />

      <style>{`
        @keyframes spinSlow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-spinSlow { animation: spinSlow 12s linear infinite; }
      `}</style>

      <div className="relative">
        <div className="mb-5">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-2 text-sm md:text-base text-white/55 leading-relaxed">
              {subtitle}
            </p>
          ) : null}
        </div>
        {children}
      </div>
    </div>
  );
};

const CodeBlock = ({
  title = "Code",
  code,
  hint,
  expected,
  onCopy,
  onOpen,
  copied,
}) => {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#070B12] p-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="text-white font-semibold">{title}</div>
          {hint ? <div className="mt-1 text-xs text-white/50">{hint}</div> : null}
        </div>

        <div className="flex gap-2">
          {onCopy ? (
            <button
              onClick={onCopy}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80 hover:bg-white/10"
            >
              {copied ? "Copied ✅" : "Copy"}
            </button>
          ) : null}

          {onOpen ? (
            <button
              onClick={onOpen}
              className="rounded-2xl bg-cyan-500 px-4 py-2 text-xs font-semibold text-black hover:bg-cyan-400"
            >
              Open in IDE
            </button>
          ) : null}
        </div>
      </div>

      <pre className="mt-4 overflow-auto rounded-2xl border border-white/10 bg-black/40 p-4 text-xs md:text-sm text-white/85 leading-relaxed whitespace-pre-wrap">
        {code}
      </pre>

      {expected ? (
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs font-semibold text-white/80">
            Expected Output
          </div>
          <pre className="mt-2 text-xs md:text-sm text-white/75 whitespace-pre-wrap">
            {expected}
          </pre>
        </div>
      ) : null}
    </div>
  );
};

const StepBox = ({ n, title, desc }) => {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:bg-white/7 hover:border-cyan-400/25">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-2xl bg-cyan-500/15 text-cyan-300 grid place-items-center font-bold">
          {n}
        </div>
        <div className="text-white font-semibold">{title}</div>
      </div>
      <p className="mt-3 text-sm text-white/55 leading-relaxed">{desc}</p>
    </div>
  );
};

const TopicNav = ({
  topics,
  activeId,
  setActiveId,
  query,
  setQuery,
  doneMap,
}) => {
  const doneCount = topics.filter((t) => doneMap[t.id]).length;

  return (
    <div className="rounded-[28px] border border-white/10 bg-white/5 p-4 md:p-5 sticky top-[92px] h-fit">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-white/80">Topics</div>
        <div className="text-xs text-white/45">
          {doneCount}/{topics.length}
        </div>
      </div>

      {/* Search */}
      <div className="mt-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search topics..."
          className="w-full rounded-2xl border border-white/10 bg-[#070B12] px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/60"
        />
      </div>

      <div className="mt-3 flex flex-col gap-2 max-h-[55vh] overflow-auto pr-1">
        {topics.map((t) => {
          const active = t.id === activeId;
          const done = !!doneMap[t.id];

          return (
            <button
              key={t.id}
              onClick={() => setActiveId(t.id)}
              className={`text-left rounded-2xl px-4 py-3 text-sm border transition ${
                active
                  ? "bg-cyan-500/15 border-cyan-400/40 text-white"
                  : "bg-white/0 border-white/10 text-white/70 hover:bg-white/5"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="font-semibold">{t.title}</div>
                <div className="text-xs">{done ? "✅" : ""}</div>
              </div>
              {t.desc ? (
                <div className="mt-1 text-xs text-white/45">{t.desc}</div>
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="mt-5 flex gap-2 flex-wrap">
        <SmallTag>Hindi Keywords</SmallTag>
        <SmallTag>Web IDE</SmallTag>
        <SmallTag>Debugger</SmallTag>
        <SmallTag>Timeline</SmallTag>
      </div>
    </div>
  );
};

export default function Learn() {
  const navigate = useNavigate();

  const wrapRef = useRef(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [mouseActive, setMouseActive] = useState(false);

  const handleMouseMove = (e) => {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setMouse({ x: e.clientX - r.left, y: e.clientY - r.top });
  };

  const [activeId, setActiveId] = useState("intro");
  const [query, setQuery] = useState("");

  const [doneMap, setDoneMap] = useState({});
  const [copiedId, setCopiedId] = useState("");

  const copyToClipboard = async (topicId, text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(topicId);
      setDoneMap((p) => ({ ...p, [topicId]: true }));
      setTimeout(() => setCopiedId(""), 900);
    } catch {
    }
  };

  const openInIde = (topicId, code) => {
    setDoneMap((p) => ({ ...p, [topicId]: true }));
    const q = encodeCodeToUrl(code);
    navigate(`/code-now?code=${q}`);
  };

  const topics = useMemo(() => {
    const T = [];

    T.push({
      id: "intro",
      title: "0 → 100% AYR Runtime (Start Here)",
      desc: "Language + Web IDE + Debugging complete guide",
      content: (
        <SectionCard
          title="AYR Runtime: 0 → 100% Complete Learning"
          subtitle="Is page par tum AYR language + Web IDE + Debugger sab kuch step-by-step sikhoge. Har topic ke saath test code diya hai. Copy karo, IDE me run karo, output dekho."
        >
          <div className="grid gap-4 md:grid-cols-3">
            <StepBox
              n="1"
              title="Write Code"
              desc="Editor me AYR code likho. Hindi keywords use karo."
            />
            <StepBox
              n="2"
              title="Run / Debug"
              desc="Run se output aata hai. Debug mode me Back/Next se timeline navigate hota hai."
            />
            <StepBox
              n="3"
              title="Inspect"
              desc="Problems, Output, Variables, Timeline, Memory panels se learning fast hoti hai."
            />
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link
              to="/code-now"
              className="rounded-2xl bg-cyan-500 px-8 py-4 text-sm font-semibold text-black hover:bg-cyan-400 text-center"
            >
              Start Coding Now →
            </Link>
            <button
              onClick={() => setActiveId("hello")}
              className="rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-sm font-semibold text-white/90 hover:bg-white/10 text-center"
            >
              First Program →
            </button>
          </div>
        </SectionCard>
      ),
    });

    const hello = `dikhao "Hello AYR Runtime!"`;
    T.push({
      id: "hello",
      title: "1) Hello World (dikhao)",
      desc: "First output program",
      content: (
        <SectionCard title="Hello World" subtitle="AYR me output keyword hai: dikhao">
          <ul className="mb-4">
            <Bullet>Output tab me print lines show hoti hai.</Bullet>
            <Bullet>Run button use karo.</Bullet>
          </ul>

          <CodeBlock
            title="Program 1: Hello World"
            code={hello}
            expected={`Hello AYR Runtime!`}
            copied={copiedId === "hello"}
            onCopy={() => copyToClipboard("hello", hello)}
            onOpen={() => openInIde("hello", hello)}
          />
        </SectionCard>
      ),
    });

    const vars = `x = 10
y = 5

dikhao x
dikhao y
dikhao x + y
dikhao x * y`;
    T.push({
      id: "vars",
      title: "2) Variables + Numbers",
      desc: "int/float + arithmetic",
      content: (
        <SectionCard
          title="Variables + Numbers"
          subtitle="Variables env (memory) me store hote hai. Tum + - * / % use kar sakte ho."
        >
          <CodeBlock
            title="Program 2: Variables + Math"
            code={vars}
            expected={`10
5
15
50`}
            copied={copiedId === "vars"}
            onCopy={() => copyToClipboard("vars", vars)}
            onOpen={() => openInIde("vars", vars)}
          />
        </SectionCard>
      ),
    });

    const strings = `name = "Ajit"
age = 20

dikhao "Name = {name}"
dikhao "Age  = {age}"`;
    T.push({
      id: "strings",
      title: "3) Strings + {var} Interpolation",
      desc: "format_string() feature",
      content: (
        <SectionCard
          title='Strings + Interpolation ("{var}")'
          subtitle="AYR me string ke andar {variable} likhoge to automatic replace ho jayega."
        >
          <CodeBlock
            title="Program 3: String Interpolation"
            code={strings}
            expected={`Name = Ajit
Age  = 20`}
            copied={copiedId === "strings"}
            onCopy={() => copyToClipboard("strings", strings)}
            onOpen={() => openInIde("strings", strings)}
          />
        </SectionCard>
      ),
    });

    const input1 = `dikhao "Enter your name:"
name = pucho

dikhao "Hello {name}"`;
    T.push({
      id: "input",
      title: "4) Input (pucho)",
      desc: "Interactive input in Output tab",
      content: (
        <SectionCard
          title="Input System: pucho"
          subtitle="Program input ke liye AYR keyword: pucho. Web IDE me Output tab me input box aata hai."
        >
          <CodeBlock
            title="Program 4: Single Input"
            code={input1}
            hint="Run → Output tab me input prompt aayega."
            expected={`Enter your name:
Hello (your name)`}
            copied={copiedId === "input"}
            onCopy={() => copyToClipboard("input", input1)}
            onOpen={() => openInIde("input", input1)}
          />
        </SectionCard>
      ),
    });

    const ifElse = `x = 10

agar x > 5
    dikhao "x is greater than 5"
warna
    dikhao "x is small or equal"`;
    T.push({
      id: "ifelse",
      title: "5) Condition (agar / warna)",
      desc: "if / else decision",
      content: (
        <SectionCard
          title="Conditions: agar / warna"
          subtitle="Decision making ke liye agar / warna use hota hai."
        >
          <CodeBlock
            title="Program 5: If / Else"
            code={ifElse}
            expected={`x is greater than 5`}
            copied={copiedId === "ifelse"}
            onCopy={() => copyToClipboard("ifelse", ifElse)}
            onOpen={() => openInIde("ifelse", ifElse)}
          />
        </SectionCard>
      ),
    });

    const logic = `a = true
b = false

agar a aur (nahi b)
    dikhao "condition true"
warna
    dikhao "condition false"`;
    T.push({
      id: "logic",
      title: "6) Logical (aur / ya / nahi)",
      desc: "boolean logic",
      content: (
        <SectionCard
          title="Logical Operators: aur / ya / nahi"
          subtitle="Boolean expressions likhne ke liye aur/ya/nahi."
        >
          <CodeBlock
            title="Program 6: Boolean Logic"
            code={logic}
            expected={`condition true`}
            copied={copiedId === "logic"}
            onCopy={() => copyToClipboard("logic", logic)}
            onOpen={() => openInIde("logic", logic)}
          />
        </SectionCard>
      ),
    });

    const whileLoop = `i = 1

jabtak i <= 5
    dikhao i
    i = i + 1`;
    T.push({
      id: "while",
      title: "7) Loop: jabtak (while)",
      desc: "repeat until condition false",
      content: (
        <SectionCard
          title="Loop: jabtak"
          subtitle="jabtak loop tab tak chalega jab tak condition true rahe."
        >
          <CodeBlock
            title="Program 7: While Loop"
            code={whileLoop}
            expected={`1
2
3
4
5`}
            copied={copiedId === "while"}
            onCopy={() => copyToClipboard("while", whileLoop)}
            onOpen={() => openInIde("while", whileLoop)}
          />
        </SectionCard>
      ),
    });

    const forLoop = `nums = [10, 20, 30, 40]

har nums main x
    dikhao x`;
    const forLoopWithIndex = `nums = [10, 20, 30]

har nums main value, i
    dikhao "Index {i} => {value}"`;
    T.push({
      id: "for",
      title: "8) Loop: har ... main (for)",
      desc: "iterate list/tuple/dict",
      content: (
        <SectionCard
          title="Loop: har ... main"
          subtitle="For-loop sirf list/tuple/dict par allowed hai."
        >
          <CodeBlock
            title="Program 8A: For Loop"
            code={forLoop}
            expected={`10
20
30
40`}
            copied={copiedId === "for-a"}
            onCopy={() => copyToClipboard("for-a", forLoop)}
            onOpen={() => openInIde("for-a", forLoop)}
          />

          <div className="h-4" />

          <CodeBlock
            title="Program 8B: For Loop with Index"
            code={forLoopWithIndex}
            expected={`Index 0 => 10
Index 1 => 20
Index 2 => 30`}
            copied={copiedId === "for-b"}
            onCopy={() => copyToClipboard("for-b", forLoopWithIndex)}
            onOpen={() => openInIde("for-b", forLoopWithIndex)}
          />
        </SectionCard>
      ),
    });

    const breakContinue = `i = 0

jabtak i < 10
    i = i + 1

    agar i == 3
        chalu

    agar i == 7
        band

    dikhao i`;
    T.push({
      id: "breakcontinue",
      title: "9) band / chalu (break/continue)",
      desc: "loop control",
      content: (
        <SectionCard title="Loop Control: band / chalu" subtitle="band = break, chalu = continue">
          <CodeBlock
            title="Program 9: Break + Continue"
            code={breakContinue}
            expected={`1
2
4
5
6`}
            copied={copiedId === "breakcontinue"}
            onCopy={() => copyToClipboard("breakcontinue", breakContinue)}
            onOpen={() => openInIde("breakcontinue", breakContinue)}
          />
        </SectionCard>
      ),
    });

    const fn1 = `kaam add(a, b)
    wapas a + b

x = add(10, 20)
dikhao x`;
    const fn2 = `kaam greet(name)
    dikhao "Hello {name}"

greet("Boss")`;
    T.push({
      id: "functions",
      title: "10) Functions (kaam / wapas)",
      desc: "define + call",
      content: (
        <SectionCard
          title="Functions: kaam / wapas"
          subtitle="Reusable code blocks banane ke liye functions use hote hai."
        >
          <CodeBlock
            title="Program 10A: Function Return"
            code={fn1}
            expected={`30`}
            copied={copiedId === "functions-a"}
            onCopy={() => copyToClipboard("functions-a", fn1)}
            onOpen={() => openInIde("functions-a", fn1)}
          />

          <div className="h-4" />

          <CodeBlock
            title="Program 10B: Function Print"
            code={fn2}
            expected={`Hello Boss`}
            copied={copiedId === "functions-b"}
            onCopy={() => copyToClipboard("functions-b", fn2)}
            onOpen={() => openInIde("functions-b", fn2)}
          />
        </SectionCard>
      ),
    });

    const listIndex = `a = [5, 10, 15]

dikhao a[0]
dikhao a[1]
dikhao a[2]

a[1] = 999
dikhao a[1]`;
    T.push({
      id: "lists",
      title: "11) List + Indexing",
      desc: "a[i] read/write",
      content: (
        <SectionCard title="Lists + Indexing (a[i])" subtitle="List ke elements read/write kar sakte ho.">
          <CodeBlock
            title="Program 11: List Indexing + Update"
            code={listIndex}
            expected={`5
10
15
999`}
            copied={copiedId === "lists"}
            onCopy={() => copyToClipboard("lists", listIndex)}
            onOpen={() => openInIde("lists", listIndex)}
          />
        </SectionCard>
      ),
    });

    const oop = `class Person:
    kaam __init__(self, name, age):
        self.name = name
        self.age = age

    kaam show(self):
        dikhao "Name = {self.name}"
        dikhao "Age  = {self.age}"

p = Person("Ajit", 20)
p.show()`;

    const oopMemberAccess = `class Car:
    kaam __init__(self, brand):
        self.brand = brand

c = Car("Tata")

dikhao c.brand
c.brand = "Mahindra"
dikhao c.brand`;
    T.push({
      id: "oop",
      title: "12) OOP: class / object",
      desc: "constructor + methods + fields",
      content: (
        <SectionCard
          title="OOP: class / object"
          subtitle="AYR Runtime me class + object features available hai."
        >
          <CodeBlock
            title="Program 12A: Class + Method Call"
            code={oop}
            expected={`Name = Ajit
Age  = 20`}
            copied={copiedId === "oop-a"}
            onCopy={() => copyToClipboard("oop-a", oop)}
            onOpen={() => openInIde("oop-a", oop)}
          />

          <div className="h-4" />

          <CodeBlock
            title="Program 12B: Member Access + Update"
            code={oopMemberAccess}
            expected={`Tata
Mahindra`}
            copied={copiedId === "oop-b"}
            onCopy={() => copyToClipboard("oop-b", oopMemberAccess)}
            onOpen={() => openInIde("oop-b", oopMemberAccess)}
          />
        </SectionCard>
      ),
    });

    T.push({
      id: "platform",
      title: "13) Platform Guide (Web IDE)",
      desc: "Output, Problems, Variables, Timeline, Memory",
      content: (
        <SectionCard
          title="Web IDE Guide: Panels + Buttons"
          subtitle="AYR Runtime IDE me tumhe ye panels dikhte hai."
        >
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-[#070B12] p-6">
              <div className="text-white font-bold">✅ Run Mode</div>
              <ul className="mt-3 space-y-2">
                <Bullet>
                  <b className="text-white">Run</b> दबाने पर program execute hota hai
                </Bullet>
                <Bullet>
                  <b className="text-white">Output</b> tab me result aata hai
                </Bullet>
                <Bullet>
                  <b className="text-white">Problems</b> tab me errors show hote hai
                </Bullet>
              </ul>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#070B12] p-6">
              <div className="text-white font-bold">🐞 Debug Mode</div>
              <ul className="mt-3 space-y-2">
                <Bullet>
                  <b className="text-white">Debug</b> click = session start
                </Bullet>
                <Bullet>
                  <b className="text-white">Back / Next</b> = time travel debugging
                </Bullet>
                <Bullet>
                  <b className="text-white">Timeline</b> = step snapshots
                </Bullet>
              </ul>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link
              to="/code-now"
              className="rounded-2xl bg-cyan-500 px-8 py-4 text-sm font-semibold text-black hover:bg-cyan-400 text-center"
            >
              Open IDE →
            </Link>
          </div>
        </SectionCard>
      ),
    });

    const debugExample = `x = 10
y = 0

dikhao x
dikhao x / y`;

    const debugExample2 = `a = [1,2,3]
dikhao a[10]`;

    const debugExample3 = `dikhao z`;
    T.push({
      id: "debugging",
      title: "14) Debugging (Step-by-step)",
      desc: "Problems + Timeline + Back/Next",
      content: (
        <SectionCard
          title="Debugging Guide (Complete)"
          subtitle="Debug mode me error ko samjho + variables check karo + timeline travel karo."
        >
          <CodeBlock
            title="Debug Test 1: Division by Zero"
            hint="Debug → error line par stop hoga."
            code={debugExample}
            expected={`10\n(then error in Problems tab)`}
            copied={copiedId === "debug-1"}
            onCopy={() => copyToClipboard("debug-1", debugExample)}
            onOpen={() => openInIde("debug-1", debugExample)}
          />

          <div className="h-4" />

          <CodeBlock
            title="Debug Test 2: List Index Out of Range"
            code={debugExample2}
            expected={`(error in Problems tab)`}
            copied={copiedId === "debug-2"}
            onCopy={() => copyToClipboard("debug-2", debugExample2)}
            onOpen={() => openInIde("debug-2", debugExample2)}
          />

          <div className="h-4" />

          <CodeBlock
            title="Debug Test 3: Undefined Variable"
            code={debugExample3}
            expected={`(error in Problems tab)`}
            copied={copiedId === "debug-3"}
            onCopy={() => copyToClipboard("debug-3", debugExample3)}
            onOpen={() => openInIde("debug-3", debugExample3)}
          />
        </SectionCard>
      ),
    });

    const practice1 = `# Task: two numbers input lo aur sum print karo
dikhao "Enter two numbers:"
a, b = pucho

dikhao a + b`;

    const practice2 = `# Task: 1 to 10 even numbers print
i = 1
jabtak i <= 10
    agar i % 2 == 0
        dikhao i
    i = i + 1`;

    const practice3 = `# Task: function bana ke square return karo
kaam square(n)
    wapas n * n

dikhao square(8)`;

    T.push({
      id: "practice",
      title: "15) Practice (0→Pro)",
      desc: "3 mini tasks to master AYR",
      content: (
        <SectionCard
          title="Practice Problems (Must Do)"
          subtitle="Ye 3 programs complete karoge to AYR basics strong ho jayenge."
        >
          <CodeBlock
            title="Practice 1: Input + Sum"
            code={practice1}
            expected={`Enter two numbers:\n(sum output)`}
            copied={copiedId === "practice-1"}
            onCopy={() => copyToClipboard("practice-1", practice1)}
            onOpen={() => openInIde("practice-1", practice1)}
          />

          <div className="h-4" />

          <CodeBlock
            title="Practice 2: Even Numbers"
            code={practice2}
            expected={`2\n4\n6\n8\n10`}
            copied={copiedId === "practice-2"}
            onCopy={() => copyToClipboard("practice-2", practice2)}
            onOpen={() => openInIde("practice-2", practice2)}
          />

          <div className="h-4" />

          <CodeBlock
            title="Practice 3: Function Square"
            code={practice3}
            expected={`64`}
            copied={copiedId === "practice-3"}
            onCopy={() => copyToClipboard("practice-3", practice3)}
            onOpen={() => openInIde("practice-3", practice3)}
          />
        </SectionCard>
      ),
    });

    return T;
  }, [copiedId]);

  const filteredTopics = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return topics;
    return topics.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.desc || "").toLowerCase().includes(q)
    );
  }, [topics, query]);

  const activeTopic = topics.find((t) => t.id === activeId) || topics[0];

  return (
    <div
      ref={wrapRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setMouseActive(true)}
      onMouseLeave={() => setMouseActive(false)}
      className="relative min-h-screen bg-[#070B12] text-white overflow-hidden"
    >
      <BackgroundFX mouseX={mouse.x} mouseY={mouse.y} active={mouseActive} />
      <Particles />

      {/* MAIN */}
      <div className="relative mx-auto max-w-7xl px-4 py-8 grid gap-6 md:grid-cols-[360px_1fr]">
        {/* LEFT NAV */}
        <TopicNav
          topics={filteredTopics}
          activeId={activeId}
          setActiveId={setActiveId}
          query={query}
          setQuery={setQuery}
          doneMap={doneMap}
        />

        {/* CONTENT */}
        <div className="flex flex-col gap-6">
          {activeTopic?.content}

          {/* FOOTER CTA */}
          <div className="relative rounded-[28px] border border-white/10 bg-white/5 p-7 text-center transition hover:bg-white/7 hover:border-cyan-400/25">
            <div className="text-2xl font-extrabold">
              Ready to build projects in AYR Runtime?
            </div>
            <p className="mt-2 text-sm text-white/55">
              Learn page complete karne ke baad IDE open karo aur apne own
              programs build karo.
            </p>

            <div className="mt-5 flex flex-col sm:flex-row justify-center gap-3">
              <Link
                to="/code-now"
                className="rounded-2xl bg-cyan-500 px-8 py-4 text-sm font-semibold text-black hover:bg-cyan-400"
              >
                Start Coding Now →
              </Link>

              <button
                onClick={() => setActiveId("practice")}
                className="rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-sm font-semibold text-white/90 hover:bg-white/10"
              >
                Go to Practice →
              </button>
            </div>
          </div>

          <div className="text-xs text-white/35">
            Tip: Debug mode me Timeline + Variables tab use karke tum runtime
            execution 10x fast samajh loge.
          </div>
        </div>
      </div>
    </div>
  );
}
