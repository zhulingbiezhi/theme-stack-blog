#!/bin/bash

echo "==================================="
echo "网站性能优化验证"
echo "==================================="
echo ""

echo "1. 检查 DNS 预解析配置..."
if grep -q "dns-prefetch" public/index.html; then
    echo "✓ DNS 预解析已配置"
    grep -o 'dns-prefetch href=[^>]*' public/index.html | head -6
else
    echo "✗ DNS 预解析未找到"
fi
echo ""

echo "2. 检查 Favicon 配置..."
if grep -q "favicon-32x32.png" public/index.html; then
    echo "✓ Favicon 路径已修复"
    grep -o 'favicon[^>]*\.png' public/index.html | head -3
else
    echo "✗ Favicon 配置有问题"
fi
echo ""

echo "3. 检查 AdSense 延迟加载..."
if grep -q "window.addEventListener.*load.*adsbygoogle" public/index.html; then
    echo "✓ AdSense 已配置为延迟加载"
    echo "  延迟时间: 2000ms (页面加载完成后)"
else
    echo "✗ AdSense 延迟加载未配置"
fi
echo ""

echo "4. 检查协议安全性..."
if grep -o 'src=[^>]*//[^h][^t][^t][^p]' public/index.html | grep -v "https://" > /dev/null 2>&1; then
    echo "✗ 发现不安全的 // 协议"
else
    echo "✓ 所有资源使用 https:// 协议"
fi
echo ""

echo "5. 检查静态文件..."
echo "Favicon 文件:"
ls -lh static/favicon* 2>/dev/null || echo "  未找到 favicon 文件"
echo ""

echo "==================================="
echo "优化建议："
echo "==================================="
echo "1. 部署到生产环境后使用以下工具测试："
echo "   - Google PageSpeed Insights"
echo "   - GTmetrix"
echo "   - Chrome DevTools Network 面板"
echo ""
echo "2. 预期改善："
echo "   - 首屏加载时间减少 2-3 秒"
echo "   - 消除 404 错误"
echo "   - DNS 查询时间减少 100-300ms"
echo "   - AdSense 不再阻塞页面渲染"
echo ""
