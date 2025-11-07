#!/bin/bash

# 渲染阻塞优化验证脚本

echo "=================================================="
echo "渲染阻塞优化验证"
echo "=================================================="
echo ""

# 1. 检查本地资源文件是否存在
echo "1. 检查本地资源文件..."
MISSING_FILES=0

FILES=(
    "static/lib/vibrant/vibrant.min.js"
    "static/lib/photoswipe/photoswipe.min.js"
    "static/lib/photoswipe/photoswipe-ui-default.min.js"
    "static/lib/photoswipe/photoswipe.css"
    "static/lib/photoswipe/dist/default-skin/default-skin.css"
    "static/lib/photoswipe/dist/default-skin/default-skin.png"
    "static/lib/photoswipe/dist/default-skin/default-skin.svg"
    "static/lib/photoswipe/dist/default-skin/preloader.gif"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        SIZE=$(du -h "$file" | cut -f1)
        echo "  ✓ $file ($SIZE)"
    else
        echo "  ✗ $file 缺失"
        MISSING_FILES=$((MISSING_FILES + 1))
    fi
done

if [ $MISSING_FILES -gt 0 ]; then
    echo ""
    echo "警告: 有 $MISSING_FILES 个文件缺失！"
    exit 1
fi

echo ""

# 2. 检查配置文件
echo "2. 检查配置文件..."
if grep -q "/lib/vibrant/vibrant.min.js" data/external.yaml; then
    echo "  ✓ Vibrant 已配置为本地路径"
else
    echo "  ✗ Vibrant 仍使用外部 CDN"
fi

if grep -q "/lib/photoswipe/photoswipe.min.js" data/external.yaml; then
    echo "  ✓ PhotoSwipe 已配置为本地路径"
else
    echo "  ✗ PhotoSwipe 仍使用外部 CDN"
fi

if grep -q "async: true" data/external.yaml; then
    echo "  ✓ 已配置异步加载"
else
    echo "  ✗ 未配置异步加载"
fi

echo ""

# 3. 重新构建网站
echo "3. 重新构建网站..."
if hugo > /dev/null 2>&1; then
    echo "  ✓ 网站构建成功"
else
    echo "  ✗ 网站构建失败"
    exit 1
fi

echo ""

# 4. 检查生成的 HTML
echo "4. 检查生成的 HTML..."
if grep -q 'src="/lib/vibrant/vibrant.min.js"' public/post/index.html; then
    echo "  ✓ Vibrant 使用本地路径"
else
    echo "  ✗ Vibrant 未使用本地路径"
fi

if grep -q 'src="/lib/photoswipe/' public/post/index.html || grep -q 'src="/lib/photoswipe/' public/*/index.html 2>/dev/null; then
    echo "  ✓ PhotoSwipe 使用本地路径"
else
    echo "  ⚠ PhotoSwipe 可能未在所有页面使用"
fi

if grep -A3 '/lib/vibrant/vibrant.min.js' public/post/index.html | grep -q 'async'; then
    echo "  ✓ JavaScript 异步加载已启用"
else
    echo "  ✗ JavaScript 异步加载未启用"
fi

echo ""

# 5. 检查是否还有 unpkg.com 引用
echo "5. 检查外部 CDN 引用..."
UNPKG_COUNT=$(grep -r "unpkg.com" public/ 2>/dev/null | grep -c "vibrant\|photoswipe" || echo "0")
UNPKG_COUNT=$(echo "$UNPKG_COUNT" | tr -d '\n' | head -c 10)
if [ "$UNPKG_COUNT" = "0" ] || [ -z "$UNPKG_COUNT" ]; then
    echo "  ✓ 已移除 Vibrant 和 PhotoSwipe 的 unpkg.com 引用"
else
    echo "  ⚠ 发现 $UNPKG_COUNT 处 unpkg.com 引用"
fi

echo ""
echo "=================================================="
echo "验证完成！"
echo "=================================================="
echo ""
echo "下一步:"
echo "1. 使用 'hugo server' 本地测试功能"
echo "2. 在浏览器中测试图片画廊功能"
echo "3. 使用 PageSpeed Insights 测试性能"
echo "   https://pagespeed.web.dev/"
echo ""
echo "预期改善:"
echo "- 渲染阻塞时间减少 ~840ms"
echo "- 避免 unpkg.com 的 4.5 秒延迟"
echo "- LCP 和 FCP 指标显著提升"
echo ""

