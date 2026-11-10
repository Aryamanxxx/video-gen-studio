#!/usr/bin/env node
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const venvPythonWin = path.join(rootDir, ".mcp-servers", "mcp-video-gen", ".venv", "Scripts", "python.exe");
const venvPythonUnix = path.join(rootDir, ".mcp-servers", "mcp-video-gen", ".venv", "bin", "python");

let pythonBin = "python";
if (process.platform === "win32" && fs.existsSync(venvPythonWin)) {
  pythonBin = venvPythonWin;
} else if (fs.existsSync(venvPythonUnix)) {
  pythonBin = venvPythonUnix;
}

const scriptPath = path.join(rootDir, "scripts", "generate-voiceover.py");
const args = [scriptPath, ...process.argv.slice(2)];

const child = spawn(pythonBin, args, { stdio: "inherit" });
child.on("exit", (code) => {
  process.exit(code || 0);
});
