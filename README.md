# AYR Runtime 🚀

**AYR Runtime** is a Hindi-keyword based programming language + runtime engine + Web IDE that lets you **write, run, and debug** code directly in the browser.

✅ Built from scratch (Lexer → Parser → Interpreter)
✅ Web-based IDE (no setup)
✅ Debugger with **Timeline + Back/Next time-travel**

---

## 🌐 Live Demo

* **Frontend (Web IDE):** [https://ayr-runtime.vercel.app](https://ayr-runtime.vercel.app)
* **Backend (API):** [https://ayr-runtime.onrender.com](https://ayr-runtime.onrender.com)

---

## ✨ Key Highlights

### ✅ Hindi-Keyword Programming Language

Write programs using readable Hindi-like keywords:

* `dikhao` → print/output
* `pucho` → input
* `agar` / `warna` → if / else
* `jabtak` → while loop
* `har ... main` → for loop
* `kaam` / `wapas` → functions & return
* `band` / `chalu` → break / continue
* `class` → OOP support

---

## 🧠 What You Can Build

AYR Runtime is perfect for:

* Beginners learning programming fundamentals
* Understanding how real languages work internally
* Practicing problem-solving in a clean environment
* Learning debugging step-by-step (timeline + state)

---

## ⚡ Features

### ✅ Language Features

* Variables + strong runtime checks
* Numbers (`int`, `float`), strings, booleans, `none`
* Arithmetic: `+ - * / %`
* Comparisons: `> < >= <= == !=`
* Logical operations: `aur` (AND), `ya` (OR), `nahi` (NOT)
* Indentation blocks (Python-style)
* Functions (`kaam`, `wapas`)
* Input (`pucho`) + multi-input assignment
* Lists + indexing + index assignment
* OOP: `class`, methods, fields, constructor (`__init__`)

### ✅ Runtime & Developer Experience

* Human-friendly runtime errors with:

  * exact line number
  * readable explanation
  * expression context
* Warnings system (ex: unused variables)

### ✅ Debugging (Web IDE)

* **Run Mode** for instant execution
* **Debug Mode** with:

  * Back / Next step navigation
  * Timeline snapshots (env per step)
  * Variables inspector (ENV view)
  * Memory usage panel

---

## 🧩 Tech Stack

### Frontend

* React
* Monaco Editor
* Custom AYR syntax highlighting

### Backend

* Python
* FastAPI

### Deployment

* Frontend: **Vercel**
* Backend: **Render**

---

## 📂 Project Structure

```bash
AYR-Runtime/
├─ backend/
│  ├─ app/
│  │  ├─ runtime/
│  │  │  ├─ lexer.py
│  │  │  ├─ parser.py
│  │  │  ├─ nodes.py
│  │  │  ├─ interpreter.py
│  │  │  └─ state_manager.py
│  │  └─ main.py
│  └─ requirements.txt
│
├─ frontend/
│  ├─ src/
│  │  ├─ pages/
│  │  │  ├─ home.jsx
│  │  │  ├─ playground.js
│  │  │  └─ learn.jsx
│  │  ├─ components/
│  │  │  ├─ Editor.jsx
│  │  │  ├─ Controls.jsx
│  │  │  ├─ FileExplorer.jsx
│  │  │  ├─ InspectorTabs.jsx
│  │  │  └─ InspectorPanel.jsx
│  │  ├─ hooks/
│  │  │  └─ useRuntime.js
│  │  └─ services/
│  │     └─ api.js
│  └─ package.json
└─ README.md
```

---

## 🧪 Example Programs

### ✅ Hello World

```ayr
dikhao "Hello AYR Runtime!"
```

### ✅ Variables + Math

```ayr
x = 10
y = 5

dikhao x + y
```

### ✅ If / Else

```ayr
x = 10

agar x > 5
    dikhao "x is greater than 5"
warna
    dikhao "x is small"
```

### ✅ While Loop

```ayr
i = 1

jabtak i <= 5
    dikhao i
    i = i + 1
```

### ✅ Function

```ayr
kaam add(a, b)
    wapas a + b

dikhao add(10, 20)
```

### ✅ Class / Object

```ayr
class Person:
    kaam __init__(self, name):
        self.name = name

    kaam show(self):
        dikhao "Hello {self.name}"

p = Person("Boss")
p.show()
```

---

## 🐞 Debugging Guide (Quick)

### Run Mode

* Press **▶ Run**
* Output shows in **Output tab**

### Debug Mode

* Press **🐞 Debug**
* Use:

  * **⬅ Back** to go to previous state
  * **➡ Next** to go forward
* Inspect:

  * **Timeline** → step-by-step state snapshots
  * **Variables** → current ENV values
  * **Problems** → error + expression details

---

## ⚙️ Local Setup

### 1) Clone Repository

```bash
git clone https://github.com/<your-username>/AYR-Runtime.git
cd AYR-Runtime
```

---

### 2) Backend Setup

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend runs on:

* [http://127.0.0.1:8000](http://127.0.0.1:8000)

---

### 3) Frontend Setup

```bash
cd ../frontend
npm install
npm run dev
```

Frontend runs on:

* [http://localhost:5173](http://localhost:5173)

---

## 🚀 Deployment

### ✅ Backend (Render)

* Root Directory: `backend`
* Build: `pip install -r requirements.txt`
* Start: `uvicorn app.main:app --host 0.0.0.0 --port 10000`

### ✅ Frontend (Vercel)

* Root Directory: `frontend`
* Build: `npm run build`
* Output: `dist`
* Add env var:

  * `VITE_API_URL=https://<your-backend>.onrender.com`

---

## 🤝 Contributing

Contributions are welcome.

✅ Ideas you can contribute:

* Dict / tuple literal parsing
* Better error highlighting in editor
* Jump-to-line from Timeline
* Standard library functions
* Better docs + tutorials

---

## 📌 Author

Built by **Ajit Yamgar**

* LinkedIn: [https://linkedin.com/in/ajit-yamgar](https://linkedin.com/in/ajit-yamgar)
* GitHub: [https://github.com/ajityamgar](https://github.com/ajityamgar)
* Portfolio: [https://ajitt.netlify.app/](https://ajitt.netlify.app/)

---

## ⭐ Support

If you find AYR Runtime interesting:

* ⭐ Star the repo
* 🔁 Share with friends
* 💬 Open issues / feature requests

**AYR Runtime is just the beginning. More updates coming soon.** 🚀
