from lexer import Lexer
from parser import Parser
from interpreter import Interpreter, ExpressionError


def main():
    file = input("Source file: ")
    code = open(file, encoding="utf-8").read()

    tokens = Lexer(code).tokenize()
    program = Parser(tokens).parse()

    interp = Interpreter()
    interp.load(program)

    print("""
Commands: 
| run | step | back | next | env | detail | detail --timeline | detail --last | detail --memory | exit |
""")

    while True:
        try:
            cmd = input(">>> ").strip()

            if cmd == "run":
                interp.run()
                print("✅ Program executed")

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

            # ---------------- DETAIL COMMANDS ----------------

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

            elif cmd == "exit":
                print("Bye 👋")
                break

            else:
                print("❓ Unknown command")

        except ExpressionError as e:
            print(e)

        except Exception as e:
            print("❌ Runtime Error:", e)


if __name__ == "__main__":
    main()
