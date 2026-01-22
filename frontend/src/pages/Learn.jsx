import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

/**
 * LEARN AYR RUNTIME (0 → 100%)
 * ✅ Covers:
 * 1) Language basics (coding)
 * 2) Platform/Web IDE usage
 * 3) Debugging workflow (timeline + env + problems)
 *
 * NOTE:
 * - This file is pure frontend page.
 * - "Copy" button copies code to clipboard.
 * - "Open in IDE" navigates to /code-now with ?code=... (you can implement auto-load easily)
 */

const SectionCard = ({ title, subtitle, children }) => {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 md:p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
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

const CodeBlock = ({
  title = "Code",
  code,
  hint,
  expected,
  onCopy,
  onOpen,
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
              Copy
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

      <pre className="mt-4 overflow-auto rounded-2xl border border-white/10 bg-black/40 p-4 text-xs md:text-sm text-white/85 leading-relaxed">
        {code}
      </pre>

      {expected ? (
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs font-semibold text-white/80">Expected Output</div>
          <pre className="mt-2 text-xs md:text-sm text-white/75">{expected}</pre>
        </div>
      ) : null}
    </div>
  );
};

const StepBox = ({ n, title, desc }) => {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
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

const TopicNav = ({ topics, activeId, setActiveId }) => {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/5 p-4 md:p-5">
      <div className="text-sm font-semibold text-white/80">Topics</div>
      <div className="mt-3 flex flex-col gap-2">
        {topics.map((t) => {
          const active = t.id === activeId;
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
              <div className="font-semibold">{t.title}</div>
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

function encodeCodeToUrl(code) {
  try {
    return encodeURIComponent(code);
  } catch {
    return "";
  }
}

export default function Learn() {
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState("intro");

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Copied ✅");
    } catch {
      alert("Copy failed ❌");
    }
  };

  const openInIde = (code) => {
    // ✅ Route expected from your Home page: "/code-now"
    // You can read this query param in Playground and auto-load to editor
    const q = encodeCodeToUrl(code);
    navigate(`/code-now?code=${q}`);
  };

  const topics = useMemo(() => {
    const T = [];

    // =====================================================
    // 0) INTRO
    // =====================================================
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
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveId("hello");
              }}
              className="rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-sm font-semibold text-white/90 hover:bg-white/10 text-center"
            >
              First Program →
            </a>
          </div>
        </SectionCard>
      ),
    });

    // =====================================================
    // 1) HELLO WORLD
    // =====================================================
    const hello = `dikhao "Hello AYR Runtime!"`;
    T.push({
      id: "hello",
      title: "1) Hello World (dikhao)",
      desc: "First output program",
      content: (
        <SectionCard
          title="Hello World"
          subtitle="AYR me output keyword hai: dikhao"
        >
          <ul className="mb-4">
            <Bullet>
              Output tab me print lines show hoti hai.
            </Bullet>
            <Bullet>
              Run button use karo.
            </Bullet>
          </ul>

          <CodeBlock
            title="Program 1: Hello World"
            code={hello}
            expected={`Hello AYR Runtime!`}
            onCopy={() => copyToClipboard(hello)}
            onOpen={() => openInIde(hello)}
          />
        </SectionCard>
      ),
    });

    // =====================================================
    // 2) VARIABLES + NUMBERS
    // =====================================================
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
          <ul className="mb-4">
            <Bullet>
              Variables tab me x, y values live dikhegi.
            </Bullet>
            <Bullet>
              Division by zero error aayega (safe runtime).
            </Bullet>
          </ul>

          <CodeBlock
            title="Program 2: Variables + Math"
            code={vars}
            expected={`10
5
15
50`}
            onCopy={() => copyToClipboard(vars)}
            onOpen={() => openInIde(vars)}
          />
        </SectionCard>
      ),
    });

    // =====================================================
    // 3) STRINGS + INTERPOLATION
    // =====================================================
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
          <ul className="mb-4">
            <Bullet>
              Agar variable exist nahi karega to ExpressionError aayega.
            </Bullet>
          </ul>

          <CodeBlock
            title="Program 3: String Interpolation"
            code={strings}
            expected={`Name = Ajit
Age  = 20`}
            onCopy={() => copyToClipboard(strings)}
            onOpen={() => openInIde(strings)}
          />
        </SectionCard>
      ),
    });

    // =====================================================
    // 4) INPUT (pucho)
    // =====================================================
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
          <ul className="mb-4">
            <Bullet>
              Run karo → Output tab me input field show hoga.
            </Bullet>
            <Bullet>
              Value enter karke Enter karo → program continue.
            </Bullet>
          </ul>

          <CodeBlock
            title="Program 4: Single Input"
            code={input1}
            hint="Run → Output tab me input prompt aayega."
            expected={`Enter your name:
Hello (your name)`}
            onCopy={() => copyToClipboard(input1)}
            onOpen={() => openInIde(input1)}
          />
        </SectionCard>
      ),
    });

    // =====================================================
    // 5) CONDITIONS
    // =====================================================
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
          <ul className="mb-4">
            <Bullet>
              Condition me {">"} {"<"} {"=="} {"!="} supported hai.
            </Bullet>
            <Bullet>
              Type mismatch comparison allowed nahi (safe).
            </Bullet>
          </ul>

          <CodeBlock
            title="Program 5: If / Else"
            code={ifElse}
            expected={`x is greater than 5`}
            onCopy={() => copyToClipboard(ifElse)}
            onOpen={() => openInIde(ifElse)}
          />
        </SectionCard>
      ),
    });

    // =====================================================
    // 6) LOGIC (aur/ya/nahi)
    // =====================================================
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
          <ul className="mb-4">
            <Bullet>aur = AND</Bullet>
            <Bullet>ya = OR</Bullet>
            <Bullet>nahi = NOT</Bullet>
          </ul>

          <CodeBlock
            title="Program 6: Boolean Logic"
            code={logic}
            expected={`condition true`}
            onCopy={() => copyToClipboard(logic)}
            onOpen={() => openInIde(logic)}
          />
        </SectionCard>
      ),
    });

    // =====================================================
    // 7) WHILE LOOP
    // =====================================================
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
            onCopy={() => copyToClipboard(whileLoop)}
            onOpen={() => openInIde(whileLoop)}
          />
        </SectionCard>
      ),
    });

    // =====================================================
    // 8) FOR LOOP (har ... main)
    // =====================================================
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
            onCopy={() => copyToClipboard(forLoop)}
            onOpen={() => openInIde(forLoop)}
          />

          <div className="h-4" />

          <CodeBlock
            title="Program 8B: For Loop with Index"
            code={forLoopWithIndex}
            expected={`Index 0 => 10
Index 1 => 20
Index 2 => 30`}
            onCopy={() => copyToClipboard(forLoopWithIndex)}
            onOpen={() => openInIde(forLoopWithIndex)}
          />
        </SectionCard>
      ),
    });

    // =====================================================
    // 9) BREAK + CONTINUE
    // =====================================================
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
        <SectionCard
          title="Loop Control: band / chalu"
          subtitle="band = break, chalu = continue"
        >
          <CodeBlock
            title="Program 9: Break + Continue"
            code={breakContinue}
            expected={`1
2
4
5
6`}
            onCopy={() => copyToClipboard(breakContinue)}
            onOpen={() => openInIde(breakContinue)}
          />
        </SectionCard>
      ),
    });

    // =====================================================
    // 10) FUNCTIONS
    // =====================================================
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
            onCopy={() => copyToClipboard(fn1)}
            onOpen={() => openInIde(fn1)}
          />

          <div className="h-4" />

          <CodeBlock
            title="Program 10B: Function Print"
            code={fn2}
            expected={`Hello Boss`}
            onCopy={() => copyToClipboard(fn2)}
            onOpen={() => openInIde(fn2)}
          />
        </SectionCard>
      ),
    });

    // =====================================================
    // 11) LISTS + INDEXING + INDEX ASSIGNMENT
    // =====================================================
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
        <SectionCard
          title="Lists + Indexing (a[i])"
          subtitle="List ke elements read/write kar sakte ho."
        >
          <CodeBlock
            title="Program 11: List Indexing + Update"
            code={listIndex}
            expected={`5
10
15
999`}
            onCopy={() => copyToClipboard(listIndex)}
            onOpen={() => openInIde(listIndex)}
          />
        </SectionCard>
      ),
    });

    // =====================================================
    // 12) CLASS / OBJECT (OOP)
    // =====================================================
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
          subtitle="AYR Runtime me class + object features available hai. __init__ auto call hota hai."
        >
          <ul className="mb-4">
            <Bullet>
              Class ke andar sirf <b className="text-white">kaam</b> method allowed hai.
            </Bullet>
            <Bullet>
              Method ka first parameter self/this/current kuch bhi ho sakta hai (but required).
            </Bullet>
            <Bullet>
              Dot access: <b className="text-white">obj.field</b> and <b className="text-white">obj.method()</b>
            </Bullet>
          </ul>

          <CodeBlock
            title="Program 12A: Class + Method Call"
            code={oop}
            expected={`Name = Ajit
Age  = 20`}
            onCopy={() => copyToClipboard(oop)}
            onOpen={() => openInIde(oop)}
          />

          <div className="h-4" />

          <CodeBlock
            title="Program 12B: Member Access + Update"
            code={oopMemberAccess}
            expected={`Tata
Mahindra`}
            onCopy={() => copyToClipboard(oopMemberAccess)}
            onOpen={() => openInIde(oopMemberAccess)}
          />
        </SectionCard>
      ),
    });

    // =====================================================
    // 13) PLATFORM GUIDE (IDE PANELS)
    // =====================================================
    T.push({
      id: "platform",
      title: "13) Platform Guide (Web IDE)",
      desc: "Output, Problems, Variables, Timeline, Memory",
      content: (
        <SectionCard
          title="Web IDE Guide: Panels + Buttons"
          subtitle="AYR Runtime IDE me tumhe ye panels dikhte hai. Har panel ka use kab karna hai ye yaha clear hai."
        >
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-[#070B12] p-6">
              <div className="text-white font-bold">✅ Run Mode</div>
              <ul className="mt-3 space-y-2">
                <Bullet>
                  <b className="text-white">Run</b> दबाने पर program direct execute hota hai.
                </Bullet>
                <Bullet>
                  Output successful hai to <b className="text-white">Output</b> tab me show hota hai.
                </Bullet>
                <Bullet>
                  Error aaya to <b className="text-white">Problems</b> tab me show hota hai.
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
                  <b className="text-white">Timeline</b> tab = har step ka env snapshot
                </Bullet>
              </ul>
            </div>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="text-white font-semibold">Problems Tab</div>
              <p className="mt-2 text-sm text-white/55">
                Errors + warnings show hote hai. Expression errors me line + expression context hota hai.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="text-white font-semibold">Output Tab</div>
              <p className="mt-2 text-sm text-white/55">
                dikhao ka output yaha show hota hai. pucho input bhi yahi se submit hota hai.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="text-white font-semibold">Variables Tab</div>
              <p className="mt-2 text-sm text-white/55">
                env (memory) ke andar current variables ka live view.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="text-white font-semibold">Timeline Tab</div>
              <p className="mt-2 text-sm text-white/55">
                step-by-step snapshots: line number + env JSON.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="text-white font-semibold">Detail Tab</div>
              <p className="mt-2 text-sm text-white/55">
                debugger state info: total states, current index, has past/future.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="text-white font-semibold">Memory Tab</div>
              <p className="mt-2 text-sm text-white/55">
                runtime snapshots kitna memory use kar rahe hai (KB me).
              </p>
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

    // =====================================================
    // 14) DEBUGGING GUIDE (MULTIPLE TOPICS)
    // =====================================================
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
          subtitle="Debug mode ka goal hai: error ko samajhna, line identify karna, env check karna, aur back/next se timeline travel karna."
        >
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <div className="text-white font-semibold">Topic 1: Stop at Error</div>
              <p className="mt-2 text-sm text-white/55">
                Debug mode me tum error par stop kar sakte ho (Problems tab me).
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <div className="text-white font-semibold">Topic 2: Timeline Travel</div>
              <p className="mt-2 text-sm text-white/55">
                Back = previous env, Next = next step. Ye learning ke liye best feature hai.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <div className="text-white font-semibold">Topic 3: Variables Panel</div>
              <p className="mt-2 text-sm text-white/55">
                Variables tab me current memory values check karo.
              </p>
            </div>
          </div>

          <div className="mt-6">
            <CodeBlock
              title="Debug Test 1: Division by Zero"
              hint="Debug → error line par stop hoga. Variables tab me x,y dekho."
              code={debugExample}
              expected={`10\n(then error in Problems tab)`}
              onCopy={() => copyToClipboard(debugExample)}
              onOpen={() => openInIde(debugExample)}
            />
          </div>

          <div className="mt-4">
            <CodeBlock
              title="Debug Test 2: List Index Out of Range"
              hint="Debug mode se check karo line + expression message."
              code={debugExample2}
              expected={`(error in Problems tab)`}
              onCopy={() => copyToClipboard(debugExample2)}
              onOpen={() => openInIde(debugExample2)}
            />
          </div>

          <div className="mt-4">
            <CodeBlock
              title="Debug Test 3: Undefined Variable"
              hint="Problems tab me variable define nahi error aayega."
              code={debugExample3}
              expected={`(error in Problems tab)`}
              onCopy={() => copyToClipboard(debugExample3)}
              onOpen={() => openInIde(debugExample3)}
            />
          </div>

          <div className="mt-6 rounded-3xl border border-white/10 bg-[#070B12] p-6">
            <div className="text-white font-bold">✅ Debugging Checklist</div>
            <ul className="mt-3 space-y-2">
              <Bullet>
                Error aaya → <b className="text-white">Problems</b> tab open karo
              </Bullet>
              <Bullet>
                Line number dekho → editor me same line pe focus karo
              </Bullet>
              <Bullet>
                Expression dekho → galat operation/type issue samjho
              </Bullet>
              <Bullet>
                Variables tab → current values check
              </Bullet>
              <Bullet>
                Back/Next → kaha value galat hui wahi detect karo
              </Bullet>
            </ul>
          </div>
        </SectionCard>
      ),
    });

    // =====================================================
    // 15) MINI PRACTICE SET
    // =====================================================
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
            onCopy={() => copyToClipboard(practice1)}
            onOpen={() => openInIde(practice1)}
          />

          <div className="h-4" />

          <CodeBlock
            title="Practice 2: Even Numbers"
            code={practice2}
            expected={`2\n4\n6\n8\n10`}
            onCopy={() => copyToClipboard(practice2)}
            onOpen={() => openInIde(practice2)}
          />

          <div className="h-4" />

          <CodeBlock
            title="Practice 3: Function Square"
            code={practice3}
            expected={`64`}
            onCopy={() => copyToClipboard(practice3)}
            onOpen={() => openInIde(practice3)}
          />
        </SectionCard>
      ),
    });

    return T;
  }, []);

  const activeTopic = topics.find((t) => t.id === activeId) || topics[0];

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
              <div className="text-lg font-extrabold">Learn AYR Runtime</div>
              <div className="text-xs text-white/45">
                Language • Web IDE • Debugging
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/code-now"
              className="rounded-2xl bg-cyan-500 px-5 py-2 text-xs font-semibold text-black hover:bg-cyan-400"
            >
              Open IDE →
            </Link>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div className="mx-auto max-w-7xl px-4 py-8 grid gap-6 md:grid-cols-[340px_1fr]">
        {/* LEFT NAV */}
        <TopicNav topics={topics} activeId={activeId} setActiveId={setActiveId} />

        {/* CONTENT */}
        <div className="flex flex-col gap-6">
          {activeTopic?.content}

          {/* FOOTER CTA */}
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-7 text-center">
            <div className="text-2xl font-extrabold">
              Ready to build projects in AYR Runtime?
            </div>
            <p className="mt-2 text-sm text-white/55">
              Learn page complete karne ke baad IDE open karo aur apne own programs build karo.
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

          {/* QUICK NOTE */}
          <div className="text-xs text-white/35">
            Tip: Debug mode me Timeline + Variables tab use karke tum runtime execution 10x fast samajh loge.
          </div>
        </div>
      </div>
    </div>
  );
}
