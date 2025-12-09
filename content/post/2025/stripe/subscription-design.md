---
title: "Stripe 订阅集成设计决策指南"
date: 2025-12-09
categories: ["支付", "Stripe", "订阅系统", "架构设计"]
description: "基于 Stripe 订阅文档，整理设计决策和实现影响，包括定价模型、结账界面、计费模型的选择及其对系统实现的影响。"
keywords:
  - Stripe
  - 订阅系统
  - 设计决策
  - 定价模型
  - Flat Rate
  - Per-Seat
  - Tiered
  - Usage-Based
  - Checkout Interface
  - Payment Page
  - Embedded Form
  - Custom Form
  - Pricing Table
  - Payment Link
  - Billing Model
  - Pay Up Front
  - Free Trial
  - Freemium
  - 订阅架构
  - 支付集成设计
  - SaaS 定价
  - 订阅设计
slug: "stripe-subscription-design"
---

# Stripe 订阅集成设计决策指南

基于 Stripe 订阅文档，整理设计决策和实现影响如下。

## 一、订阅集成设计决策（核心概念）

在设计 Stripe 订阅集成时，需要做出三个关键决策，这些决策决定了整个订阅系统的架构和实现方式。

### 决策 1：如何收费（Pricing Models - 定价模型）

定价模型决定了如何向客户收费，Stripe 支持四种主要模型：

#### 1.1 Flat Rate（固定费率）

- **描述**：为每个服务层级收取固定费用
- **适用场景**：提供不同服务等级（如基础版、专业版、企业版）
- **特点**：
  - 每个层级有固定的月费/年费
  - 价格简单透明，客户易于理解
  - 适合 SaaS 产品的基础订阅模式
- **示例**：

```
基础版：$9/月 或 $90/年
专业版：$29/月 或 $290/年
企业版：$99/月 或 $990/年
```

#### 1.2 Per-Seat（按席位）

- **描述**：根据用户数量或席位数量收费
- **适用场景**：软件许可证、团队协作工具、多用户账户
- **特点**：
  - 每个用户/席位收取固定费用
  - 费用 = 用户数 × 单价
  - 适合需要按用户数计费的场景
- **示例**：

```
每个用户：$10/月
10 个用户 = $100/月
50 个用户 = $500/月
```

#### 1.3 Tiered（分层定价）

- **描述**：根据使用量或数量，不同层级收取不同单价
- **两种模式**：
  - **Volume-based（基于数量）**：数量 × 该层级的单价
  - **Graduated（累进）**：每个层级分别计算后累加
- **适用场景**：API 调用量、存储空间、项目数量等
- **示例**：

```
项目数量分层：
1-5 个项目：$7/项目
6-10 个项目：$6.5/项目
11+ 个项目：$6/项目
```

#### 1.4 Usage-Based（基于使用量）

- **描述**：根据实际使用量收费
- **三种模式**：
  - **Fixed fee + Overage（固定费用+超量）**：
    - 每月固定费用包含一定使用量
    - 超出部分按单价收费
    - 示例：$50/月包含 100,000 tokens，超出部分 $0.001/token
  - **Pay as you go（按量付费）**：
    - 完全按使用量计费
    - 支持 per unit、per package、volume-based、graduated 等定价
  - **Credit burndown（预付费信用）**：
    - 客户预付费购买信用额度
    - 使用时从信用额度中扣除
- **适用场景**：云服务、API 调用、数据处理量等

### 决策 2：如何收集支付信息（Checkout Interfaces - 结账界面）

结账界面决定了客户如何提供支付信息，Stripe 提供多种选择：

#### 2.1 Stripe-hosted Page（Stripe 托管页面）

- **描述**：使用 Stripe 预构建并托管的支付页面
- **优点**：
  - Stripe 处理支付方式收集和验证
  - 自动启动订阅流程
  - 支持 20 种预设字体、3 种边框圆角、自定义背景和边框颜色、自定义 Logo
- **适用场景**：快速上线、不需要深度定制 UI
- **实现**：重定向到 Stripe 页面，支付完成后回调

#### 2.2 Embedded Payment Form（嵌入式支付表单）

- **描述**：将 Stripe 预构建的支付表单直接嵌入到网站中
- **优点**：
  - 客户无需离开你的网站
  - Stripe 处理支付方式收集和验证
  - 自动启动订阅流程
  - UI 定制选项与托管页面相同
- **适用场景**：希望保持品牌一致性，但不想自己构建支付表单

#### 2.3 Custom Payment Form（自定义支付表单）

- **描述**：使用 Stripe Elements 组件构建自定义支付表单
- **优点**：
  - 完全控制 UI 布局和样式
  - 可与现有前端框架深度集成
  - 使用 Appearance API 自定义外观
- **适用场景**：需要完全定制化的支付体验
- **技术栈**：Stripe Elements + 前端框架（React/Vue/Angular 等）

#### 2.4 Pricing Table（定价表）

- **描述**：在网站上嵌入定价表，显示多个订阅选项
- **优点**：
  - 展示多个定价层级
  - 点击后重定向到 Stripe 托管支付页面
  - 可自定义按钮布局、文本和外观
- **适用场景**：需要展示多个订阅计划供客户选择

#### 2.5 One-click Payment Button（一键支付按钮）

- **描述**：使用 Express Checkout Element 添加一键支付按钮
- **优点**：
  - 无需前端改动即可添加支付按钮
  - 根据客户位置动态排序支付方式
  - 支持多种支付方式：Link、Apple Pay、Google Pay、PayPal、Klarna、Amazon Pay
- **适用场景**：希望提供多种快速支付选项

#### 2.6 Payment Link（支付链接）

- **描述**：创建可分享的支付链接，点击后重定向到 Stripe 托管页面
- **优点**：
  - 链接可无限次分享
  - 自动使用客户浏览器语言
  - 支持 20+ 种支付方式
  - UI 定制选项丰富
- **限制**：不支持基于使用量的计费
- **适用场景**：通过邮件、短信等方式分享订阅链接

#### 2.7 Mobile App（移动应用）

- **描述**：在移动应用中使用 Stripe 预构建的支付表单
- **优点**：
  - 支持预构建的 sheet 或可定制的 drop-in 组件
  - 支持钱包支付（Apple Pay、Google Pay、Link）
  - 使用 Appearance API 自定义外观
- **适用场景**：iOS、Android、React Native 应用

### 决策 3：何时收费（Billing Models - 计费模型）

计费模型决定了客户何时需要支付订阅费用：

#### 3.1 Pay Up Front（预付）

- **描述**：客户在获得产品访问权限之前必须先支付
- **流程**：
  1. 客户选择订阅计划
  2. 收集支付信息
  3. 提供产品访问权限
  4. 在整个订阅生命周期中持续提供访问
  5. 定期（如每月）自动扣款相同金额
- **适用场景**：标准订阅模式，需要立即收费

#### 3.2 Free Trial（免费试用）

- **描述**：在收费前为客户提供免费试用期
- **流程**：
  1. 客户选择订阅计划
  2. 收集支付信息（但不扣款）
  3. 提供有限时间的免费访问
  4. 试用期结束时，新的计费周期开始
  5. Stripe 生成发票并扣款
- **适用场景**：希望降低客户试用门槛，提高转化率
- **注意**：需要收集支付方式，试用期结束自动扣款

#### 3.3 Freemium（免费增值）

- **描述**：允许客户无需提供支付信息即可访问产品
- **流程**：
  1. 客户选择订阅计划
  2. 提供有限时间的免费访问（无需支付信息）
  3. 在试用期结束前收集支付信息
  4. 试用期结束时，新的计费周期开始
  5. Stripe 生成发票并扣款
- **适用场景**：希望最大化用户获取，允许客户先体验再决定是否付费
- **注意**：需要在试用期结束前主动收集支付信息

### 设计决策组合示例

| 定价模型 | 结账界面 | 计费模型 | 典型用例 |
|---------|---------|---------|---------|
| Flat Rate | Payment Page | Free Trial | SaaS 产品提供免费试用 |
| Usage-Based | Embedded Form | Pay Up Front | API 服务按使用量收费 |
| Flat Rate/Per-Seat/Tiered | Pricing Table | Free Trial | 展示多个订阅层级 |
| Flat Rate | Payment Link | Pay Up Front | 通过链接分享订阅 |
| Flat Rate | Mobile App | Pay Up Front | 移动应用内订阅 |
| Flat Rate | One-click Buttons | Pay Up Front | 快速支付选项 |

## 二、设计决策对实现的影响

### 2.1 定价模型对实现的影响

| 定价模型 | API 调用差异 | 数据存储需求 | Webhook 事件 |
|---------|------------|------------|------------|
| **Flat Rate** | 简单的 Price ID | 存储订阅状态和周期 | `subscription.created`, `invoice.paid` |
| **Per-Seat** | 需要设置 `quantity` | 存储用户数量，监听数量变更 | `subscription.updated` (quantity 变更) |
| **Tiered** | 需要配置 tier 规则 | 存储使用量，计算层级 | `invoice.created` (需要计算金额) |
| **Usage-Based** | 需要报告使用量 | 存储使用量记录，定期上报 | `invoice.created` (基于使用量) |

**实现要点**：

- Per-Seat：监听 `subscription.updated` 事件，同步用户数量变化
- Tiered：需要实现使用量追踪和层级计算逻辑
- Usage-Based：需要实现使用量上报机制（`SubscriptionItem.createUsageRecord`）

### 2.2 结账界面对实现的影响

| 结账界面 | 前端集成复杂度 | 后端处理 | 回调处理 |
|---------|--------------|---------|---------|
| **Stripe-hosted Page** | 低（只需重定向） | 创建 Checkout Session | 处理 `checkout.session.completed` |
| **Embedded Form** | 中（嵌入 iframe） | 创建 Checkout Session | 处理 `checkout.session.completed` |
| **Custom Form** | 高（需要集成 Elements） | 创建 PaymentIntent/Subscription | 处理 `payment_intent.succeeded` |
| **Pricing Table** | 低（嵌入 HTML） | 创建 Pricing Table | 处理 `checkout.session.completed` |
| **Payment Link** | 低（分享链接） | 创建 Payment Link | 处理 `checkout.session.completed` |
| **Mobile App** | 中（SDK 集成） | 创建 PaymentIntent | 处理 `payment_intent.succeeded` |

**实现要点**：

- Stripe-hosted/Embedded：使用 Checkout Session，简化支付流程
- Custom Form：需要处理 3D Secure、支付确认等复杂流程
- Mobile App：需要使用移动端 SDK，处理客户端支付确认

### 2.3 计费模型对实现的影响

| 计费模型 | 首次支付时机 | 授权时机 | 特殊处理 |
|---------|------------|---------|---------|
| **Pay Up Front** | 订阅创建时立即扣款 | 支付成功后授权 | 处理支付失败场景 |
| **Free Trial** | 试用期结束后扣款 | 试用期开始即可授权 | 监听 `customer.subscription.trial_will_end` |
| **Freemium** | 试用期结束前需收集支付方式 | 试用期开始即可授权 | 主动提醒客户添加支付方式 |

**实现要点**：

- Pay Up Front：需要处理 `incomplete` 状态和支付失败重试
- Free Trial：需要监听试用期结束事件，确保及时扣款
- Freemium：需要实现支付方式收集流程，避免试用期结束未扣款

### 2.4 组合决策的最佳实践

**常见组合 1：Flat Rate + Payment Page + Free Trial**

```
适用场景：SaaS 产品快速上线
实现要点：
1. 创建 Checkout Session，设置 trial_period_days
2. 监听 checkout.session.completed 创建订阅
3. 监听 customer.subscription.trial_will_end 提醒客户
4. 监听 invoice.paid 确认首次付费成功
```

**常见组合 2：Usage-Based + Custom Form + Pay Up Front**

```
适用场景：API 服务按量计费
实现要点：
1. 创建 Subscription，设置 usage-based pricing
2. 定期调用 SubscriptionItem.createUsageRecord 上报使用量
3. 监听 invoice.created 获取账单金额
4. 监听 invoice.paid 确认扣款成功
```

**常见组合 3：Per-Seat + Pricing Table + Free Trial**

```
适用场景：团队协作工具
实现要点：
1. 创建 Pricing Table，展示不同席位数量
2. 监听 checkout.session.completed，获取 quantity
3. 监听 subscription.updated，同步席位数量变化
4. 根据席位数量控制功能访问权限
```

