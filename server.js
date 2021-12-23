const Koa = require("koa");
const koaBody = require("koa-body");
const Router = require("@koa/router");
const lips = require("@jcubic/lips");
const childProcess = require("child_process");

const app = new Koa();
const router = new Router();

const setupLips = () => {
  const load = lips.env.get("load");

  load.call(lips.env, `./node_modules/@jcubic/lips/dist/std.min.scm`, lips.env);
};

setupLips();

router.put("/exec", async (ctx) => {
  const body = ctx.request.body;

  if (!body.language) {
    ctx.status = 400;
    ctx.body = `400: Language must be defined`;
    return;
  }

  if (!body.command) {
    ctx.status = 400;
    ctx.body = `400: Command must be defined`;
    return;
  }

  switch (body.language) {
    case "scheme":
      results = await lips.exec(body.command);

      let resultString = "";
      results.forEach((result) => {
        if (!result) {
          return;
        }
        resultString += result.toString() + "\n";
      });

      ctx.status = 200;
      ctx.set("Content-Type", "application/json");
      ctx.body = {
        result: resultString,
      };
      return;
    default:
      // Start a promise so we can easily await with the new ES6 syntax
      const { stdout, stderr } = await new Promise((resolve, reject) => {
        let result = "";
        // Spawn a child process, executed separately from the main process.
        const process = childProcess.spawn(body.language, ["eval.py"]);
        // Feed the command we received through stdin
        process.stdin.end(body.command);

        // Listen to any output
        process.stdout.on("data", (data) => {
          result += data.toString();
        });

        // Wait for the process to close
        process.on("close", (code) => {
          resolve(
            code === 0
              ? { stdout: result, stderr: "" }
              : { stdout: "", stderr: result }
          );
        });
        process.on("error", (err) => {
          reject({ stdout: "", stderr: err.toString() });
        });
      });

      ctx.status = 200;
      ctx.set("Content-Type", "application/json");

      if (stderr) {
        ctx.body = {
          result: stderr,
        };
        return;
      }

      ctx.body = {
        result: stdout,
      };
      return;
  }
});

app
  .use(koaBody())
  .use(router.routes())
  .use(router.allowedMethods())
  .listen(3000);
