---
title: "就问你Apple订阅乱不乱?"
date: 2025-04-04
draft: true
categories: ["iOS开发", "应用内购买"]
description: "深入解析Apple应用内订阅系统的复杂性与常见问题"
keywords: ["Apple", "IAP", "应用内购买", "订阅", "App Store"]
slug: "apple-iap-confuse"
image: "https://img.ququ123.top/img/20250206165153561.png?imageView2/2/w/900/h/480"
mermaid: true
---

## 概念说明

开始前，我们先明确两个重要概念：

- **订阅单**：代表一个订阅组的初始交易，也是 Apple 的`originTransactionID`
- **交易单**：代表一笔实际的收费交易，也是 Apple 的`transactionID`

## Apple 交易单问题

### 一个交易单存在多个交易 ID

Apple 订阅系统中，同一笔`交易单`可能对应多个交易 ID（如 120012745728737、120012745728738），它们拥有相同的购买时间戳和过期时间戳，表明属于同一笔交易。

---

```mermaid
graph LR
  订阅单[订阅单: 120011342464464<br>originTransactionID]
  交易单[交易单<br>transactionID]
  交易ID0[交易ID: 120011342464464<br>购买时间戳: 2024-02-01<br>过期时间戳: 2024-03-01]
  交易ID1[交易ID: 120012745728737<br>购买时间戳: 2024-03-01<br>过期时间戳: 2024-04-01]
  交易ID2[交易ID: 120012745728738<br>购买时间戳: 2024-03-01<br>过期时间戳: 2024-04-01]
  交易ID3[交易ID: 120012564738459<br>购买时间戳: 2024-04-01<br>过期时间戳: 2024-05-01]

  订阅单 --> 交易单
  交易单 --> 交易ID0
  交易单 --> 交易ID1
  交易单 --> 交易ID2
  交易单 --> 交易ID3

  classDef transaction fill:#f9f,stroke:#333,stroke-width:2px
  classDef ids fill:#bbf,stroke:#333,stroke-width:1px
  class 订阅单,交易单 transaction
  class 交易ID1,交易ID2 ids
```

## 苹果的多个数据源，交易数据不一致

苹果提供了多种 API 来获取交易信息，但不同接口返回的数据可能存在差异，给开发者带来困扰：

### [Get Transaction History](https://developer.apple.com/documentation/appstoreserverapi/get-transaction-history)

- 接口：`https://api.storekit.itunes.apple.com/inApps/v2/history/{transactionId}`

- 参数: 120012745728737 和 120012745728738 返回结果是一样的

```mermaid
graph LR
  订阅单[订阅单: 120011342464464<br>originTransactionID]
  交易单[交易单<br>transactionID]
  交易ID0[交易ID: 120011342464464<br>购买时间戳: 2024-02-01<br>过期时间戳: 2024-03-01]
  交易ID1[交易ID: 120012745728737<br>购买时间戳: 2024-03-01<br>过期时间戳: 2024-04-01]
  交易ID3[交易ID: 120012564738459<br>购买时间戳: 2024-04-01<br>过期时间戳: 2024-05-01]

  订阅单 --> 交易单
  交易单 --> 交易ID0
  交易单 --> 交易ID1
  交易单 --> 交易ID3

  classDef transaction fill:#f9f,stroke:#333,stroke-width:2px
  classDef ids fill:#bbf,stroke:#333,stroke-width:1px
  class 订阅单,交易单 transaction
  class 交易ID1 ids
```

### [Get Transaction Info](https://developer.apple.com/documentation/appstoreserverapi/get_transaction_info)

- 接口：`https://api.storekit.itunes.apple.com/inApps/v1/transactions/{transactionId}`

- 参数: 120012745728737

```mermaid
graph LR
  订阅单[订阅单: 120011342464464<br>originTransactionID]
  交易单[交易单<br>transactionID]
  交易ID1[交易ID: 120012745728737<br>购买时间戳: 2024-03-01<br>过期时间戳: 2024-04-01]

  订阅单 --> 交易单
  交易单 --> 交易ID1

  classDef transaction fill:#f9f,stroke:#333,stroke-width:2px
  classDef ids fill:#bbf,stroke:#333,stroke-width:1px
  class 订阅单,交易单 transaction
  class 交易ID1 ids
```

- 参数: 120012745728738

```mermaid
graph LR
  订阅单[订阅单: 120011342464464<br>originTransactionID]
  交易单[交易单<br>transactionID]
  交易ID2[交易ID: 120012745728738<br>购买时间戳: 2024-03-01<br>过期时间戳: 2024-04-01]

  订阅单 --> 交易单
  交易单 --> 交易ID2

  classDef transaction fill:#f9f,stroke:#333,stroke-width:2px
  classDef ids fill:#bbf,stroke:#333,stroke-width:1px
  class 订阅单,交易单 transaction
  class 交易ID2 ids
```

### [Get All Subscription Statuses](https://developer.apple.com/documentation/appstoreserverapi/get-all-subscription-statuses)

- 接口：`https://api.storekit.itunes.apple.com/inApps/v1/subscriptions/{transactionId}`
- 特点：返回用户所有订阅的状态

- 参数: 120012745728737 和 120012745728738 返回结果是一样的

```mermaid
graph LR
 订阅单[订阅单: 120011342464464<br>originTransactionID]
 交易单[交易单<br>transactionID]
 交易ID0[交易ID: 120011342464464<br>购买时间戳: 2024-02-01<br>过期时间戳: 2024-03-01]
 交易ID1[交易ID: 120012745728737<br>购买时间戳: 2024-03-01<br>过期时间戳: 2024-04-01]
 交易ID3[交易ID: 120012564738459<br>购买时间戳: 2024-04-01<br>过期时间戳: 2024-05-01]

 订阅单 --> 交易单
 交易单 --> 交易ID0
 交易单 --> 交易ID1
 交易单 --> 交易ID3

 classDef transaction fill:#f9f,stroke:#333,stroke-width:2px
 classDef ids fill:#bbf,stroke:#333,stroke-width:1px
 class 订阅单,交易单 transaction
 class 交易ID1 ids
```

### [Look Up Order ID](https://developer.apple.com/documentation/appstoreserverapi/look-up-order-id)

- 接口：`https://api.storekit.itunes.apple.com/inApps/v1/lookup/{orderId}`
- 特点：通过订单 ID 查询交易
- 未测试, 数据未知

### [App Store Server Notifications V2](https://developer.apple.com/documentation/AppStoreServerNotifications/App-Store-Server-Notifications-V2)

- 特点：推送交易状态变化通知

### 总结

- [Get Transaction Info](https://developer.apple.com/documentation/appstoreserverapi/get_transaction_info): 对于重复的交易 id 是可以查询到数据的
- [Get All Subscription Statuses](https://developer.apple.com/documentation/appstoreserverapi/get-all-subscription-statuses) + [Get Transaction Info](https://developer.apple.com/documentation/appstoreserverapi/get_transaction_info) + [App Store Server Notifications V2](https://developer.apple.com/documentation/AppStoreServerNotifications/App-Store-Server-Notifications-V2) 都是只返回其中一个交易 ID
- `注意`: 交易 id120012745728737 和 120012745728738 相差 1, 但有时候不在 +1/-1 范围, 有可能是 +2/-2 范围, 也有可能超出这个范围......

## 同一个订阅组多个订阅单

按照最之前苹果的约定, 同一个订阅组, 只会有一个`订阅单`,但是最近发现以下一些不符合之前的逻辑

### 问题 1: 生成新的订阅单

大概在 2025 年 2, 3 月的时候, 发现苹果竟然对一些很久没有续费的`订阅单`, 生成了新的订阅单号(originTransactionID)

```mermaid
graph LR
 交易单[交易单<br>transactionID]

 订阅单1[订阅单1: 120011342464464<br>originTransactionID]
 交易ID0[交易ID: 120011342464464<br>购买时间戳: 2024-02-01<br>过期时间戳: 2024-03-01]
 交易ID1[交易ID: 120012745728737<br>购买时间戳: 2024-03-01<br>过期时间戳: 2024-04-01]
 交易ID2[交易ID: 120012745728738<br>购买时间戳: 2024-03-01<br>过期时间戳: 2024-04-01]
 交易ID3[交易ID: 120012564738459<br>购买时间戳: 2024-04-01<br>过期时间戳: 2024-05-01]

 订阅单1 --> 交易单
 交易单 --> 交易ID0
 交易单 --> 交易ID1
 交易单 --> 交易ID2
 交易单 --> 交易ID3

 订阅单2[订阅单2: 120012563452138<br>originTransactionID]
 交易ID4[交易ID: 120012563452138<br>购买时间戳: 2025-02-20<br>过期时间戳: 2025-03-20]

 交易单2[交易单<br>transactionID]

 订阅单2 --> 交易单2
 交易单2 --> 交易ID4

 classDef transaction fill:#f9f,stroke:#333,stroke-width:2px
 classDef ids fill:#bbf,stroke:#333,stroke-width:1px
 class 订阅单,交易单,交易单2 transaction
 class 交易ID1,交易ID2 ids
```

### 问题 2: 重复的订阅单

其中还发现存在一些重复的订阅单, 类似最开始描述的多个交易 ID 情况

```mermaid
graph LR
交易单[交易单<br>transactionID]

订阅单1[订阅单1: 120011342464464<br>originTransactionID]
交易ID0[交易ID: 120011342464464<br>购买时间戳: 2024-02-01<br>过期时间戳: 2024-03-01]
交易ID1[交易ID: 120012745728737<br>购买时间戳: 2024-03-01<br>过期时间戳: 2024-04-01]
交易ID2[交易ID: 120012745728738<br>购买时间戳: 2024-03-01<br>过期时间戳: 2024-04-01]
交易ID3[交易ID: 120012564738459<br>购买时间戳: 2024-04-01<br>过期时间戳: 2024-05-01]

订阅单1 --> 交易单
交易单 --> 交易ID0
交易单 --> 交易ID1
交易单 --> 交易ID2
交易单 --> 交易ID3

订阅单2[订阅单2: 120012563452138<br>originTransactionID]
交易ID4[交易ID: 120012563452138<br>购买时间戳: 2025-02-20<br>过期时间戳: 2025-03-20]

交易单2[交易单<br>transactionID]

订阅单2 --> 交易单2
交易单2 --> 交易ID4

订阅单3[订阅单3: 120012563452139<br>originTransactionID]
交易ID5[交易ID: 120012563452139<br>购买时间戳: 2025-02-20<br>过期时间戳: 2025-03-20]

交易单3[交易单<br>transactionID]

订阅单3 --> 交易单3
交易单3 --> 交易ID5

classDef transaction fill:#f9f,stroke:#333,stroke-width:2px
classDef ids fill:#bbf,stroke:#333,stroke-width:1px
class 订阅单,交易单,交易单2,交易单3 transaction
class 交易ID1,交易ID2 ids
```

### 问题 3: 新`订阅单`的回滚到旧`订阅单`

## ![交易关联回原来的订阅单](https://img.ququ123.top/img/20250409180202077.png)

`注意: 发生在2025-03-17之后, 所有的回调, 查询交易, 查询状态的返回数据, 对应交易关联全部被回滚到旧的订阅单. 你说奇不奇葩? 跟闹着玩似的`

## 苹果的订阅支付开发历程

#### 通知部分演进时间线：

- **2019-11**: App Store Server Notifications 初版发布
- **2021-10**: App Store Server Notifications V2 发布
- **2022-06**: 支持发送 TEST 通知
- **2023-06**: App Store Server Notifications V1 被废弃
- **2023-10**: JWSTransactionDecodedPayload 对象新增属性：price, currency 和 offerDiscountType
- **2024-04**: 新增 CONSUMPTION_REQUEST 通知类型，用于自动续期订阅的退款请求
- **2025-03**: JWSTransactionDecodedPayload 中新增 previousOriginalTransactionId 字段 `(就是这个最奇葩的改动)`

## Apple Developer Forums 相关 issuer

[Purchase information for users wit… | Apple Developer Forums](https://developer.apple.com/forums/thread/778493)

[original_transaction_id associated… | Apple Developer Forums](https://developer.apple.com/forums/thread/778301)

[StoreKit2 and Subscription Receipt… | Apple Developer Forums](https://developer.apple.com/forums/thread/777898)

[StoreKit.product.purchase returns … | Apple Developer Forums](https://developer.apple.com/forums/thread/777848)

[Issue with App Store Server Notifi… | Apple Developer Forums](https://developer.apple.com/forums/thread/777254)

[Behavior of the "get all subscript… | Apple Developer Forums](https://developer.apple.com/forums/thread/775216)
