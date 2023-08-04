import { createServer } from "node:http";
import { EventEmitter } from "node:events";
import { readFileSync } from "node:fs";

type Color = "red" | "blue";

type State = {
  registeredColor?: Color;
  registerTimeoutId?: ReturnType<typeof setTimeout>;
  canRegister: boolean;
};

const state: State = {
  registeredColor: undefined,
  registerTimeoutId: undefined,
  canRegister: true,
};

const eventEmitter = new EventEmitter();
const ROUND_DONE = "ROUND_DONE";
const port = 8080;
const index = readFileSync("index.html", { encoding: "utf8" });

const getHeaders = (rawHeaders: string[]) => {
  const keys = rawHeaders.filter((_, i) => i % 2 === 0);
  const values = rawHeaders.filter((_, i) => i % 2 === 1);
  const headers = new Map();
  keys.forEach((key, index) => {
    headers.set(key, values[index]);
  });
  return headers;
};

const registerTouch = (color: Color) => {
  if (!state.canRegister || state.registeredColor === color) {
    return;
  }
  if (state.registerTimeoutId) {
    state.canRegister = false;
    clearTimeout(state.registerTimeoutId);
    state.registerTimeoutId = undefined;
    eventEmitter.emit(ROUND_DONE, "draw");
    state.registeredColor = undefined;
    setTimeout(() => {
      state.canRegister = true;
    }, 3000);
    return;
  }
  state.registeredColor = color;
  state.registerTimeoutId = setTimeout(() => {
    state.canRegister = false;
    clearTimeout(state.registerTimeoutId);
    state.registerTimeoutId = undefined;
    eventEmitter.emit(ROUND_DONE, color);
    state.registeredColor = undefined;
    setTimeout(() => {
      state.canRegister = true;
    }, 3000);
  }, 40);
};

createServer((req, res) => {
  switch (req.url) {
    case "/": {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.write(index);
      res.end();
      break;
    }
    case "/button": {
      res.writeHead(200);
      const headers = getHeaders(req.rawHeaders);
      const color = headers.get("X-Color");
      if (color === "red") {
        registerTouch("red");
      } else if (color === "blue") {
        registerTouch("blue");
      }
      res.end();
      break;
    }
    case "/sse": {
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      });
      res.write("\n\n");
      const listener = (winner: Color | "draw") => {
        res.write(`data: ${winner}\n\n`);
      };
      eventEmitter.on(ROUND_DONE, listener);
      req.on("close", () => eventEmitter.removeListener(ROUND_DONE, listener));
      break;
    }
    default: {
      res.writeHead(404);
      res.write("404 Not Found");
      res.end();
    }
  }
}).listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
