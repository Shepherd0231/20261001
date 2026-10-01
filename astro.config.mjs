// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://moletaokids.com',

  // ===== i18n 多语言路由配置 =====
  // 架构：
  //   - defaultLocale='zh' (中文) → 路由无前缀 (/, /products, /about)
  //   - locales: ['zh', 'en']      → 英文走 /en/ 前缀
  //   - trailingSlash: 'always'    → 与 Cloudflare Pages 静态托管保持一致
  //   - fallback: en → zh          → 英文缺失数据回退中文（渐进翻译）
  i18n: {
    defaultLocale: 'zh',
    locales: ['zh', 'en'],
    routing: {
      prefixDefaultLocale: true,
      redirectToDefaultLocale: false,
    },
    fallback: {
      en: 'zh',
    },
  },

  trailingSlash: 'always',

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [sitemap()],
});