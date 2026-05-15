import fs from "node:fs";
import path from "node:path";
import type { Connect } from "vite-plus";
import { defineConfig } from "vite-plus";

function directoryTrailingSlash(root: string): Connect.NextHandleFunction {
  return (req, res, next) => {
    const pathname = req.url?.split("?")[0];

    if (
      pathname &&
      !pathname.endsWith("/") &&
      !path.extname(pathname) &&
      fs.existsSync(path.join(root, pathname, "index.html"))
    ) {
      res.statusCode = 301;
      res.setHeader("Location", `${pathname}/`);
      res.end();
      return;
    }

    next();
  };
}

export default defineConfig({
  plugins: [
    {
      name: "directory-trailing-slash",
      configureServer(server) {
        server.middlewares.use(directoryTrailingSlash(server.config.root));
      },
      configurePreviewServer(server) {
        server.middlewares.use(directoryTrailingSlash("dist"));
      },
    },
  ],
  server: {
    host: true,
    port: 2244,
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve("index.html"),
        anchor: path.resolve("notebook/anchor/index.html"),
      },
    },
  },
  lint: { options: { typeAware: true, typeCheck: true } },
});
