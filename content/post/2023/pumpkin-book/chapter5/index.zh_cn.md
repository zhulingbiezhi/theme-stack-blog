---
title: "【南瓜书】第五章"
description: "本章详细讲解了神经网络相关算法，包括感知机模型、反向传播算法、Boltzmann机等核心内容"
date: "2023-05-15"
slug: "pumkin-book-chapter5"
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

## 5.2
$$\Delta w_i=\eta(y-\hat{y})x_i$$
[解析]：此公式是感知机学习算法中的参数更新公式，下面依次给出感知机模型、学习策略和学习算法的具体介绍<sup>[1]</sup>：
### 感知机模型
已知感知机由两层神经元组成，故感知机模型的公式可表示为
$$y=f(\sum\limits\_{i=1}^{n}w_ix_i-\theta)=f(\boldsymbol{w}^{\mathrm{T}}\boldsymbol{x}-\theta)$$
其中，$\boldsymbol{x} \in \mathbb{R}^n$为样本的特征向量，是感知机模型的输入；$\boldsymbol{w},\theta$是感知机模型的参数，$\boldsymbol{w} \in \mathbb{R}^n$为权重，$\theta$为阈值。上式中的$f$通常设为符号函数，那么感知机模型的公式可进一步表示为
$$ y=\operatorname{sign}(\boldsymbol{w}^{\mathrm{T}}\boldsymbol{x}-\theta)=\left\\{\begin{array}{rcl}
1,& {\boldsymbol{w}^{\mathrm{T}}\boldsymbol{x} -\theta\geq 0}\\\
0,& {\boldsymbol{w}^{\mathrm{T}}\boldsymbol{x} -\theta < 0}\\\
\end{array} \right.$$
由于$n$维空间中的超平面方程为
$$w_1x_1+w_2x_2+\cdots+w_nx_n+b  =\boldsymbol{w}^{\mathrm{T}}\boldsymbol{x} +b=0$$
所以此时感知机模型公式中的$\boldsymbol{w}^{\mathrm{T}}\boldsymbol{x}-\theta$可以看作是$n$维空间中的一个超平面，通过它将$n$维空间划分为$\boldsymbol{w}^{\mathrm{T}}\boldsymbol{x}-\theta\geq 0$和$\boldsymbol{w}^{\mathrm{T}}\boldsymbol{x}-\theta<0$两个子空间，落在前一个子空间的样本对应的模型输出值为1，落在后一个子空间的样本对应的模型输出值为0，以此来实现分类功能。
### 感知机学习策略
给定一个线性可分的数据集$T$（参见附录①），感知机的学习目标是求得能对数据集$T$中的正负样本完全正确划分的分离超平面：
$$\boldsymbol{w}^{\mathrm{T}}\boldsymbol{x}-\theta=0$$
假设此时误分类样本集合为$M\subseteq T$，对任意一个误分类样本$(\boldsymbol{x},y)\in M$来说，当$\boldsymbol{w}^\mathrm{T}\boldsymbol{x}-\theta \geq 0$时，模型输出值为$\hat{y}=1$，样本真实标记为$y=0$；反之，当$\boldsymbol{w}^\mathrm{T}\boldsymbol{x}-\theta<0$时，模型输出值为$\hat{y}=0$，样本真实标记为$y=1$。综合两种情形可知，以下公式恒成立
$$(\hat{y}-y)(\boldsymbol{w}^\mathrm{T}\boldsymbol{x}-\theta)\geq0$$
所以，给定数据集$T$，其损失函数可以定义为：
$$L(\boldsymbol{w},\theta)=\sum\_{\boldsymbol{x}\in M}(\hat{y}-y)(\boldsymbol{w}^\mathrm{T}\boldsymbol{x}-\theta)$$
显然，此损失函数是非负的。如果没有误分类点，损失函数值是0。而且，误分类点越少，误分类点离超平面越近，损失函数值就越小。因此，给定数据集$T$，损失函数$L(\boldsymbol{w},\theta)$是关于$\boldsymbol{w},\theta$的连续可导函数。
### 感知机学习算法
感知机模型的学习问题可以转化为求解损失函数的最优化问题，具体地，给定数据集
$$T=\\{(\boldsymbol{x}\_1,y_1),(\boldsymbol{x}\_2,y_2),\dots,(\boldsymbol{x}\_N,y_N)\\}$$
其中$\boldsymbol{x}\_i \in \mathbb{R}^n,y_i \in \\{0,1\\}$，求参数$\boldsymbol{w},\theta$，使其为极小化损失函数的解：
$$\min\limits\_{\boldsymbol{w},\theta}L(\boldsymbol{w},\theta)=\min\limits\_{\boldsymbol{w},\theta}\sum\_{\boldsymbol{x_i}\in M}(\hat{y}\_i-y_i)(\boldsymbol{w}^\mathrm{T}\boldsymbol{x}\_i-\theta)$$
其中$M\subseteq T$为误分类样本集合。若将阈值$\theta$看作一个固定输入为$-1$的“哑节点”，即
$$-\theta=-1\cdot w\_{n+1}=x\_{n+1}\cdot w\_{n+1}$$
那么$\boldsymbol{w}^\mathrm{T}\boldsymbol{x}\_i-\theta$可化简为
$$\begin{aligned}
\boldsymbol{w}^\mathrm{T}\boldsymbol{x_i}-\theta&=\sum \limits\_{j=1}^n w_jx_j+x\_{n+1}\cdot w\_{n+1}\\\
&=\sum \limits\_{j=1}^{n+1}w_jx_j\\\
&=\boldsymbol{w}^{\mathrm{T}}\boldsymbol{x_i}
 \end{aligned}$$
其中$\boldsymbol{x_i} \in \mathbb{R}^{n+1},\boldsymbol{w} \in \mathbb{R}^{n+1}$。根据该式，可将要求解的极小化问题进一步简化为
$$\min\limits\_{\boldsymbol{w}}L(\boldsymbol{w})=\min\limits\_{\boldsymbol{w}}\sum\_{\boldsymbol{x_i}\in M}(\hat{y}\_i-y_i)\boldsymbol{w}^\mathrm{T}\boldsymbol{x_i}$$
假设误分类样本集合$M$固定，那么可以求得损失函数$L(\boldsymbol{w})$的梯度为：
$$\nabla_{\boldsymbol{w}}L(\boldsymbol{w})=\sum\_{\boldsymbol{x_i}\in M}(\hat{y}\_i-y_i)\boldsymbol{x_i}$$
感知机的学习算法具体采用的是随机梯度下降法，也就是极小化过程中不是一次使$M$中所有误分类点的梯度下降，而是一次随机选取一个误分类点使其梯度下降。所以权重$\boldsymbol{w}$的更新公式为
$$\boldsymbol w \leftarrow \boldsymbol w+\Delta \boldsymbol w$$
$$\Delta \boldsymbol w=-\eta(\hat{y}\_i-y_i)\boldsymbol x_i=\eta(y_i-\hat{y}\_i)\boldsymbol x_i$$
相应地，$\boldsymbol{w}$中的某个分量$w_i$的更新公式即为公式(5.2)。

## 5.10
$$\begin{aligned}
g_j&=-\frac{\partial {E_k}}{\partial{\hat{y}\_j^k}} \cdot \frac{\partial{\hat{y}\_j^k}}{\partial{\beta_j}}
\\\ &=-( \hat{y}\_j^k-y_j^k ) f ^{\prime} (\beta_j-\theta_j)
\\\ &=\hat{y}\_j^k(1-\hat{y}\_j^k)(y_j^k-\hat{y}\_j^k)
\end{aligned}$$
[推导]：参见公式(5.12)

## 5.12
$$\Delta \theta_j = -\eta g_j$$
[推导]：因为
$$\Delta \theta_j = -\eta \cfrac{\partial E_k}{\partial \theta_j}$$
又
$$
\begin{aligned}	
\cfrac{\partial E_k}{\partial \theta_j} &= \cfrac{\partial E_k}{\partial \hat{y}\_j^k} \cdot\cfrac{\partial \hat{y}\_j^k}{\partial \theta_j} \\\
&= \cfrac{\partial E_k}{\partial \hat{y}\_j^k} \cdot\cfrac{\partial [f(\beta_j-\theta_j)]}{\partial \theta_j} \\\
&=\cfrac{\partial E_k}{\partial \hat{y}\_j^k} \cdot f^{\prime}(\beta_j-\theta_j) \times (-1) \\\
&=\cfrac{\partial E_k}{\partial \hat{y}\_j^k} \cdot f\left(\beta_{j}-\theta_{j}\right)\times\left[1-f\left(\beta_{j}-\theta_{j}\right)\right]  \times (-1) \\\
&=\cfrac{\partial E_k}{\partial \hat{y}\_j^k} \cdot \hat{y}\_j^k\left(1-\hat{y}\_j^k\right)  \times (-1) \\\
&=\cfrac{\partial\left[ \cfrac{1}{2} \sum\limits\_{j=1}^{l}\left(\hat{y}\_{j}^{k}-y_{j}^{k}\right)^{2}\right]}{\partial \hat{y}\_{j}^{k}} \cdot \hat{y}\_j^k\left(1-\hat{y}\_j^k\right) \times (-1)  \\\
&=\cfrac{1}{2}\times 2(\hat{y}\_j^k-y_j^k)\times 1 \cdot\hat{y}\_j^k\left(1-\hat{y}\_j^k\right)  \times (-1) \\\
&=(y_j^k-\hat{y}\_j^k)\hat{y}\_j^k\left(1-\hat{y}\_j^k\right)  \\\
&= g_j
\end{aligned}
$$
所以
$$\Delta \theta_j = -\eta \cfrac{\partial E_k}{\partial \theta_j}=-\eta g_j$$

## 5.13
$$\Delta v_{ih} = \eta e_h x_i$$
[推导]：因为
$$\Delta v_{ih} = -\eta \cfrac{\partial E_k}{\partial v_{ih}}$$
又
$$
\begin{aligned}	
\cfrac{\partial E_k}{\partial v_{ih}} &= \sum_{j=1}^{l} \cfrac{\partial E_k}{\partial \hat{y}\_j^k} \cdot \cfrac{\partial \hat{y}\_j^k}{\partial \beta_j} \cdot \cfrac{\partial \beta_j}{\partial b_h} \cdot \cfrac{\partial b_h}{\partial \alpha_h} \cdot \cfrac{\partial \alpha_h}{\partial v_{ih}} \\\
&= \sum_{j=1}^{l} \cfrac{\partial E_k}{\partial \hat{y}\_j^k} \cdot \cfrac{\partial \hat{y}\_j^k}{\partial \beta_j} \cdot \cfrac{\partial \beta_j}{\partial b_h} \cdot \cfrac{\partial b_h}{\partial \alpha_h} \cdot x_i \\\ 
&= \sum_{j=1}^{l} \cfrac{\partial E_k}{\partial \hat{y}\_j^k} \cdot \cfrac{\partial \hat{y}\_j^k}{\partial \beta_j} \cdot \cfrac{\partial \beta_j}{\partial b_h} \cdot f^{\prime}(\alpha_h-\gamma_h) \cdot x_i \\\
&= \sum_{j=1}^{l} \cfrac{\partial E_k}{\partial \hat{y}\_j^k} \cdot \cfrac{\partial \hat{y}\_j^k}{\partial \beta_j} \cdot w\_{hj} \cdot f^{\prime}(\alpha_h-\gamma_h) \cdot x_i \\\
&= \sum_{j=1}^{l} (-g_j) \cdot w\_{hj} \cdot f^{\prime}(\alpha_h-\gamma_h) \cdot x_i \\\
&= -f^{\prime}(\alpha_h-\gamma_h) \cdot \sum_{j=1}^{l} g_j \cdot w\_{hj}  \cdot x_i\\\
&= -b_h(1-b_h) \cdot \sum_{j=1}^{l} g_j \cdot w\_{hj}  \cdot x_i \\\
&= -e_h \cdot x_i
\end{aligned}
$$
所以
$$\Delta v_{ih} =-\eta \cfrac{\partial E_k}{\partial v_{ih}} =\eta e_h x_i$$

## 5.14
$$\Delta \gamma_h= -\eta e_h$$
[推导]：因为
$$\Delta \gamma_h = -\eta \cfrac{\partial E_k}{\partial \gamma_h}$$
又
$$
\begin{aligned}	
\cfrac{\partial E_k}{\partial \gamma_h} &= \sum_{j=1}^{l} \cfrac{\partial E_k}{\partial \hat{y}\_j^k} \cdot \cfrac{\partial \hat{y}\_j^k}{\partial \beta_j} \cdot \cfrac{\partial \beta_j}{\partial b_h} \cdot \cfrac{\partial b_h}{\partial \gamma_h} \\\
&= \sum_{j=1}^{l} \cfrac{\partial E_k}{\partial \hat{y}\_j^k} \cdot \cfrac{\partial \hat{y}\_j^k}{\partial \beta_j} \cdot \cfrac{\partial \beta_j}{\partial b_h} \cdot f^{\prime}(\alpha_h-\gamma_h) \cdot (-1) \\\
&= -\sum\_{j=1}^{l} \cfrac{\partial E_k}{\partial \hat{y}\_j^k} \cdot \cfrac{\partial \hat{y}\_j^k}{\partial \beta_j} \cdot w\_{hj} \cdot f^{\prime}(\alpha_h-\gamma_h)\\\
&= -\sum\_{j=1}^{l} \cfrac{\partial E_k}{\partial \hat{y}\_j^k} \cdot \cfrac{\partial \hat{y}\_j^k}{\partial \beta_j} \cdot w\_{hj} \cdot b_h(1-b_h)\\\
&= \sum_{j=1}^{l}g_j\cdot w\_{hj} \cdot b_h(1-b_h)\\\
&=e_h
\end{aligned}
$$
所以
$$\Delta \gamma_h=-\eta\cfrac{\partial E_k}{\partial \gamma_h} = -\eta e_h$$

## 5.15
$$\begin{aligned}
e_h&=-\frac{\partial {E_k}}{\partial{b_h}}\cdot \frac{\partial{b_h}}{\partial{\alpha_h}}
\\\ &=-\sum\_{j=1}^l \frac{\partial {E_k}}{\partial{\beta_j}}\cdot \frac{\partial{\beta_j}}{\partial{b_h}}f^{\prime}(\alpha_h-\gamma_h)
\\\ &=\sum_{j=1}^l w\_{hj}g_j f^{\prime}(\alpha_h-\gamma_h)
\\\ &=b_h(1-b_h)\sum_{j=1}^l w\_{hj}g_j 
\end{aligned}$$
[推导]：参见公式(5.13)

## 5.20
$$E(\boldsymbol{s})=-\sum\_{i=1}^{n-1}\sum_{j=i+1}^{n}w\_{ij}s_is_j-\sum\_{i=1}^n\theta_is_i$$
[解析]：Boltzmann机本质上是一个引入了隐变量的无向图模型，无向图的能量可理解为
$$E_{graph}=E\_{edges}+E_{nodes}$$
其中，$E_{graph}$表示图的能量，$E\_{edges}$表示图中边的能量，$E_{nodes}$表示图中结点的能量；边能量由两连接结点的值及其权重的乘积确定：$E\_{{edge}\_{ij}}=-w\_{ij}s_is_j$，结点能量由结点的值及其阈值的乘积确定：$E_{{node}_i}=-\theta_is_i$；图中边的能量为图中所有边能量之和
$$E\_{edges}=\sum\_{i=1}^{n-1}\sum\_{j=i+1}^{n}E\_{{edge}\_{ij}}=-\sum\_{i=1}^{n-1}\sum\_{j=i+1}^{n}w\_{ij}s_is_j$$
图中结点的能量为图中所有结点能量之和
$$E\_{nodes}=\sum\_{i=1}^nE\_{{node}\_i}=-\sum\_{i=1}^n\theta_is_i$$
故状态向量$\boldsymbol{s}$所对应的Boltzmann机能量为
$$E\_{graph}=E\_{edges}+E\_{nodes}=-\sum\_{i=1}^{n-1}\sum\_{j=i+1}^{n}w\_{ij}s_is_j-\sum\_{i=1}^n\theta_is_i$$

## 5.22
$$P(\boldsymbol{v}|\boldsymbol{h})=\prod\_{i=1}^dP(v_i\,  |  \, \boldsymbol{h})$$
[解析]：受限Boltzmann机仅保留显层与隐层之间的连接，显层的状态向量为$\boldsymbol{v}$，隐层的状态向量为$\boldsymbol{h}$。
$$\boldsymbol{v}=\left[\begin{array}{c}v_1\\\ v_2\\\ \vdots\\\ v_d\\\\\end{array} \right]\qquad
\boldsymbol{h}=\left[\begin{array}{c}h_1\\\h_2\\\ \vdots\\\ h_q\end{array} \right]$$
对于显层状态向量$\boldsymbol{v}$中的变量$v_i$，其仅与隐层状态向量$\boldsymbol{h}$有关，所以给定隐层状态向量$\boldsymbol{h}$，$v_1,v_2,...,v_d$相互独立。

## 5.23
$$P(\boldsymbol{h}|\boldsymbol{v})=\prod\_{j=1}^qP(h_i\,  |  \, \boldsymbol{v})$$
[解析]：由公式5.22的解析同理可得：给定显层状态向量$\boldsymbol{v}$，$h_1,h_2,\cdots,h_q$相互独立。

## 5.24
$$\Delta w=\eta(\boldsymbol{v}\boldsymbol{h}^\mathrm{T}-\boldsymbol{v}’\boldsymbol{h}’^{\mathrm{T}})$$
[推导]：由公式(5.20)可推导出受限Boltzmann机（以下简称RBM）的能量函数为：
$$\begin{aligned}
E(\boldsymbol{v},\boldsymbol{h})&=-\sum\_{i=1}^d\sum_{j=1}^qw\_{ij}v_ih_j-\sum\_{i=1}^d\alpha_iv_i-\sum\_{j=1}^q\beta_jh_j \\\
&=-\boldsymbol{h}^{\mathrm{T}}\mathbf{W}\boldsymbol{v}-\boldsymbol{\alpha}^{\mathrm{T}}\boldsymbol{v}-\boldsymbol{\beta}^{\mathrm{T}}\boldsymbol{h}
\end{aligned}$$
其中
$$\mathbf{W}=\begin{bmatrix}
\boldsymbol{w}_1\\\
\boldsymbol{w}_2\\\ 
\vdots\\\
\boldsymbol{w}_q
\end{bmatrix}\in \mathbb{R}^{q*d}$$
再由公式(5.21)可知，RBM的联合概率分布为
$$P(\boldsymbol{v},\boldsymbol{h})=\frac{1}{Z}e^{-E(\boldsymbol{v},\boldsymbol{h})}$$
其中$Z$为规范化因子
$$Z=\sum\_{\boldsymbol{v},\boldsymbol{h}}e^{-E(\boldsymbol{v},\boldsymbol{h})}$$
给定含$m$个独立同分布数据的数据集$V=\\{\boldsymbol{v}_1,\boldsymbol{v}_2,\cdots,\boldsymbol{v}_m\\}$，记$\boldsymbol{\theta}=\\{\mathbf{W},\boldsymbol{\alpha},\boldsymbol{\beta}\\}$，学习RBM的策略是求出参数$\boldsymbol{\theta}$的值，使得如下对数似然函数最大化
$$\begin{aligned}
L(\boldsymbol{\theta})&=\ln\left(\prod\_{k=1}^{m}P(\boldsymbol{v}_k)\right) \\\
&=\sum\_{k=1}^m\ln P(\boldsymbol{v}_k) \\\
&= \sum\_{k=1}^m L_k(\boldsymbol{\theta})
\end{aligned}$$
具体采用的是梯度上升法来求解参数$\boldsymbol{\theta}$，因此，下面来考虑求对数似然函数$L(\boldsymbol{\theta})$的梯度。对于$V$中的任意一个样本$\boldsymbol{v}_k$来说，其$L_k(\boldsymbol{\theta})$的具体形式为
$$\begin{aligned}
L_k(\boldsymbol{\theta})&=\ln P(\boldsymbol{v}_k)
\\\ &=\ln\left(\sum\_{\boldsymbol{h}}P(\boldsymbol{v}_k,\boldsymbol{h})\right)
\\\ &=\ln\left(\sum\_{\boldsymbol{h}}\frac{1}{Z}e^{-E(\boldsymbol{v}_k,\boldsymbol{h})}\right)
\\\ &=\ln\left(\sum\_{\boldsymbol{h}}e^{-E(\boldsymbol{v}_k,\boldsymbol{h})}\right)-\ln Z
\\\ &=\ln\left(\sum\_{\boldsymbol{h}}e^{-E(\boldsymbol{v}_k,\boldsymbol{h})}\right)-\ln\left(\sum\_{\boldsymbol{v},\boldsymbol{h}}e^{-E({\boldsymbol{v},\boldsymbol{h})}}\right)
\end{aligned}$$
对$L_k(\boldsymbol{\theta})$进行求导
$$
\begin{aligned}
\frac{\partial{L_k(\boldsymbol{\theta})}}{\partial{\boldsymbol{\theta}}}&=\frac{\partial}{\partial{\boldsymbol{\theta}}}\left[\ln\sum\_{\boldsymbol{h}}e^{-E(\boldsymbol{v}_k,\boldsymbol{h})}\right]-\frac{\partial}{\partial{\boldsymbol{\theta}}}\left[\ln\sum\_{\boldsymbol{v},\boldsymbol{h}}e^{-E({\boldsymbol{v},\boldsymbol{h})}}\right]
\\\ &=-\frac{\sum\_{\boldsymbol{h}}e^{-E(\boldsymbol{v}_k,\boldsymbol{h})}\frac{\partial{E({\boldsymbol{v}_k,\boldsymbol{h})}}}{\partial{\boldsymbol{\theta}}}}{\sum\_{\boldsymbol{h}}e^{-E(\boldsymbol{v}_k,\boldsymbol{h})}}+\frac{\sum\_{\boldsymbol{v},\boldsymbol{h}}e^{-E(\boldsymbol{v},\boldsymbol{h})}\frac{\partial{E({\boldsymbol{v},\boldsymbol{h})}}}{\partial{\boldsymbol{\theta}}}}{\sum\_{\boldsymbol{v},\boldsymbol{h}}e^{-E(\boldsymbol{v},\boldsymbol{h})}}
\\\ &=-\sum\_{\boldsymbol{h}}\frac{e^{-E(\boldsymbol{v}_k,\boldsymbol{h})}\frac{\partial{E({\boldsymbol{v}_k,\boldsymbol{h})}}}{\partial{\boldsymbol{\theta}}}}{\sum\_{\boldsymbol{h}}e^{-E(\boldsymbol{v}_k,\boldsymbol{h})}}+\sum\_{\boldsymbol{v},\boldsymbol{h}}\frac{e^{-E(\boldsymbol{v},\boldsymbol{h})}\frac{\partial{E({\boldsymbol{v},\boldsymbol{h})}}}{\partial{\boldsymbol{\theta}}}}{\sum\_{\boldsymbol{v},\boldsymbol{h}}e^{-E(\boldsymbol{v},\boldsymbol{h})}}
\end{aligned}
$$
由于
$$\frac{e^{-E({\boldsymbol{v}_k,\boldsymbol{h})}}}{\sum\_{\boldsymbol{h}}e^{-E({\boldsymbol{v}_k,\boldsymbol{h})}}}=\frac{\frac{e^{-E({\boldsymbol{v}_k,\boldsymbol{h})}}}{Z}}{\frac{\sum\_{\boldsymbol{h}}e^{-E({\boldsymbol{v}_k,\boldsymbol{h})}}}{Z}}=\frac{\frac{e^{-E({\boldsymbol{v}_k,\boldsymbol{h})}}}{Z}}{\sum\_{\boldsymbol{h}}\frac{e^{-E({\boldsymbol{v}_k,\boldsymbol{h})}}}{Z}}=\frac{P(\boldsymbol{v}_k,\boldsymbol{h})}{\sum\_{\boldsymbol{h}}P(\boldsymbol{v}_k,\boldsymbol{h})}=P(\boldsymbol{h}|\boldsymbol{v}_k)
$$
$$\frac{e^{-E({\boldsymbol{v},\boldsymbol{h})}}}{\sum\_{\boldsymbol{v},\boldsymbol{h}}e^{-E({\boldsymbol{v},\boldsymbol{h})}}}=\frac{\frac{e^{-E({\boldsymbol{v},\boldsymbol{h})}}}{Z}}{\frac{\sum\_{\boldsymbol{v},\boldsymbol{h}}e^{-E({\boldsymbol{v},\boldsymbol{h})}}}{Z}}=\frac{\frac{e^{-E({\boldsymbol{v},\boldsymbol{h})}}}{Z}}{\sum\_{\boldsymbol{v},\boldsymbol{h}}\frac{e^{-E({\boldsymbol{v},\boldsymbol{h})}}}{Z}}=\frac{P(\boldsymbol{v},\boldsymbol{h})}{\sum\_{\boldsymbol{v},\boldsymbol{h}}P(\boldsymbol{v},\boldsymbol{h})}=P(\boldsymbol{v},\boldsymbol{h})$$
故
$$
\begin{aligned}
\frac{\partial{L_k(\boldsymbol{\theta})}}{\partial{\boldsymbol{\theta}}}&=-\sum\_{\boldsymbol{h}}P(\boldsymbol{h}|\boldsymbol{v}_k)\frac{\partial{E({\boldsymbol{v}_k,\boldsymbol{h})}}}{\partial{\boldsymbol{\theta}}}+\sum\_{\boldsymbol{v},\boldsymbol{h}}P(\boldsymbol{v},\boldsymbol{h})\frac{\partial{E({\boldsymbol{v},\boldsymbol{h})}}}{\partial{\boldsymbol{\theta}}}
\\\ &=-\sum\_{\boldsymbol{h}}P(\boldsymbol{h}|\boldsymbol{v}_k)\frac{\partial{E({\boldsymbol{v}_k,\boldsymbol{h})}}}{\partial{\boldsymbol{\theta}}}+\sum\_{\boldsymbol{v}}\sum\_{\boldsymbol{h}}P(\boldsymbol{v})P(\boldsymbol{h}|\boldsymbol{v})\frac{\partial{E({\boldsymbol{v},\boldsymbol{h})}}}{\partial{\boldsymbol{\theta}}}
\\\ &=-\sum\_{\boldsymbol{h}}P(\boldsymbol{h}|\boldsymbol{v}_k)\frac{\partial{E({\boldsymbol{v}_k,\boldsymbol{h})}}}{\partial{\boldsymbol{\theta}}}+\sum\_{\boldsymbol{v}}P(\boldsymbol{v})\sum\_{\boldsymbol{h}}P(\boldsymbol{h}|\boldsymbol{v})\frac{\partial{E({\boldsymbol{v},\boldsymbol{h})}}}{\partial{\boldsymbol{\theta}}}
\end{aligned}$$
由于$\boldsymbol{\theta}=\\{\mathbf{W},\boldsymbol{\alpha},\boldsymbol{\beta}\\}$包含三个参数，在这里我们仅以$\mathbf{W}$中的任意一个分量$w\_{ij}$为例进行详细推导。首先将上式中的$\boldsymbol{\theta}$替换为$w\_{ij}$可得
$$\frac{\partial{L_k(\boldsymbol{\theta})}}{\partial{w\_{ij}}}=-\sum\_{\boldsymbol{h}}P(\boldsymbol{h}|\boldsymbol{v}_k)\frac{\partial{E({\boldsymbol{v}_k,\boldsymbol{h})}}}{\partial{w\_{ij}}}+\sum\_{\boldsymbol{v}}P(\boldsymbol{v})\sum\_{\boldsymbol{h}}P(\boldsymbol{h}|\boldsymbol{v})\frac{\partial{E({\boldsymbol{v},\boldsymbol{h})}}}{\partial{w\_{ij}}}$$
根据公式(5.23)可知
$$\begin{aligned}
&\sum\_{\boldsymbol{h}}P(\boldsymbol{h}|\boldsymbol{v})\frac{\partial{E({\boldsymbol{v},\boldsymbol{h})}}}{\partial{w\_{ij}}}\\\
=&-\sum\_{\boldsymbol{h}}P(\boldsymbol{h}|\boldsymbol{v})h_iv_j\\\
=&-\sum\_{\boldsymbol{h}}\prod\_{l=1}^{q}P(h_l|\boldsymbol{v})h_iv_j\\\
=&-\sum\_{\boldsymbol{h}}P(h_i|\boldsymbol{v})\prod\_{l=1,l\neq i}^{q}P(h_l|\boldsymbol{v})h_iv_j\\\
=&-\sum\_{\boldsymbol{h}}P(h_i|\boldsymbol{v})P(h_1,...,h\_{i-1},h\_{i+1},...,h_q|\boldsymbol{v})h_iv_j\\\
=&-\sum\_{h_i}P(h_i|\boldsymbol{v})h_iv_j\sum\_{h_1,...,h\_{i-1},h\_{i+1},...,h_q}P(h_1,...,h\_{i-1},h\_{i+1},...,h_q|\boldsymbol{v})\\\
=&-\sum\_{h_i}P(h_i|\boldsymbol{v})h_iv_j\cdot 1\\\
=&-\left[P(h_i=0|\boldsymbol{v})\cdot0\cdot v_j+P(h_i=1|\boldsymbol{v})\cdot 1\cdot v_j\right]\\\
=&-P(h_i=1|\boldsymbol{v})v_j
\end{aligned}$$
同理可推得
$$\sum\_{\boldsymbol{h}}P(\boldsymbol{h}|\boldsymbol{v}_k)\frac{\partial{E({\boldsymbol{v}_k,\boldsymbol{h})}}}{\partial{w\_{ij}}}=-P(h_i=1|\boldsymbol{v}_k)v_j^k$$
将以上两式代回$\frac{\partial{L_k(\boldsymbol{\theta})}}{\partial{w\_{ij}}}$中可得
$$\frac{\partial{L_k(\boldsymbol{\theta})}}{\partial{w\_{ij}}}=P(h_i=1|\boldsymbol{v}\_k){v\_{j}^k}-\sum\_{\boldsymbol{v}}P(\boldsymbol{v})P(h_i=1|\boldsymbol{v})v_j$$
观察此式可知，通过枚举所有可能的$\boldsymbol{v}$来计算$\sum\_{\boldsymbol{v}}P(\boldsymbol{v})P(h_i=1|\boldsymbol{v})v_j$的复杂度太高，因此可以考虑求其近似值来简化计算。具体地，RBM通常采用的是西瓜书上所说的“对比散度”（Contrastive Divergence，简称CD）算法。CD算法的核心思想<sup>[2]</sup>是：用步长为$s$（通常设为1）的CD算法
$$CD_s(\boldsymbol{\theta},\boldsymbol{v})=-\sum\_{\boldsymbol{h}}P(\boldsymbol{h}|\boldsymbol{v}^{(0)})\frac{\partial{E({\boldsymbol{v}^{(0)},\boldsymbol{h})}}}{\partial{\boldsymbol{\theta}}}+\sum\_{\boldsymbol{h}}P(\boldsymbol{h}|\boldsymbol{v}^{(s)})\frac{\partial{E({\boldsymbol{v}^{(s)},\boldsymbol{h})}}}{\partial{\boldsymbol{\theta}}}$$
近似代替
$$\frac{\partial{L_k(\boldsymbol{\theta})}}{\partial{\boldsymbol{\theta}}}=-\sum\_{\boldsymbol{h}}P(\boldsymbol{h}|\boldsymbol{v}_k)\frac{\partial{E({\boldsymbol{v}_k,\boldsymbol{h})}}}{\partial{\boldsymbol{\theta}}}+\sum\_{\boldsymbol{v}}P(\boldsymbol{v})\sum\_{\boldsymbol{h}}P(\boldsymbol{h}|\boldsymbol{v})\frac{\partial{E({\boldsymbol{v},\boldsymbol{h})}}}{\partial{\boldsymbol{\theta}}}$$
由此可知对于$w\_{ij}$来说，就是用
$$CD_s(w\_{ij},\boldsymbol{v})=P(h_i=1|\boldsymbol{v}^{(0)}){v\_{j}^{(0)}}-P(h_i=1|\boldsymbol{v}^{(s)})v_j^{(s)}$$
近似代替
$$\frac{\partial{L_k(\boldsymbol{\theta})}}{\partial{w\_{ij}}}=P(h_i=1|\boldsymbol{v}\_k){v\_{j}^k}-\sum\_{\boldsymbol{v}}P(\boldsymbol{v})P(h_i=1|\boldsymbol{v})v_j$$
令$\Delta w\_{ij}:=\frac{\partial{L_k(\boldsymbol{\theta})}}{\partial{w\_{ij}}}$，$RBM(\boldsymbol\theta)$表示参数为$\boldsymbol{\theta}$的RBM网络，则$CD_s(w\_{ij},\boldsymbol{v})$的具体算法可表示为：
- 输入：$s,V=\\{\boldsymbol{v}_1,\boldsymbol{v}_2,\cdots,\boldsymbol{v}_m\\},RBM(\boldsymbol\theta)$
- 过程：
    1. 初始化：$\Delta w\_{ij}=0$
    2. $for\quad \boldsymbol{v}\in V \quad do$
    3. $\quad \boldsymbol{v}^{(0)}:=\boldsymbol{v}$
    4. $\quad for\quad t=1,2,...,s-1\quad do$
    5. $\qquad \boldsymbol{h}^{(t)}=h\_given\_v(\boldsymbol{v}^{(t)},RBM(\boldsymbol\theta))$
    6. $\qquad \boldsymbol{v}^{(t+1)}=v\_given\_h(\boldsymbol{h}^{(t)},RBM(\boldsymbol\theta))$
    7. $\quad end\quad for$
    8. $\quad for\quad i=1,2,...,q;j=1,2,...,d\quad do$
    9. $\qquad \Delta w\_{ij}=\Delta w\_{ij}+\left[P(h_i=1|\boldsymbol{v}^{(0)}){v\_{j}^{(0)}}-P(h_i=1|\boldsymbol{v}^{(s)})v_j^{(s)}\right]$
    10. $\quad end\quad for$
    11. $end\quad for$
- 输出：$\Delta w\_{ij}$

其中函数$h\_given\_v(\boldsymbol{v},RBM(\boldsymbol\theta))$表示在给定$\boldsymbol{v}$的条件下，从$RBM(\boldsymbol\theta)$中采样生成$\boldsymbol{h}$，同理，函数$v\_given\_h(\boldsymbol{h},RBM(\boldsymbol\theta))$表示在给定$\boldsymbol{h}$的条件下，从$RBM(\boldsymbol\theta)$中采样生成$\boldsymbol{v}$。由于两个函数的算法可以互相类比推得，因此，下面仅给出函数$h\_given\_v(\boldsymbol{v},RBM(\boldsymbol\theta))$的具体算法：
- 输入：$\boldsymbol{v},RBM(\boldsymbol\theta)$
- 过程：
    1. $for \quad i=1,2,...,q \quad do$
    2. $\quad \text{随机生成} 0\leq\alpha_i\leq 1$
    3. $\quad h_{j}=\left\\{\begin{array}{ll}1, & \text { if } \alpha_{i}<P(h_i=1|\boldsymbol{v}) \\\ 0, & \text { otherwise }\end{array}\right.$
    4. $end \quad for$
- 输出：$\boldsymbol{h}=(h_1,h_2,...,h_q)^{\mathrm{T}}$

综上可知，公式(5.24)其实就是带有学习率为$\eta$的$\Delta w\_{ij}$的一种形式化的表示。

## 附录
### ①数据集的线性可分<sup>[1]</sup>
给定一个数据集
$$T=\\{(\boldsymbol{x}\_1,y_1),(\boldsymbol{x}\_2,y_2),...,(\boldsymbol{x}\_N,y_N)\\}$$
其中，$\boldsymbol{x}\_i\in \mathbb{R}^n,y_i\in\\{0,1\\},i=1,2,...,N$，如果存在某个超平面
$$\boldsymbol{w}^{\mathrm{T}}\boldsymbol{x} +b=0 $$
能将数据集$T$中的正样本和负样本完全正确地划分到超平面两侧，即对所有$y_i=1$的样本$\boldsymbol{x}\_i$，有$\boldsymbol{w}^{\mathrm{T}}\boldsymbol{x}\_i +b\geq0$，对所有$y_i=0$的样本$\boldsymbol{x}\_i$，有$\boldsymbol{w}^{\mathrm{T}}\boldsymbol{x} _i+b<0$，则称数据集$T$线性可分，否则称数据集$T$线性不可分。
## 参考文献
[1]李航编著.统计学习方法[M].清华大学出版社,2012.<br>
[2]https://blog.csdn.net/itplus/article/details/19408143
