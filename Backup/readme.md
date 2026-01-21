1. variable create karte hi problems show ho, (code run karne ki koi jarurant nahi)

new datatypes - 
Class / Object
Boolean

normal run button par click karne par program complete run hoga and progrma mian jitne bhi error and warning hia oo show hoga.


variable ki current value in - dikhao "table of {x}"

implement all commands 


/------------------------------------------------------------------------------------------------------------------------/

🚀 AYR Runtime — Complete Feature & Command List
🧠 AYR Runtime kya hai?

AYR Runtime ek Hindi-keyword based programming language + runtime + debugger hai jo:

beginners ke liye friendly hai

real programming concepts sikhata hai

time-travel debugging support karta hai

interpreter + debugger + web-IDE ke saath aata hai

🖥️ RUNTIME COMMANDS (CLI / Web IDE)
▶️ Execution Commands
Command	Description
run	Code ko fresh reload karke execute karta hai
step	Ek statement execute karta hai
back	Execution state ko ek step peeche le jata hai
next	Execution state ko aage le jata hai
debug	Execution trace (functions, loops, iterations) dikhata hai
env	Current variables & values dikhata hai
exit	Runtime band karta hai
🧭 Debug / Inspection Commands
Command	Description
detail	State summary (states count, index)
detail --timeline	Full execution timeline (time travel states)
detail --last	Last snapshot state
detail --memory	Memory usage (approx KB)
🧩 LANGUAGE KEYWORDS (Hindi Based)
📌 Control Flow

agar → if

warna → else / elif

jabtak → while

har → for-each loop

band → break

chalu → continue

wapas → return

📌 Functions

kaam → function definition

Function call → func()

📌 Logical Keywords

aur → logical AND

ya → logical OR

nahi → logical NOT

📌 Input / Output

dikhao → print

pucho → input

📦 DATA TYPES SUPPORTED
Data Type	Example
Integer	10
Float	10.5
String	"hello"
Boolean	sach, jhoot
None	none
List	[1, 2, 3]
Tuple	(1, 2)
Dictionary	{ "a": 10 }
🧮 EXPRESSIONS SUPPORTED
➕ Arithmetic

+, -, *, /, %

Zero division check

Type mismatch detection

🔍 Comparison

>, <, >=, <=, ==, !=

Strict type comparison

string > int ❌ (error)

🔗 Logical

aur, ya, nahi

Boolean-only enforcement

🧠 ADVANCED EXPRESSIONS

Nested expressions

Function return expressions

Index access → nums[1]

Index assignment → nums[1] = 99

Dictionary access → data["key"]

🧱 STATEMENTS SUPPORTED

Variable assignment

x = 10


Multiple assignment

a, b = pucho


Print

dikhao x


If / Else / Elif

While loop

For-each loop with index

Function definition & calls

Return, break, continue

⏱️ TIME-TRAVEL DEBUGGING (CORE FEATURE)

AYR Runtime har execution step ka snapshot save karta hai:

Backward execution (back)

Forward execution (next)

Timeline inspection

State rollback

Loop iteration tracking

Function call tracing

Example timeline:

[0] {}
[1] {'x': 10}
[2] {'x': 11}
[3] {'x': 12}

❌ ERROR HANDLING (BEGINNER FRIENDLY)
🔴 ExpressionError (Hindi)
❌ Expression Error (Line 8):
   Galat arithmetic: int aur string ka addition allowed nahi hai.
   Expression: x + y

Errors Covered:

Undefined variable

Type mismatch

Invalid comparison

Index out of range

Invalid indexing

Division by zero

Return outside function

Invalid function call

Wrong argument count

⚠️ WARNINGS (Pre-Execution)

Variable defined but not used

Potential logical mistakes

Unsafe operations (future)

⚠️ Warnings code run hone se pehle hi detect hote hain

🧭 DEBUG TRACE FEATURE

debug command output:

examples/test.ttl/ line 3 | PrintNode ✔
↳ loop iteration 1
↳ loop iteration 2
↳ loop iteration 3


File path

Line number

Statement type

Loop iteration count

Function execution trace