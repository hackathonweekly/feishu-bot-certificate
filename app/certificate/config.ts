// 明确声明certificate路由为动态路由
// 这将阻止Next.js在构建时尝试预渲染此页面
export const dynamic = 'force-dynamic';

// 禁用自动静态优化
export const dynamicParams = true;

// 禁用ISR缓存
export const revalidate = 0; 