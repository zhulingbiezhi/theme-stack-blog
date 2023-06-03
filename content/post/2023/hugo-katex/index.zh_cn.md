+++
title = "hugo完美支持数学公式(KaTex)"
date = "2023-06-03"
slug = "hugo-katex"
categories = [
    "hugo","KaTeX"
]
math = true
image = "https://img.ququ123.top/img/og_logo.png"
+++

# 在 Hugo 中使用数学排版

在 Hugo 中进行数学排版，或者说渲染 LaTeX 并不是一项难任务。我们有两个流行的选择。第一个是 [mathjax](https://www.mathjax.org/)，我之前在 [jekyll](https://mertbakir.gitlab.io/jekyll/mathjax) 中使用过它。另一个流行的数学排版库是 [KaTeX](https://katex.org/)。由于它更快，这次我将选择 KaTeX。

实现这些库非常简单。我们只需要将它们包含在 `<head>` 部分。然而，我们不希望它们在每个页面都加载，只有在需要时才加载。

$$f(a) = \\frac{1}{2\\pi i} \\oint\\frac{f(z)}{z-a}dz$$

## 1. 创建一个局部模板并使用以下代码

路径为 `/layouts/partials/helpers/katex.html`。

第一行是 CSS，第二行是 JavaScript 文件。第三行是自动渲染扩展。[Auto-render](https://katex.org/docs/autorender.html) 扩展需要渲染文本中的数学元素。

```
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.7/dist/katex.min.css">
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.7/dist/katex.min.js"></script>

<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.7/dist/contrib/auto-render.min.js" onload="renderMathInElement(document.body);"></script>

```


不要直接复制粘贴。这里使用的是版本 0.12，这是我撰写此博客文章时的最新版本。你可能需要查看是否有[更新](https://katex.org/docs/browser.html)。

## 2. 在 head 部分中包含这个局部模板
路径为 `/layouts/partials/head.html`。

```
{{ if .Params.math }}{{ partial "helper/katex.html" . }}{{ end }}

```


## 3. 在某个帖子/页面中使用该库
应在 front-matter 中使用 math 参数。

```
	+++
	title = "hugo完美支持数学公式(KaTex)"
	date = "2023-06-03"
	slug = "hugo-katex"
	categories = [
	    "hugo","KaTeX"
	]
	math = true
	image = "https://img.ququ123.top/img/og_logo.png"
	+++

```

## 4. 使用行内公式
还应添加以下内容。路径为 `/layouts/partials/script.html`。

```
<script>
    document.addEventListener("DOMContentLoaded", function() {
        renderMathInElement(document.body, {
            delimiters: [
                {left: "$", right: "$", display: true},
                {left: "$", right: "$", display: false}
            ]
        });
    });
</script>

```


这将提供带有单个美元符号的行内公式。例如 `$x = {-b \pm \sqrt{b^2-4ac} \over 2a}$`，$x = {-b \\pm \\sqrt{b^2-4ac} \\over 2a}$。

## 5. 发现解析失败问题如何解决
比如这个
`$\underbrace{a}_{b} - \underbrace{c}_{d}$`

### 5.1 查看网页的原始html信息
---

![右键菜单](https://img.ququ123.top/img/test.png)

---

发现问题：因为markdown解析把下划线解析成`em`
![](https://img.ququ123.top/img/%E6%88%AA%E5%B1%8F2023-06-03%2010.42.27.png)

---

*解决方法*：下划线处增加`\`，改成`$\underbrace{a}\_{b} - \underbrace{c}\_{d}$`

---

修正后：$\underbrace{a}\_{b} - \underbrace{c}\_{d}$

---

类似的问题还有，矩阵失效


```
\begin{pmatrix}
  a & b \\
      c & d
      \end{pmatrix}
```

改成

```
\begin{pmatrix}
  a & b \\\
      c & d
      \end{pmatrix}
```

展示结果

$$
\begin{pmatrix}
  a & b \\\
      c & d
      \end{pmatrix}
$$

### 5.2 检验数学公式问题
[数学公式检测](https://katex.org/#demo) 可以在线验证公式是否书写有误

----

**修正前报错**
![错误公式](https://img.ququ123.top/img/image-20230603104932811.png)

---

**修正后如下**
![正确公式](https://img.ququ123.top/img/image-20230603105010385.png)
