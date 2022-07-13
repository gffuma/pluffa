#!/usr/bin/env node
// @ts-check
const childProcess = require("child_process");
const path = require("path");

async function main() {
  // NOTE: Many thanks to:
  // https://github.com/cloudflare/miniflare/blob/master/packages/miniflare/bootstrap.js
  // <3 <3 <3
  // Spawn a new process using the same Node.js executable and passing the same
  // command line arguments, but with required flags for modules support.
  //
  // This is the only cross-platform way of doing this I can think of. On
  // Mac/Linux, we can use "#!/usr/bin/env -S node ..." as a shebang, but this
  // won't work on Windows (or older Linux versions, e.g. Ubuntu 18.04). If you
  // can think of a better way of doing this, please open a GitHub issue.
  childProcess
    .spawn(
      process.execPath,
      [
        "--experimental-vm-modules",
        ...process.execArgv,
        path.join(__dirname, "dist", "cli.js"),
        ...process.argv.slice(2),
      ],
      { stdio: "inherit" }
    )
    .on("exit", (code) => process.exit(code === null ? 1 : code));
}

void main();