# Hugo 多语言配置说明

## 概述

本网站已成功配置多语言支持，支持中文（默认）和英文两种语言。网站会根据浏览器的语言设置自动跳转到相应的语言版本。

## 配置内容

### 1. config.yaml 多语言配置

在 `config.yaml` 中添加了多语言配置：

```yaml
DefaultContentLanguage: zh-cn

languages:
  zh-cn:
    languageCode: zh-cn
    languageName: 简体中文
    title: 代码与历史
    weight: 1
    hasCJKLanguage: true
    params:
      description: "分享代码技术与历史见解"
      dateFormat:
        published: 2006年01月02日
        lastUpdated: 2006年01月02日 15点04分05秒
    
  en:
    languageCode: en
    languageName: English
    title: Code & History
    weight: 2
    params:
      description: "Sharing code technology and historical insights"
      dateFormat:
        published: Jan 02, 2006
        lastUpdated: Jan 02, 2006 15:04 MST
```

### 2. 文章翻译

为文章创建多语言版本的方法：

- **中文版本**（默认）：`content/post/2025/article_name.md`
- **英文版本**：`content/post/2025/article_name.en.md`

示例：
- 中文版：`vscode_cursor_theme_config.md`
- 英文版：`vscode_cursor_theme_config.en.md`

### 3. 自动语言检测

在 `layouts/partials/head/custom.html` 中添加了自动语言检测脚本：

- 根据浏览器语言自动跳转到相应语言版本
- 使用 localStorage 保存用户的语言选择偏好
- 如果用户手动切换过语言，将不会再自动跳转

### 4. 语言切换器

在 `layouts/partials/sidebar/left.html` 中添加了语言切换功能：

- 在侧边栏菜单中显示其他语言版本的链接
- 点击语言切换链接时，会保存用户的语言偏好
- 使用主题内置的图标系统

## URL 结构

- **中文页面**：`https://www.ququ123.top/2025/03/vscode-cursor-theme-guide/`
- **英文页面**：`https://www.ququ123.top/en/2025/03/vscode-cursor-theme-guide/`

## 使用方法

### 创建新的多语言文章

1. 创建中文版本（默认）：
```bash
hugo new content/post/2025/my-article.md
```

2. 创建英文翻译版本：
```bash
hugo new content/post/2025/my-article.en.md
```

或者直接复制中文版本并重命名：
```bash
cp content/post/2025/my-article.md content/post/2025/my-article.en.md
```

然后翻译 `my-article.en.md` 中的内容。

### 重要注意事项

1. **保持 slug 一致**：确保两个语言版本的文章使用相同的 `slug`，这样 Hugo 才能正确识别它们为同一篇文章的不同语言版本。

2. **Front Matter**：两个版本的 Front Matter 除了 `title` 和 `description` 等需要翻译的字段外，其他字段（如 `date`, `categories`, `slug`, `image` 等）应保持一致。

3. **测试**：在本地测试时，可以修改浏览器的语言设置来测试自动跳转功能。

## 构建和部署

构建多语言网站：
```bash
hugo --gc
```

启动本地开发服务器：
```bash
hugo server
```

## 浏览器语言检测逻辑

1. 检查 localStorage 中是否有用户的语言偏好
2. 如果有，则尊重用户选择，不自动跳转
3. 如果没有，检测浏览器语言：
   - 中文浏览器 + 英文页面 → 跳转到中文版本
   - 非中文浏览器 + 中文页面 → 跳转到英文版本
4. 用户点击语言切换按钮时，保存其选择到 localStorage

## 示例文章

已创建的多语言文章示例：
- 中文：`content/post/2025/vscode_cursor_theme_config.md`
- 英文：`content/post/2025/vscode_cursor_theme_config.en.md`

## 参考资源

- [Hugo 多语言文档](https://gohugo.io/content-management/multilingual/)
- [Hugo Theme Stack](https://github.com/CaiJimmy/hugo-theme-stack)

