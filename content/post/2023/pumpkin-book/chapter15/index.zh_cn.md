---
title: "【南瓜书】第十五章" 
description: "本章主要介绍规则学习，包括似然率统计量、FOIL增益、逻辑操作（吸收、辨识、内构/互构）以及归结与合一等核心内容"
date: "2023-05-25"
slug: "pumkin-book-chapter15"
categories: 
    - "南瓜书"
    - "机器学习"
keywords:
    - "南瓜书"
    - "机器学习"
    - "数学"
math: true
image: "https://img.ququ123.top/img/nangua.jpg?imageView2/2/w/900/h/480"
---


[原文链接，转载请注明出处](https://www.ququ123.top/2024/03/ququ-blog)
## 15.2

$$
\mathrm{LRS}=2 \cdot\left(\hat{m}_{+} \log \_{2} \frac{\left(\frac{\hat{m}_{+}}{\hat{m}_{+}+\hat{m}_{-}}\right)}{\left(\frac{m_{+}}{m_{+}+m_{-}}\right)}+\hat{m}_{-} \log \_{2} \frac{\left(\frac{\hat{m}_{-}}{\hat{m}_{+}+\hat{m}_{-}}\right)}{\left(\frac{m_{-}}{m_{+}+m_{-}}\right)}\right)
$$

[解析]：似然率统计量(Likelihood Ratio Statistics)的定义式。

## 15.3

$$
\mathrm{F}_{-} \text {Gain }=\hat{m}_{+} \times\left(\log \_{2} \frac{\hat{m}_{+}}{\hat{m}_{+}+\hat{m}_{-}}-\log \_{2} \frac{m_{+}}{m_{+}+m_{-}}\right)
$$

[解析]：FOIL增益(FOIL gain)的定义式。

## 15.6

$$
(A \vee B)-\\{B\\}=A
$$

[解析]：析合范式的删除操作定义式，表示在$A$和$B$的析合式中删除成分$B$，得到成分$A$。

## 15.7

$$
C=\left(C_{1}-\\{L\\}\right) \vee\left(C_{2}-\\{\neg L\\}\right)
$$

[解析]：$C=A\vee B$，把$A=C_1 - \\{L\\}$和$L=C_2-\\{\neg L\\}$代入即得。

## 15.9

$$
C_{2}=\left(C-\left(C_{1}-\\{L\\}\right)\right) \vee\\{\neg L\\}
$$

[解析]：由式15.7可知
$$
C_2-\\{\neg L\\} = C - (C_1 - \\{L\\})
$$
由式15.6 移项即证得。

## 15.10

$$
\frac{p \leftarrow A \wedge B  \quad q \leftarrow A}{p \leftarrow q \wedge B  \quad q \leftarrow A}
$$

[解析]：吸收(absorption)操作的定义。

## 15.11

$$
\frac{p \leftarrow A \wedge B \quad p \leftarrow A \wedge q}{q \leftarrow B \quad p \leftarrow A \wedge q}
$$

[解析]：辨识(identification)操作的定义。

## 15.12

$$
\frac{p \leftarrow A \wedge B\quad p \leftarrow A \wedge q }{q \leftarrow B\quad p \leftarrow A \wedge q \quad q \leftarrow C} 
$$

[解析]：内构(intra-construction)操作的定义。

## 15.13

$$
\frac{p \leftarrow A \wedge B\quad q \leftarrow r \wedge C}{p \leftarrow r \wedge B\quad r \leftarrow A \quad q \leftarrow r \wedge C} 
$$

[解析]：互构(inter-construction)操作的定义。

## 15.14

$$
C=\left(C_{1}-\left\\{L_{1}\right\\}\right) \theta \vee\left(C_{2}-\left\\{L_{2}\right\\}\right) \theta
$$

[解析]：由式15.7，分别对析合的两个子项进行归结即得证。

## 15.16

$$
C_{2}=\left(C-\left(C_{1}-\left\\{L_{1}\right\\}\right) \theta_{1} \vee\left\\{\neg L_{1} \theta_{1}\right\\}\right)\theta_{2}^{-1}
$$

[推导]：$\theta_1$为作者笔误，由15.9
$$
\begin{aligned}
C_{2}&=\left(C-\left(C_{1}-\\{L_1\\}\right)\right) \vee\\{L_2\\}\\\
\end{aligned}
$$
因为 $L_2=(\neg L_1\theta_1)\theta_2^{-1}$，替换得证。
