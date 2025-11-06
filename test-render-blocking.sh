#!/bin/bash

# 渲染阻塞资源测试脚本
# 用于验证优化后的性能改善

echo "======================================"
echo "渲染阻塞资源优化测试"
echo "======================================"
echo ""

# 检查 Hugo 是否安装
if ! command -v hugo &> /dev/null; then
    echo "❌ Hugo 未安装，请先安装 Hugo"
    exit 1
fi

echo "✅ Hugo 已安装"
echo ""

# 构建站点
echo "📦 构建站点..."
hugo --minify

if [ $? -eq 0 ]; then
    echo "✅ 站点构建成功"
else
    echo "❌ 站点构建失败"
    exit 1
fi

echo ""
echo "======================================"
echo "优化检查清单"
echo "======================================"
echo ""

# 检查关键文件是否存在
echo "📋 检查优化文件..."
echo ""

files=(
    "layouts/partials/head/head.html"
    "layouts/partials/head/style.html"
    "layouts/partials/comments/provider/waline.html"
    "layouts/partials/helper/mermaid.html"
    "layouts/partials/helper/katex.html"
    "data/external.yaml"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file 不存在"
    fi
done

echo ""
echo "======================================"
echo "关键优化点验证"
echo "======================================"
echo ""

# 检查 preconnect
echo "🔍 检查 CDN 预连接..."
if grep -q "preconnect.*unpkg.com" layouts/partials/head/head.html; then
    echo "✅ unpkg.com 预连接已添加"
else
    echo "⚠️  unpkg.com 预连接未找到"
fi

if grep -q "preconnect.*jsdelivr" layouts/partials/head/head.html; then
    echo "✅ jsdelivr 预连接已添加"
else
    echo "⚠️  jsdelivr 预连接未找到"
fi

echo ""

# 检查 Waline 懒加载
echo "🔍 检查 Waline 懒加载..."
if grep -q "IntersectionObserver" layouts/partials/comments/provider/waline.html; then
    echo "✅ Waline 懒加载已实现"
else
    echo "⚠️  Waline 懒加载未找到"
fi

echo ""

# 检查 Mermaid 延迟加载
echo "🔍 检查 Mermaid 延迟加载..."
if grep -q "window.addEventListener.*load" layouts/partials/helper/mermaid.html; then
    echo "✅ Mermaid 延迟加载已实现"
else
    echo "⚠️  Mermaid 延迟加载未找到"
fi

echo ""

# 检查 PhotoSwipe 异步加载
echo "🔍 检查 PhotoSwipe 异步加载..."
if grep -q "async: true" data/external.yaml; then
    echo "✅ PhotoSwipe 异步加载已配置"
else
    echo "⚠️  PhotoSwipe 异步加载未找到"
fi

echo ""
echo "======================================"
echo "性能测试建议"
echo "======================================"
echo ""

echo "请使用以下工具测试优化效果："
echo ""
echo "1. Google PageSpeed Insights"
echo "   https://pagespeed.web.dev/"
echo ""
echo "2. WebPageTest"
echo "   https://www.webpagetest.org/"
echo ""
echo "3. Chrome DevTools Lighthouse"
echo "   - 打开 Chrome DevTools (F12)"
echo "   - 切换到 Lighthouse 标签"
echo "   - 运行性能审计"
echo ""
echo "4. 本地测试服务器"
echo "   hugo server --minify"
echo "   然后在浏览器中打开 http://localhost:1313"
echo "   使用 Network 面板查看资源加载顺序"
echo ""

echo "======================================"
echo "预期改善"
echo "======================================"
echo ""
echo "✨ 渲染阻塞时间: 从 1,310ms 减少到接近 0ms"
echo "✨ LCP (Largest Contentful Paint): 预计改善 30-50%"
echo "✨ FCP (First Contentful Paint): 预计改善 20-40%"
echo "✨ 总体性能评分: 预计提升 10-20 分"
echo ""

echo "✅ 测试完成！"
