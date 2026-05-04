import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: [
        'src/utils/safety-check.ts',
        'src/utils/gemini-config.ts',
        'src/utils/news-config.ts',
        'src/utils/youtube-config.ts',
        'src/app/api/contact/route.ts',
        'src/app/api/incident/route.ts',
        'src/app/api/incident/update-status/route.ts',
        'src/app/api/gemini/route.ts',
      ],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
});
