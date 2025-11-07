# Unpkg 资源本地化优化总结

## 问题描述

根据性能分析，unpkg.com CDN 的资源加载存在严重的渲染阻塞问题：

| 资源 | 大小 | 耗时 |
|------|------|------|
| vibrant.min.js | 41.3 KiB | 4,450ms |
| photoswipe.min.js | 18.3 KiB | 1,030ms |
| photoswipe-ui-default.min.js | 12.8 KiB | 1,030ms |
| default-skin.css | 4.5 KiB | 880ms |
| photoswipe.css | 3.7 KiB | 750ms |

**总计阻塞时间**: 约 840 毫秒

## 解决方案

### 1. 修复外部资源加载模板

**文件**: `layouts/partials/helper/external.html`

**问题**: 模板未正确处理 `async` 和 CSS 延迟加载属性

**修复内容**:
```html
<!-- 为 script 标签添加 async 支持 -->
{{ if .async }}async{{ end }}

<!-- 为 link 标签添加 media 和 onload 支持 -->
{{- with .media -}}
media="{{ . }}"
{{- end -}}
{{- with .onload -}}
onload="{{ . }}"
{{- end -}}
```

### 2. 资源本地化

将所有 Vibrant 和 PhotoSwipe 资源下载到本地：

```bash
# 创建目录
mkdir -p static/lib/vibrant static/lib/photoswipe/dist/default-skin

# 下载 Vibrant.js
curl -sL "https://unpkg.com/node-vibrant@3.1.5/dist/vibrant.min.js" \
  -o static/lib/vibrant/vibrant.min.js

# 下载 PhotoSwipe 资源
curl -sL "https://unpkg.com/photoswipe@4.1.3/dist/photoswipe.min.js" \
  -o static/lib/photoswipe/photoswipe.min.js
curl -sL "https://unpkg.com/photoswipe@4.1.3/dist/photoswipe-ui-default.min.js" \
  -o static/lib/photoswipe/photoswipe-ui-default.min.js
curl -sL "https://unpkg.com/photoswipe@4.1.3/dist/photoswipe.css" \
  -o static/lib/photoswipe/photoswipe.css
curl -sL "https://unpkg.com/photoswipe@4.1.3/dist/default-skin/default-skin.css" \
  -o static/lib/photoswipe/dist/default-skin/default-skin.css

# 下载 CSS 依赖的图片资源
curl -sL "https://unpkg.com/photoswipe@4.1.3/dist/default-skin/default-skin.png" \
  -o static/lib/photoswipe/dist/default-skin/default-skin.png
curl -sL "https://unpkg.com/photoswipe@4.1.3/dist/default-skin/default-skin.svg" \
  -o static/lib/photoswipe/dist/default-skin/default-skin.svg
curl -sL "https://unpkg.com/photoswipe@4.1.3/dist/default-skin/preloader.gif" \
  -o static/lib/photoswipe/dist/default-skin/preloader.gif
```

### 3. 更新配置

**文件**: `data/external.yaml`

将外部 CDN 路径改为本地路径：

```yaml
Vibrant:
    - src: /lib/vibrant/vibrant.min.js
      type: script
      async: true

PhotoSwipe:
    - src: /lib/photoswipe/photoswipe.min.js
      type: script
      async: true

    - src: /lib/photoswipe/photoswipe-ui-default.min.js
      type: script
      async: true

    - src: /lib/photoswipe/dist/default-skin/default-skin.css
      type: style
      media: print
      onload: this.media='all'

    - src: /lib/photoswipe/photoswipe.css
      type: style
      media: print
      onload: this.media='all'
```

## 优化效果

### 性能提升

- **消除 unpkg.com 延迟**: 避免 4.5 秒的 CDN 延迟
- **减少网络请求开销**: 无需 DNS 查询、TCP 连接和 TLS 握手
- **提升加载速度**: 本地资源加载速度显著快于外部 CDN
- **改善 LCP**: 渲染阻塞时间从 840ms 降至接近 0ms

### 可靠性提升

- 减少外部依赖
- 避免 CDN 故障影响
- 完全控制资源版本

## 已下载资源清单

```
static/lib/vibrant/vibrant.min.js (58K)
static/lib/photoswipe/
├── photoswipe.min.js (32K)
├── photoswipe-ui-default.min.js (9.7K)
├── photoswipe.css (4.1K)
└── dist/default-skin/
    ├── default-skin.css (12K)
    ├── default-skin.png (547B)
    ├── default-skin.svg (1.6K)
    └── preloader.gif (866B)
```

**总大小**: 约 117K

## 验证步骤

1. **本地测试**:
```bash
hugo server
# 访问 http://localhost:1313
# 打开 Chrome DevTools Network 面板
# 确认资源从本地加载
```

2. **性能测试**:
- 使用 Google PageSpeed Insights: https://pagespeed.web.dev/
- 检查 "Eliminate render-blocking resources" 指标
- 对比优化前后的 LCP 和 FCP 指标

3. **功能测试**:
- 测试图片画廊功能（PhotoSwipe）
- 测试图片颜色提取功能（Vibrant）
- 确认所有交互正常工作

## 注意事项

1. **版本固定**: 资源版本固定为下载时的版本，需要手动更新
2. **缓存策略**: 确保服务器正确设置静态资源的缓存头
3. **Git 管理**: 已将资源文件添加到版本控制

## 回滚方案

如果需要回滚到使用 CDN：

```bash
# 恢复配置文件
git checkout HEAD~1 -- data/external.yaml
git checkout HEAD~1 -- layouts/partials/helper/external.html

# 删除本地资源
rm -rf static/lib/vibrant static/lib/photoswipe
```

## 后续工作

- [ ] 监控生产环境性能指标
- [ ] 考虑其他 CDN 资源（如 KaTeX）的本地化
- [ ] 定期检查库版本更新
- [ ] 考虑使用构建工具自动化资源管理

---

**优化日期**: 2025-11-06  
**预计性能提升**: 减少 840ms 渲染阻塞时间

