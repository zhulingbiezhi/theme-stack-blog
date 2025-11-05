---
title: "自定义 HTML 演示"
date: 2025-10-30
categories:
  - "示例"
description: "展示如何在 Hugo 文章中嵌入自定义 HTML"
slug: "custom-html-demo"
image: "https://img.ququ123.top/img/download17.jpeg?imageView2/2/w/900/h/480"
---

## 简介

这是一篇展示如何在 Hugo 文章中使用自定义 HTML 的示例文章。

## 方法一：直接嵌入 HTML

你可以直接在 Markdown 中写 HTML 代码：

<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; color: white; margin: 20px 0;">
  <h3 style="margin-top: 0;">🎨 自定义样式卡片</h3>
  <p>这是一个使用自定义 HTML 和 CSS 创建的卡片效果。</p>
  <ul style="list-style: none; padding: 0;">
    <li>✅ 支持任何 HTML 标签</li>
    <li>✅ 支持内联样式</li>
    <li>✅ 支持 JavaScript</li>
  </ul>
</div>

## 方法二：创建交互式内容

<div id="interactive-demo" style="border: 2px solid #667eea; padding: 20px; border-radius: 8px; margin: 20px 0;">
  <h4>交互式计数器</h4>
  <p>点击次数: <span id="counter" style="font-weight: bold; color: #667eea;">0</span></p>
  <button onclick="incrementCounter()" style="background: #667eea; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
    点击我
  </button>
</div>

<script>
let count = 0;
function incrementCounter() {
  count++;
  document.getElementById('counter').textContent = count;
}
</script>

## 方法三：嵌入外部内容

可以嵌入 iframe 或其他外部内容：

<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 20px 0;">
  <iframe 
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;" 
    src="https://www.example.com" 
    title="示例页面">
  </iframe>
</div>

## 方法四：创建表格

使用纯 HTML 创建复杂表格：

<table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
  <thead style="background: #667eea; color: white;">
    <tr>
      <th style="padding: 12px; text-align: left;">功能</th>
      <th style="padding: 12px; text-align: center;">支持</th>
      <th style="padding: 12px; text-align: left;">说明</th>
    </tr>
  </thead>
  <tbody>
    <tr style="border-bottom: 1px solid #ddd;">
      <td style="padding: 12px;">HTML 标签</td>
      <td style="padding: 12px; text-align: center;">✅</td>
      <td style="padding: 12px;">完全支持</td>
    </tr>
    <tr style="border-bottom: 1px solid #ddd;">
      <td style="padding: 12px;">CSS 样式</td>
      <td style="padding: 12px; text-align: center;">✅</td>
      <td style="padding: 12px;">内联和外部都支持</td>
    </tr>
    <tr style="border-bottom: 1px solid #ddd;">
      <td style="padding: 12px;">JavaScript</td>
      <td style="padding: 12px; text-align: center;">✅</td>
      <td style="padding: 12px;">需启用 unsafe 模式</td>
    </tr>
  </tbody>
</table>

## 总结

通过在 Markdown 中直接嵌入 HTML，你可以创建更加丰富和交互式的内容。这对于需要特殊样式或交互功能的文章非常有用。

