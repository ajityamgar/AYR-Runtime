import React from "react";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#070B12]">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-cyan-300 text-xl font-bold">{`</>`}</span>
              <span className="text-lg font-semibold">AYR Runtime</span>
            </div>
            <p className="mt-3 max-w-md text-sm text-white/60">
            this is an open-source project to help you run and debug AYR code snippets in your browser.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 text-sm md:grid-cols-2">
            <div>              <ul className="space-y-2 text-white/60">
                <li className="hover:text-white transition cursor-pointer">Documentation</li>
                <li className="hover:text-white transition cursor-pointer">GitHub</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
