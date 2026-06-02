import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    // Default to node; component tests opt into jsdom via `// @vitest-environment jsdom`.
    environment: 'node',
    globals: true,
    setupFiles: ['./tests/setup/vitest.setup.ts'],
    include: ['tests/**/*.{test,spec}.{ts,tsx}'],
    // Deterministic env for modules that read validated env at import time.
    env: {
      DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
      JWT_ACCESS_SECRET: 'test_access_secret_at_least_32_chars_long_xx',
      JWT_REFRESH_SECRET: 'test_refresh_secret_at_least_32_chars_long_x',
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      // `import 'server-only'` would throw outside the RSC bundler — stub it in tests.
      'server-only': resolve(__dirname, './tests/mocks/server-only.ts'),
    },
  },
})
