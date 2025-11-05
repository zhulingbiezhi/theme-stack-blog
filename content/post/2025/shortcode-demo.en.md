---
title: "使用 Shortcode 创建自定义 HTML 组件"
date: 2025-10-30
categories:
  - "示例"
  - "Hugo"
description: "展示如何使用 Hugo Shortcode 创建可复用的自定义 HTML 组件"
slug: "shortcode-demo"
image: "https://img.ququ123.top/img/download17.jpeg?imageView2/2/w/900/h/480"
---

## 简介

Shortcode 是 Hugo 的一个强大功能，可以让你创建可复用的 HTML 组件。这篇文章展示了几个实用的 shortcode 示例。

## 卡片组件 (Card)

使用 `card` shortcode 创建美观的卡片：

{{< card title="默认卡片" icon="🎨" >}}
这是一个使用默认颜色的卡片。你可以在卡片中使用 **Markdown** 语法，包括：

- 列表项
- [链接](https://example.com)
- `代码`
{{< /card >}}

{{< card title="成功消息" icon="✅" color="#2ecc71" >}}
这是一个绿色主题的卡片，适合用来显示成功消息或正面信息。
{{< /card >}}

{{< card title="警告消息" icon="⚠️" color="#f39c12" >}}
这是一个橙色主题的卡片，适合用来显示警告信息。
{{< /card >}}

{{< card title="重要提示" icon="🔥" color="#e74c3c" >}}
这是一个红色主题的卡片，适合用来显示重要或紧急的信息。
{{< /card >}}

## 提示框组件 (Alert)

使用 `alert` shortcode 创建不同类型的提示框：

{{< alert type="info" title="信息提示" >}}
这是一个信息提示框，用于显示一般性的提示信息。
{{< /alert >}}

{{< alert type="success" title="操作成功" >}}
恭喜！你已经成功完成了操作。可以继续下一步了。
{{< /alert >}}

{{< alert type="warning" title="注意事项" >}}
请注意：在执行此操作前，请确保已经备份了重要数据。
{{< /alert >}}

{{< alert type="danger" title="危险警告" >}}
**警告**：此操作不可撤销！请谨慎操作。
{{< /alert >}}

{{< alert type="info" >}}
也可以不带标题使用。
{{< /alert >}}

## 组合使用

你可以在卡片中嵌套提示框：

{{< card title="组合示例" icon="📦" color="#9b59b6" >}}

这是一个卡片，里面包含了提示框：

{{< alert type="success" title="提示" >}}
Shortcode 可以嵌套使用，创建更复杂的布局。
{{< /alert >}}

你还可以添加其他内容，比如代码块：

```go
func main() {
    fmt.Println("Hello, Hugo!")
}
```

{{< /card >}}

## 实际应用场景

### 1. 教程步骤

{{< card title="步骤 1：安装依赖" icon="1️⃣" color="#3498db" >}}
首先，安装必要的依赖包：

```bash
npm install
```

{{< alert type="info" >}}
确保你的 Node.js 版本在 14.0 以上。
{{< /alert >}}
{{< /card >}}

{{< card title="步骤 2：配置环境" icon="2️⃣" color="#3498db" >}}
创建 `.env` 文件并配置相关参数：

```env
API_KEY=your_api_key_here
PORT=3000
```

{{< alert type="warning" >}}
不要将 `.env` 文件提交到版本控制系统中。
{{< /alert >}}
{{< /card >}}

{{< card title="步骤 3：启动服务" icon="3️⃣" color="#3498db" >}}
运行以下命令启动服务：

```bash
npm start
```

{{< alert type="success" >}}
服务启动成功后，访问 http://localhost:3000 即可查看。
{{< /alert >}}
{{< /card >}}

### 2. 功能介绍

{{< card title="核心功能" icon="⚡" color="#16a085" >}}
- ✅ 支持 Markdown 语法
- ✅ 完全自定义样式
- ✅ 可嵌套使用
- ✅ 响应式设计
{{< /card >}}

### 3. 注意事项

{{< alert type="warning" title="使用限制" >}}
虽然 shortcode 功能强大，但也有一些限制：

1. Shortcode 之间不能有空行
2. 嵌套时要注意闭合标签的顺序
3. 某些特殊字符需要转义
{{< /alert >}}

## 如何创建自己的 Shortcode

如果你想创建自己的 shortcode，只需要：

1. 在 `layouts/shortcodes/` 目录下创建 HTML 文件
2. 使用 Hugo 的模板语法编写组件逻辑
3. 在 Markdown 文章中使用 `{{</* shortcode-name */>}}` 调用

### 示例代码 💻

创建一个简单的 shortcode（`layouts/shortcodes/highlight.html`）：

```html
<div style="background: #f0f0f0; padding: 20px; border-radius: 8px;">
  <strong>参数：title</strong>
  <p>内容：使用 markdownify 处理</p>
</div>
```

在文章中使用：

```markdown
{{</* highlight title="重点" */>}}
这是需要高亮显示的内容。
{{</* /highlight */>}}
```

## 总结

通过使用 shortcode，你可以：

- ✨ 创建可复用的 HTML 组件
- 🎨 保持文章内容的整洁
- 🚀 提高写作效率
- 💡 实现更丰富的页面效果

{{< alert type="success" title="开始使用吧！" >}}
现在你已经了解了如何使用 shortcode，赶快在你的文章中试试吧！
{{< /alert >}}

