from lexer import Lexer
from parser import Parser
from interpreter import Interpreter, ExpressionError


def load_program(file_path):
    code = open(file_path, encoding="utf-8").read()
    tokens = Lexer(code).tokenize()
    program = Parser(tokens).parse()
    interp = Interpreter()
    interp.current_file = file_path  # debug trace ke liye
    interp.load(program)
    return interp


def main():
    file = input("Source file: ").strip()

    # initial load
    interp = load_program(file)

    print("""
=== AYR Runtime ===

Commands:
 run                 → reload file & fresh run
 step                → next statement execute
 back                → previous state
 next                → forward state
 env                 → current variables
detail              → state summary
 detail --timeline   → full execution timeline
 detail --last       → last state snapshot
 detail --memory     → memory usage
 debug               → execution trace (functions / loops)
 exit                → quit runtime
""")

    while True:
        try:
            cmd = input(">>> ").strip()

            # ---------------- RUN (RELOAD FILE) ----------------
            if cmd == "run":
                print("▶️ RUN")
                print("Program execution started...\n")
                interp = load_program(file)
                interp.run()
                if not interp.paused:
                    print("\n✅ Program executed successfully")

            # ---------------- DEBUG ----------------
            elif cmd == "debug":
                interp.debug()

            elif cmd == "step":
                interp.step()
                print("➡️ STEP:", interp.env)

            elif cmd == "back":
                interp.env = interp.state.back()
                print("⬅️ BACK:", interp.env)

            elif cmd == "next":
                interp.env = interp.state.next()
                print("➡️ NEXT:", interp.env)

            elif cmd == "env":
                print("ENV:", interp.env)

            # ---------------- DETAIL ----------------
            elif cmd == "detail":
                info = interp.state.info()
                print("📊 STATE INFO")
                print("Total States :", info["total_states"])
                print("Current Index:", info["current_index"])
                print("Has Past     :", info["has_past"])
                print("Has Future   :", info["has_future"])

            elif cmd == "detail --timeline":
                print("🕒 TIMELINE")
                for i, s in enumerate(interp.state.timeline()):
                    print(f"[{i}] {s}")

            elif cmd == "detail --last":
                print("🧾 LAST STATE")
                print(interp.state.last())

            elif cmd == "detail --memory":
                print("💾 MEMORY USAGE")
                print(f"{interp.state.memory_kb()} KB")

            # ---------------- EXIT ----------------
            elif cmd == "exit":
                print("Bye 👋")
                break

            else:
                print("❓ Unknown command")

        except ExpressionError as e:
            # Error already printed by interpreter (pause + message)
            print(e)

        except Exception as e:
            print("❌ Runtime Error:", e)


if __name__ == "__main__":
    main()
