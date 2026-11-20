const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("=== RUNNING CAPTURE BUILD ===");

const res = spawnSync("npx", ["next", "build", "--webpack"], {
  shell: true,
  encoding: "utf8",
  env: { ...process.env, CI: "1", NODE_ENV: "production" },
});

const outDir = path.join(process.cwd(), "out");
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const report = `
=== EXIT STATUS ===
Status: ${res.status}
Signal: ${res.signal}
Error: ${res.error ? res.error.stack || res.error.message : "(none)"}

=== STDERR ===
${res.stderr || "(empty)"}

=== STDOUT ===
${res.stdout || "(empty)"}
`;

fs.writeFileSync(path.join(outDir, "index.html"), `<!DOCTYPE html><html><body><h1>Build Diagnostic Report</h1><pre>${report.replace(/</g, "&lt;")}</pre></body></html>`);
fs.writeFileSync(path.join(outDir, "report.txt"), report);

console.log("=== REPORT CREATED ===");
console.log(report.slice(0, 1000));
