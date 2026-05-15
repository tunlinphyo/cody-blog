import { defineConfig } from "vite-plus";

export default defineConfig({
  server: {
    host: true,
    port: 2244
  },
  lint: { options: { typeAware: true, typeCheck: true } },
});
