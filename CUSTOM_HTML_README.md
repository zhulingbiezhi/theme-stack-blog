# Hugo 自定义 HTML 使用指南

本文档说明如何在博客中使用自定义 HTML 和 Shortcode。

## 📁 新增文件

### Shortcode 组件

1. **`layouts/shortcodes/card.html`** - 卡片组件
2. **`layouts/shortcodes/alert.html`** - 提示框组件
3. **`layouts/shortcodes/tabs.html`** - 标签页组件

### 示例文章

1. **`content/post/2025/custom-html-demo.md`** - 直接嵌入 HTML 的示例
2. **`content/post/2025/shortcode-demo.md`** - Shortcode 使用示例
3. **`content/post/2025/hugo-custom-html-guide.md`** - 完整教程指南

## 🚀 快速开始

### 方法一：直接在 Markdown 中使用 HTML

在任何 `.md` 文件中直接写 HTML：

```markdown
---
title: "我的文章"
---

这是普通文本。

<div style="background: #f0f0f0; padding: 20px;">
  这是自定义 HTML 内容
</div>
```

### 方法二：使用 Shortcode

#### Card 卡片组件

```markdown
{{</* card title="标题" icon="🎨" color="#667eea" */>}}
卡片内容，支持 **Markdown** 语法
{{</* /card */>}}
```

**参数说明：**
- `title`: 卡片标题（必需）
- `icon`: 图标 emoji（可选，默认 ✨）
- `color`: 背景颜色（可选，默认 #667eea）

**颜色推荐：**
- 蓝色：`#667eea` `#3498db`
- 绿色：`#2ecc71` `#16a085`
- 红色：`#e74c3c` `#c0392b`
- 橙色：`#f39c12` `#e67e22`
- 紫色：`#9b59b6` `#8e44ad`

#### Alert 提示框组件

```markdown
{{</* alert type="info" title="提示标题" */>}}
提示内容
{{</* /alert */>}}
```

**参数说明：**
- `type`: 提示类型（必需）
  - `info` - 信息提示（蓝色）
  - `success` - 成功提示（绿色）
  - `warning` - 警告提示（橙色）
  - `danger` - 危险提示（红色）
- `title`: 标题（可选）

**使用示例：**

```markdown
{{</* alert type="info" */>}}
无标题的信息提示
{{</* /alert */>}}

{{</* alert type="success" title="成功" */>}}
带标题的成功提示
{{</* /alert */>}}

{{</* alert type="warning" title="注意" */>}}
警告提示内容
{{</* /alert */>}}

{{</* alert type="danger" title="危险" */>}}
危险操作警告
{{</* /alert */>}}
```

#### Tabs 标签页组件

```markdown
{{</* tabs */>}}
标签页1标题###CONTENT###
标签页1的内容，支持 **Markdown**

这里可以有多个段落

###TAB###
标签页2标题###CONTENT###
标签页2的内容

- 列表项1
- 列表项2

###TAB###
标签页3标题###CONTENT###
标签页3的内容
{{</* /tabs */>}}
```

**格式说明：**
- 使用 `###TAB###` 分隔不同的标签页
- 使用 `###CONTENT###` 分隔标题和内容
- 内容部分支持 Markdown 语法

## 💡 使用技巧

### 1. 嵌套使用

Shortcode 可以嵌套使用：

```markdown
{{</* card title="外层卡片" */>}}
这是外层内容

{{</* alert type="info" */>}}
这是嵌套的提示框
{{</* /alert */>}}

继续外层内容
{{</* /card */>}}
```

### 2. 组合使用

混合使用 HTML 和 Shortcode：

```markdown
<div style="text-align: center;">
  {{</* card title="居中的卡片" */>}}
  内容...
  {{</* /card */>}}
</div>
```

### 3. 创建教程步骤

```markdown
{{</* card title="步骤 1" icon="1️⃣" color="#3498db" */>}}
第一步的说明

{{</* alert type="info" */>}}
重要提示
{{</* /alert */>}}
{{</* /card */>}}

{{</* card title="步骤 2" icon="2️⃣" color="#3498db" */>}}
第二步的说明
{{</* /card */>}}
```

### 4. 功能展示面板

```markdown
{{</* card title="核心功能" icon="⚡" */>}}
- ✅ 功能一
- ✅ 功能二
- ✅ 功能三
{{</* /card */>}}
```

## 🎨 自定义样式

### 修改 Shortcode 样式

编辑 `layouts/shortcodes/` 目录下的文件来自定义样式。

例如修改卡片的默认颜色：

```html
<!-- layouts/shortcodes/card.html -->
{{- $color := .Get "color" | default "#你的颜色" -}}
```

### 添加全局样式

在 `assets/scss/custom.scss` 中添加全局样式：

```scss
// 自定义卡片样式
.custom-card {
  // 你的样式
}
```

## 📝 最佳实践

### 1. 选择合适的方法

- **简单内容**：直接使用 HTML
- **复用组件**：使用 Shortcode
- **页面级自定义**：创建自定义布局

### 2. 保持一致性

- 统一使用相同的颜色方案
- 保持图标风格一致
- 遵循既定的间距规范

### 3. 响应式设计

确保自定义内容在移动设备上也能良好显示：

```html
<div style="display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); 
            gap: 20px;">
  <!-- 内容 -->
</div>
```

### 4. 性能优化

- 避免过度使用内联样式
- 将公共样式提取到 CSS 文件
- 优化图片和媒体资源

## 🔧 故障排查

### Shortcode 不显示

1. 检查语法是否正确
2. 确保文件保存在 `layouts/shortcodes/` 目录
3. 重启 Hugo 开发服务器

### HTML 不渲染

检查 `config.yaml` 中的设置：

```yaml
markup:
  goldmark:
    renderer:
      unsafe: true  # 必须为 true
```

### 样式不生效

1. 检查 CSS 语法
2. 确保没有被主题样式覆盖
3. 使用浏览器开发者工具检查

## 📚 参考资源

- [Hugo 官方文档](https://gohugo.io/documentation/)
- [Shortcode 文档](https://gohugo.io/content-management/shortcodes/)
- [Markdown 指南](https://www.markdownguide.org/)

## 🆕 创建自己的 Shortcode

### 基本模板

创建 `layouts/shortcodes/你的名称.html`：

```html
{{- $param := .Get "参数名" | default "默认值" -}}

<div class="your-component">
  <h3>{{ $param }}</h3>
  <div>{{ .Inner | markdownify }}</div>
</div>
```

### 使用参数

- `.Get "参数名"` - 获取命名参数
- `.Get 0` - 获取位置参数
- `.Inner` - 获取内部内容
- `| markdownify` - 将内容转换为 HTML

### 条件判断

```html
{{- if .Get "showTitle" -}}
  <h3>{{ .Get "title" }}</h3>
{{- end -}}
```

### 循环遍历

```html
{{- range .Params.items -}}
  <li>{{ . }}</li>
{{- end -}}
```

## 🎯 实用示例

### 高亮框

```markdown
{{</* card title="重点" icon="💡" color="#f39c12" */>}}
这是需要重点关注的内容
{{</* /card */>}}
```

### 操作提示

```markdown
{{</* alert type="warning" title="操作前提示" */>}}
请先完成前置步骤
{{</* /alert */>}}
```

### 成功消息

```markdown
{{</* alert type="success" title="完成" */>}}
恭喜！你已完成所有步骤
{{</* /alert */>}}
```

## 🤝 贡献

如果你创建了有用的 Shortcode，欢迎分享！

---

**需要帮助？** 查看示例文章或在评论区提问。

