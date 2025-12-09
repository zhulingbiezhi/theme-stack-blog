---
title: "Stripe 订阅技术实现指南"
date: 2025-12-09
categories: ["支付", "Stripe", "订阅系统", "技术实现"]
description: "基于 Stripe 订阅文档，整理技术核心概念、流程、状态流转和集成建议，包括订阅生命周期、状态管理、Webhook 处理等技术细节。"
keywords:
  - Stripe
  - 订阅系统
  - 技术实现
  - Subscription
  - PaymentIntent
  - Invoice
  - Entitlements
  - 订阅状态
  - trialing
  - active
  - incomplete
  - past_due
  - canceled
  - unpaid
  - paused
  - Webhook
  - 状态同步
  - 幂等性
  - 错误处理
  - 授权管理
  - 支付方式管理
  - 订阅集成
  - 支付网关集成
slug: "stripe-subscription-implementation"
---

# Stripe 订阅技术实现指南

基于 Stripe 订阅文档，整理技术核心概念、流程、状态流转和集成建议如下。

## 一、技术核心概念

### 1. **Subscription（订阅）**

- 允许客户为产品访问权限进行周期性支付
- 与一次性支付不同，需要存储客户信息以便后续扣款
- 每个订阅关联一个客户（Customer）和产品（Product）
- 支持多种定价模型（固定费率、按席位、分层、基于使用量）

### 2. **Customer（客户）**

- 存储客户信息和支付方式
- 一个客户可以有多个订阅
- 支付方式可以复用，无需每次重新输入

### 3. **Invoice（发票）**

- 订阅创建时自动生成
- 记录每期账单的金额和明细
- 状态包括：`open`、`paid`、`void`、`draft`
- 支持自动生成和手动发送两种模式

### 4. **PaymentIntent（支付意图）**

- 跟踪每次支付的生命周期
- 订阅产生账单时，Stripe 会生成 Invoice 和 PaymentIntent
- 状态包括：`succeeded`、`requires_payment_method`、`requires_action`、`processing`
- 处理 3D Secure 等需要客户交互的支付流程

### 5. **Entitlements（授权）**

- 订阅创建时为每个关联功能创建活跃授权
- 用于控制客户对产品功能的访问权限
- 订阅状态变更时，授权自动更新

## 二、订阅生命周期流程

### 阶段 1：创建订阅

```
创建 Subscription → 触发事件 → 可选创建试用期
```

- 通过 Dashboard 或 API 创建
- 创建时触发事件，需监听 webhook
- 可设置试用期（`status` 为 `trialing`）
- 推荐设置 `payment_behavior` 为 `default_incomplete`，便于处理失败支付和 3DS

### 阶段 2：处理发票

```
创建 Subscription → 自动创建 Invoice（status: open）
```

- 订阅创建时自动创建发票（`status: open`）
- 客户有约 23 小时完成首次支付
- 期间订阅状态为 `incomplete`，发票为 `open`

### 阶段 3：客户支付

```
客户支付 → PaymentIntent succeeded → Invoice paid → Subscription active
```

- 支付成功：订阅 → `active`，发票 → `paid`
- 支付失败：订阅 → `incomplete_expired`，发票 → `void`
- 异步支付方式（如 ACH）可能直接进入 `active`，PaymentIntent 为 `processing`

### 阶段 4：提供产品访问权限

```
Subscription active → 检查 Entitlements → 授予功能访问权限
```

- 订阅激活后，根据活跃授权授予功能访问
- 也可通过 webhook 事件跟踪订阅状态来授权

### 阶段 5：更新订阅

- 可修改价格、暂停收款等，无需取消重建
- 监听 webhook 事件处理变更

### 阶段 6：处理未支付订阅

```
未支付发票 → 暂停自动收款 → 生成 draft 发票 → 需要手动处理
```

- 未支付发票保持 `open`，暂停进一步支付尝试
- 继续生成发票但为 `draft`
- 需要收集新支付信息并支付未结发票

### 阶段 7：取消订阅

- 可随时取消，包括周期结束或指定周期数后
- 默认会禁用创建新发票并停止自动收款
- 取消后为终端状态，无法更新

## 三、状态流转详解

### Subscription 状态流转图

```
创建订阅
   ↓
[trialing] ← 有试用期
   ↓ (试用结束)
[incomplete] ← 需要首次支付
   ↓
   ├─→ [incomplete_expired] ← 23小时内未支付
   │
   └─→ [active] ← 支付成功
        ↓
        ├─→ [past_due] ← 后续支付失败
        │    ↓
        │    ├─→ [canceled] ← 根据配置
        │    ├─→ [unpaid] ← 根据配置
        │    └─→ [active] ← 支付成功
        │
        └─→ [paused] ← 试用结束但无支付方式
             ↓
             └─→ [active] ← 添加支付方式后恢复
```

### Subscription 状态说明

| 状态 | 含义 | 关键特征 |
|------|------|----------|
| **trialing** | 试用中 | 可安全授权产品，首次支付后自动转为 active |
| **active** | 正常 | 订阅正常，不表示所有发票都已支付 |
| **incomplete** | 未完成 | 需在 23 小时内完成首次支付，或需要客户认证 |
| **incomplete_expired** | 未完成已过期 | 23 小时内未支付，不会扣款 |
| **past_due** | 逾期 | 最新发票支付失败，继续生成发票，根据配置可能转为 canceled/unpaid |
| **canceled** | 已取消 | 终端状态，无法更新 |
| **unpaid** | 未支付 | 最新发票未支付，停止尝试收款，需手动支付 |
| **paused** | 已暂停 | 试用结束但无支付方式，不再生成发票 |

### Payment 状态映射

| 支付结果 | PaymentIntent 状态 | Invoice 状态 | Subscription 状态 |
|----------|-------------------|--------------|-------------------|
| 成功 | `succeeded` | `paid` | `active` |
| 卡片错误 | `requires_payment_method` | `open` | `incomplete` |
| 需要认证 | `requires_action` | `open` | `incomplete` |

### 异步支付方式的特殊行为

- 订阅可能直接进入 `active`，跳过 `incomplete`
- PaymentIntent 可能为 `processing`
- 后续失败会 void 发票，但订阅仍保持 `active`

## 四、核心数据结构

### Subscription 对象关键字段

```go
type Subscription struct {
    ID              string              // 订阅唯一标识
    Status          string              // 状态：trialing/active/incomplete等
    Customer        string              // 关联的客户ID
    Items           []SubscriptionItem  // 订阅项（产品、价格、数量）
    CurrentPeriodStart int64            // 当前计费周期开始时间
    CurrentPeriodEnd   int64            // 当前计费周期结束时间
    TrialStart        *int64            // 试用开始时间
    TrialEnd          *int64            // 试用结束时间
    CancelAtPeriodEnd bool              // 是否在周期结束时取消
    Metadata          map[string]string // 元数据
}
```

### Invoice 对象关键字段

```go
type Invoice struct {
    ID                string            // 发票ID
    Status            string            // 状态：open/paid/void/draft
    Subscription      string            // 关联的订阅ID
    Customer          string            // 客户ID
    AmountDue         int64            // 应付金额（分）
    AmountPaid        int64            // 已付金额（分）
    PaymentIntent     string            // 关联的PaymentIntent ID
    DueDate           *int64            // 到期时间
    AutoAdvance       bool              // 是否自动推进
    NextPaymentAttempt *int64           // 下次支付尝试时间
}
```

### PaymentIntent 对象关键字段

```go
type PaymentIntent struct {
    ID                string            // PaymentIntent ID
    Status            string            // 状态：succeeded/requires_payment_method/requires_action
    Amount            int64            // 金额（分）
    Currency          string            // 货币
    Customer          string            // 客户ID
    PaymentMethod     string            // 支付方式ID
    ClientSecret      string            // 客户端密钥（用于前端确认支付）
}
```

## 五、关键设计要点

### 1. 支付行为配置

- `default_incomplete`：推荐，创建时状态为 `incomplete`，便于后续处理
- `allow_incomplete`：立即尝试收款，失败则 `incomplete`
- `error_if_incomplete`：支付失败则创建失败

### 2. 23 小时窗口

- 首次支付通常发生在会话中
- 23 小时后未支付，需创建新订阅

### 3. 发票更新限制

- `send_invoice` 模式：发票创建后 1 小时内可更新
- `charge_automatically` 模式：首张发票立即最终化，无法更新；后续发票可更新

### 4. 失败支付处理

- Smart Retries：自动重试失败支付
- 自定义重试规则：可配置重试策略
- 监听 `invoice.payment_failed` 事件

### 5. 3D Secure 认证

- 监听 `invoice.payment_action_required`
- 使用 `client_secret` 调用 `stripe.ConfirmCardPayment`
- 验证 `invoice.paid` 事件确认支付成功

## 六、与支付网关集成的建议

### 6.1 状态同步

- 订阅状态变更时同步到本地订单/订阅表
- 关键状态：`trialing` → `active` → `past_due` → `canceled`
- 使用 Webhook 事件驱动状态同步

### 6.2 Webhook 处理

监听关键事件：

- `checkout.session.completed`：支付完成，创建订阅
- `customer.subscription.created`：订阅创建
- `customer.subscription.updated`：订阅更新（价格、数量变更）
- `customer.subscription.deleted`：订阅取消
- `invoice.paid`：发票支付成功
- `invoice.payment_failed`：支付失败，需要重试
- `customer.subscription.trial_will_end`：试用期即将结束

### 6.3 幂等性保证

- 使用 Stripe 事件 ID（`event.id`）作为幂等键
- 在数据库中记录已处理的事件 ID
- 重复事件直接返回成功，不重复处理

### 6.4 错误处理

区分错误类型：

- **可重试错误**：网络超时、临时服务不可用
- **业务错误**：余额不足、卡片过期（需要客户更新支付方式）
- **系统错误**：API 密钥错误、参数错误（需要修复代码）

### 6.5 授权管理

- 根据订阅状态控制产品访问权限
- `trialing` 和 `active` 状态可以授权访问
- `past_due` 状态可以降级访问或限制功能
- `canceled` 和 `unpaid` 状态需要撤销访问权限

### 6.6 金额处理

- Stripe 金额单位为**分**（最小货币单位）
- 存储时统一转换为整数（分）
- 显示时转换为小数（元）
- 避免使用浮点数进行金额计算

### 6.7 支付方式管理

- 存储客户的 PaymentMethod ID
- 支持更新支付方式（`PaymentMethod.attach`）
- 处理支付方式过期或失效的情况
- 监听 `payment_method.attached` 和 `payment_method.detached` 事件

