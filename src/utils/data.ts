/**
 * 多语言数据访问器
 * - 支持 zh / en 双语
 * - en 缺失字段时自动 fallback 到 zh（渐进翻译策略）
 *
 * 数据目录约定：
 *   src/data/
 *     site.json            (站点级共享配置：brand / contact)
 *     {lang}/
 *       components.json     (各业务组件数据：FullHeader / Hero / Features ...)
 *       site.json          (语言相关：seo 默认值 / 文案)
 *       pages.json         (页面配置：title / description / sections / breadcrumbs)
 *       products.json      (产品列表)
 *
 * 用法：
 *   import { getComponentData, getPageConfig } from '../utils/data';
 *   const header = getComponentData('zh', 'FullHeader');
 */

import siteCommon from '../data/site.json';
import zhComponentsJson from '../data/zh/components.json';
import enComponentsJson from '../data/en/components.json';
import zhSiteJson from '../data/zh/site.json';
import enSiteJson from '../data/en/site.json';
import zhPagesJson from '../data/zh/pages.json';
import enPagesJson from '../data/en/pages.json';
import zhProductsJson from '../data/zh/products.json';
import enProductsJson from '../data/en/products.json';

// JSON 内容是动态的（由 data/{lang}/*.json 决定键与值）。
// 静态导入时 TS 推断为空对象或严格字面量类型，这里强制为 Record<string, any>。
const zhComponents: Record<string, any> = zhComponentsJson as Record<string, any>;
const enComponents: Record<string, any> = enComponentsJson as Record<string, any>;
const zhSite: Record<string, any> = zhSiteJson as Record<string, any>;
const enSite: Record<string, any> = enSiteJson as Record<string, any>;
const zhPages: Record<string, any> = zhPagesJson as Record<string, any>;
const enPages: Record<string, any> = enPagesJson as Record<string, any>;
const zhProducts: any[] = Array.isArray(zhProductsJson) ? (zhProductsJson as any[]) : [];
const enProducts: any[] = Array.isArray(enProductsJson) ? (enProductsJson as any[]) : [];

export type Lang = 'zh' | 'en';

export const DEFAULT_LANG: Lang = 'zh';

/** 规范化语言代码：未知值回退默认 */
export function normalizeLang(lang: string | undefined | null): Lang {
  return lang === 'en' ? 'en' : 'zh';
}

/** 深度合并：fallback 字段补全 */
function deepMerge<T extends Record<string, any>>(primary: T, fallback: T): T {
  if (!fallback || typeof fallback !== 'object') return primary;
  if (!primary || typeof primary !== 'object') return fallback;
  const out: Record<string, any> = { ...fallback, ...primary };
  for (const k in fallback) {
    const fv = fallback[k];
    const pv = primary[k];
    if (fv && typeof fv === 'object' && !Array.isArray(fv)) {
      out[k] = deepMerge(pv ?? {}, fv);
    }
  }
  return out as T;
}

/**
 * 读取 components.json 中的组件数据
 * @param lang 语言代码
 * @param key 组件 key（FullHeader / Hero / Features / BottomCTA ...）
 */
export function getComponentData(
  lang: string | undefined,
  key: string
): any {
  const l = normalizeLang(lang);
  if (l === 'en') {
    return deepMerge(zhComponents[key] ?? {}, enComponents[key] ?? {});
  }
  return zhComponents[key];
}

/**
 * 读取 pages.json 中的页面配置
 */
export function getPageConfig(
  lang: string | undefined,
  key: string
): any {
  const l = normalizeLang(lang);
  if (l === 'en') {
    return deepMerge(zhPages[key] ?? {}, enPages[key] ?? {});
  }
  return zhPages[key];
}

/**
 * 读取语言相关 site 配置
 */
export function getSiteLang(lang: string | undefined) {
  const l = normalizeLang(lang);
  if (l === 'en') return deepMerge(zhSite, enSite);
  return zhSite;
}

/**
 * 站点共享配置（不分语言）
 */
export function getSiteCommon() {
  return siteCommon;
}

/**
 * 读取产品列表
 */
export function getProducts(lang: string | undefined) {
  const l = normalizeLang(lang);
  if (l === 'en') return enProducts ?? zhProducts;
  return zhProducts;
}

/**
 * 根据 slug 查找单个产品
 */
export function getProductBySlug(lang: string | undefined, slug: string) {
  const list = getProducts(lang);
  return (list as any[]).find((p: any) => p?.slug === slug) ?? null;
}