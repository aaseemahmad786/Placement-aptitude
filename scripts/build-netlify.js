const { spawn } = require("child_process");

async function sendLog(title, message) {
  try {
    await fetch("https://ntfy.sh/nqt-compass-build-log", {
      method: "POST",
      headers: { Title: title },
      body: String(message).slice(-4000),
    });
  } catch (e) {
    console.error("Failed to send log to ntfy:", e);
  }
}

async function run() {
  await sendLog("Build Started", `Node: ${process.version}, OS: ${process.platform} ${process.arch}`);

  const child = spawn("npx", ["next", "build", "--webpack"], {
    stdio: "pipe",
    shell: true,
    env: { ...process.env, CI: "1", NODE_ENV: "production" },
  });

  let output = "";
  child.stdout.on("data", (d) => {
    process.stdout.write(d);
    output += d.toString();
  });
  child.stderr.on("data", (d) => {
    process.stderr.write(d);
    output += d.toString();
  });

  child.on("close", async (code) => {
    console.log(`[build-netlify] next build exited with code: ${code}`);
    await sendLog(`Build ${code === 0 ? "SUCCESS" : "FAILED (code " + code + ")"}`, output);
    process.exit(code || 0);
  });
}

run();
