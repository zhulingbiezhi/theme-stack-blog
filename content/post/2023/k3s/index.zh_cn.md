---
title: "不同云厂商的服务器搭建K3S集群"
date: "2023-11-25"
slug: "k3s-multi-cloud"
categories: 
    - "k3s"
    - "k8s"
    - "wireguard"
    - "k3sup"
keywords:
    - "k3s"
    - "k8s"
    - "wireguard"
    - "k3sup"
    - "cloud"
    - "云服务"
image: "https://img.ququ123.top/img/1*vczfQPNVKdJXTmcGB3VtkA.png"
---


[原文链接，转载请注明出处](https://www.ququ123.top/2024/03/ququ-blog)

## 背景

由于买的国内厂商打折服务器，大部分情况下都无法在同一家厂商买到多台优惠服务器，此时想搭建 K3S 集群就需要走公网，直接通过K3S 的安装方式节点之间无法通信，因此需要使用 `WireGuard`来组网。

在阅读本篇之前建议你先阅读 `WireGuard` 的`Quickstart`来了解它的概念，这将对接下来配置`WireGuard`十分重要:

> [https://www.wireguard.com/quickstart/](https://www.wireguard.com/quickstart/)

`重点提醒：别用k3sup，源码就是个套壳命令行，没啥用,还是自己动手强，丰衣足食`

以两台服务器为例信息如下:

| 集群节点 | 厂商  | 公网 IP 地址 | 内网 IP 地址 | 操作系统 |
| --- |-----| --- | --- | --- |
| k3s-master | 腾讯云 | 42.xxx.xxx.60 | 172.17.16.4 | Ubuntu 20.04 |
| k3s-node-1 | 阿里云 | 139.xx.xx.46 | 10.190.19.38 | Ubuntu 20.04 |

最终需要达到的目标信息如下：

| 集群节点 | 厂商  | 公网 IP 地址 | 内网 IP 地址      | 虚拟IP地址      | 操作系统 |
| --- |-----| --- |---------------|-------------| --- |
| k3s-master | 腾讯云 | 42.xxx.xxx.60 | 172.17.16.4   | 192.168.2.1 | Ubuntu 20.04 |
| k3s-node-1 | 阿里云 | 139.xx.xx.46 | 10.190.19.38  | 192.168.2.2 | Ubuntu 20.04 |


## 服务器配置

在搭建跨云的 `k3s` 集群前，需要先把 `WireGuard` 安装好，
分别在`k3s-master`和`k3s-node-1`执行如下步骤：

 ### 开启 IP 地址转发

```shell
echo "net.ipv4.ip_forward = 1" >> /etc/sysctl.conf

echo "net.ipv4.conf.all.proxy_arp = 1" >> /etc/sysctl.conf

sysctl -p /etc/sysctl.conf
```
---

 ### 修改主机名称

```shell
# 腾讯云执行
hostnamectl  set-hostname k3s-master
# 阿里云执行
hostnamectl  set-hostname k3s-node-1
```

---
 ### 修改 iptables 以允许NAT

```auto
iptables -A INPUT -m conntrack --ctstate RELATED,ESTABLISHED -j ACCEPT
iptables -A FORWARD -m conntrack --ctstate RELATED,ESTABLISHED -j ACCEPT
iptables -A FORWARD -i wg0 -o wg0 -m conntrack --ctstate NEW -j ACCEPT
iptables -t nat -A POSTROUTING -s 192.168.1.1/24 -o eth0 -j MASQUERADE
```
`wg0`: 为虚拟网卡名称,两台服务器可以都叫`wg0`

`192.168.1.1/24`: 为虚拟 IP 地址段(192.168.1.1~192.168.1.254)

 `eth0`: 为服务器的物理网卡

---
 ### 安装WireGuard(ubuntu)

```shell
apt-get update
apt-get install wireguard -y
```

---
 ### 配置 WireGuard

`wireguard` 包提供了我们所需的工具 `wg` 和 `wg-quick`，可以使用它们来分别完成手动部署和自动部署。
先按照[官方文档](https://www.wireguard.com/quickstart/)描述的形式，生成`k3s-master`节点和`k3s-node-1`节点服务器 用于加密解密的密钥

 #### k3s-master节点操作

```shell
wg genkey | tee privatekey | wg pubkey > publickey
```

然后在当前目录下就生成了 `privatekey` 和 `publickey` 两个文件

```auto
cat privatekey publickey
EMWcI01iqM4zkb7xfbaaxxxxxxxxDo2GJUA=
0ay8WfGOIHndWklSIVBqrsp5LDWxxxxxxxxxxxxxxQ=
```

然后编写配置文件，以供 `wg-quick` 使用

```shell
vim /etc/wireguard/wg0.conf
```

然后写入如下内容

```auto
[Interface]
PrivateKey = EMWcI01iqM4zkb7xfbaaxxxxxxxxDo2GJUA=
Address = 192.168.2.1
ListenPort = 51820

[Peer]
PublicKey = k3s-node-1服务器的 publickey
EndPoint = 139.xx.xx.46:51820
AllowedIPs = 192.168.2.2/32
```

 #### k3s-node-1节点操作

```shell
wg genkey | tee privatekey | wg pubkey > publickey
```
然后在当前目录下就生成了 `privatekey` 和 `publickey` 两个文件

```shell
cat privatekey publickey
QGl72V7FyFokmF15cPGLcLWkOOBV+CHw6KWL+MtUj2o=
b/yQJHLEo1NisJcE3eBewjX+wFBDROQ3njGRQhZpADQ=
```

然后编写配置文件，以供 `wg-quick` 使用

```shell
vim /etc/wireguard/wg0.conf
```

然后写入如下内容

```auto
[Interface]
PrivateKey = QGl72V7FyFokmF15cPGLcLWkOOBV+CHw6KWL+MtUj2o=
Address = 192.168.2.2
ListenPort = 51820

[Peer]
PublicKey = k3s-master服务器的 publickey
EndPoint = 42.xxx.xxx.60:51820
AllowedIPs = 192.168.2.1/32
```

---
 ### 配置说明

`Interface`: 小节是属于本机的配置.

`Address`: 是分配给本机在简介部分约定的虚拟 IP

`ListenPort`: 是主机之间通讯使用的端口，是 UDP 协议的。

`Peer`: 是属于需要通信的服务器的信息，有多少需要通信的主机，就添加多少个 Peer 小节，更多内容参阅WireGuard官网配置。

`EndPoint`: 由于这里是跨厂商所以这里的EndPoint为服务器的公网 IP 与 WireGuard 监听的 UDP 端口，如果你的机器通过内网也能通信，直接用内网 IP 也可以，当然要注意这个 IP 需要所有加入该局域网的主机都能通信才行。

`AllowedIPs`: 是指本机发起连接的哪些 IP 应该将流量转发到这个节点，比如给主机 B 分配了内网 IP 192.168.1.2，那么在主机 A 上发送到 192.168.1.2 的数据包，都应该转发到这个 EndPoint 上，它其实起的是一个过滤作用。而且多个 Peer 时，这里配置的 IP 地址不能有冲突。

- 节点配置文件如下:

 #### k3s-master 节点

  `cat /etc/wireguard/wg0.conf`

  ```auto
  [Interface]
  PrivateKey = EMWcI01iqM4zkb7xfbaaxxxxxxxxDo2GJUA=
  Address = 192.168.2.1
  ListenPort = 51820

  [Peer]
  PublicKey = b/yQJHLEo1NisJcE3eBewjX+wFBDROQ3njGRQhZpADQ=
  EndPoint = 139.xx.xx.46:51820
  AllowedIPs = 192.168.2.2/32
  ```

 #### k3s-node-1节点

  `cat /etc/wireguard/wg0.conf`

  ```auto
  [Interface]
  PrivateKey = QGl72V7FyFokmF15cPGLcLWkOOBV+CHw6KWL+MtUj2o=
  Address = 192.168.2.2
  ListenPort = 51820

  [Peer]
  PublicKey = 0ay8WfGOIHndWklSIVBqrsp5LDWxxxxxxxxxxxxxxQ=
  EndPoint = 42.xxx.xxx.60:51820
  AllowedIPs = 192.168.2.1/32
  ```

---
 ### 开放端口

在两台服务器上防火墙（安全组）入口方向都需要开放 `51820` 端口，协议为UDP（`千万别选成TCP`），这是 `WireGuard` 默认的端口，如果你想修改，可以在配置文件中修改，但是需要注意，如果你修改了端口，那么在后面的配置中，也需要修改对应的端口。

---
 ### 启动 WireGuard

写好配置文件后，对所有节点执行 `wg-quick` 工具来创建虚拟网卡

```shell
wg-quick up wg0
```

上面命令中的 `wg0` 对应的是 `/etc/wireguard/wg0.conf` 这个配置文件，其自动创建的网卡设备，名字就是 `wg0`。

---
 ### 测试 WireGuard

在 k3s-master 节点ping k3s-node-1的虚拟ip要能 ping 通否则请检查配置是否正确

```shell
[root@k3s-master ~]# ping 192.168.2.2
PING 192.168.2.2 (192.168.2.2) 56(84) bytes of data.
64 bytes from 192.168.2.2: icmp_seq=1 ttl=50 time=48.8 ms
64 bytes from 192.168.2.2: icmp_seq=2 ttl=50 time=45.1 ms
^C
--- 192.168.2.2 ping statistics ---
2 packets transmitted, 2 received, 0% packet loss, time 1000ms
rtt min/avg/max/mdev = 45.119/47.008/48.897/1.889 ms
```

在k3s-node-1上ping k3s-master亦如是，然后就可以使用 `wg` 命令来查看通信情况

```auto
[root@k3s-master ~]# wg
interface: wg0
  public key: 0ay8WfGOIHndWklSIVBqrsp5LDWxxxxxxxxxxxxxxQ=
  private key: (hidden)
  listening port: 51820

peer: 0f0dn60+tBUfYgzw7rIihKbqxxxxxxxxa6Wo=
  endpoint: 122.xx.xx.155:51820
  allowed ips: 192.168.2.2/32
  latest handshake: 3 minutes, 3 seconds ago
  transfer: 35.40 KiB received, 47.46 KiB sent
```
---
 ### WireGuard自启动

系统重启后，`WireGuard` 创建的网卡设备就会丢失，`WireGuard`提供了自动化的脚本来解决这件事，在两台服务器都执行如下操作

```shell
systemctl enable wg-quick@wg0
```

使用上述命令生成 systemd 守护脚本，开机会自动运行 up 指令。

---

## 安装 K3S 集群

### k3s-master 节点安装

```shell
export MASTER_EXTERNAL_IP=42.xx.xx.60
export MASTER_VIRTUAL_IP=192.168.2.1
```

安装 K3S

```auto
curl -sfL https://rancher-mirror.rancher.cn/k3s/k3s-install.sh | INSTALL_K3S_MIRROR=cn INSTALL_K3S_VERSION=v1.25.11+k3s1 sh  -s -  --tls-san=$MASTER_EXTERNAL_IP --node-external-ip $MASTER_EXTERNAL_IP --advertise-address $MASTER_EXTERNAL_IP --node-ip $MASTER_VIRTUAL_IP --flannel-iface wg0
```

参数说明：

 `--node-external-ip`: 42.xx.xx.60 设置为当前节点的外部 IP

 `--advertise-address`: 42.xx.xx.12 用于设置 kubectl 工具以及子节点进行通讯使用的地址，可以是 IP，也可以是域名，在创建 apiserver 证书时会将此设置到有效域中。

 `--node-ip`： 192.168.2.1 上文中约定的的虚拟ip

 `--flannel-iface wg0` wg0 是 WireGuard 创建的网卡设备，我需要使用虚拟局域网来进行节点间的通信，所以这里需要指定为 wg0。


由于 WireGuard 的所有流量都是加密传输的，通过它来进行节点间的通信，就已经能够保证通信安全，也就没有必要改用其它的 CNI 驱动，使用默认的就可以了。

在主节点执行上述命令后，一分钟不到就可以看到脚本提示安装完成。通过命令查看下主控端的运行情况

```auto
systemctl status k3s
```

如果运行正常，那么就看看容器的运行状态是否正常

```auto
kubectl get pods -A
```

`-A` 参数用于查看所有命名空间，如果容器都处于 running 状态，那么安装就成功了，接下来要可以添加被控节点。

---
### k3s-node-1 安装

有了上述安装主控的经验，安装 work 节点更加简单，参数需要一定的调整

在k3s-node-1节点 执行

```shell
export MASTER_VIRTUAL_IP=192.168.2.1
export NODE_EXTERNAL_IP=139.xx.xx.46
export NODE_VIRTUAL_IP=192.168.2.2
export K3S_TOKEN=K1031c4c705056a0752a09801e99b56cf0f89571b4d678a138a44deb49a0e1d9722::server:5d89600a5330100489c4c3dbcce1dec0
```

- 将 `K3S_TOKEN` 的值改为在k3s-master节点执行`/var/lib/rancher/k3s/server/node-token`后得到的值
- 将`NODE_EXTERNAL_IP`设置为k3s-node-1的公网ip

安装

```auto
curl -sfL https://rancher-mirror.rancher.cn/k3s/k3s-install.sh | INSTALL_K3S_MIRROR=cn INSTALL_K3S_VERSION=v1.25.11+k3s1 K3S_URL=https://$MASTER_VIRTUAL_IP:6443 K3S_TOKEN=$K3S_TOKEN sh -s - --node-external-ip $NODE_EXTERNAL_IP --node-ip $NODE_VIRTUAL_IP --flannel-iface wg0
```

执行后稍等一会，安装成功后，照例查看服务运行状态

```auto
systemctl status k3s-agent
```

都安装好以后 在 k3s-master 节点检查,可以看到两个节点

```auto
kubectl get nodes -o wide 
```

至此 多云 K3S 集群已经搭建完毕。

---
## 参考文档

\[1\] [cnsre运维博客之搭建 K3S 集群](https://blog.51cto.com/cnsre/4637134)

\[2\] [WireGuard官方文档](https://www.wireguard.com/quickstart/)

\[3\] [Network Address Translation](https://zh.wikipedia.org/wiki/%E7%BD%91%E7%BB%9C%E5%9C%B0%E5%9D%80%E8%BD%AC%E6%8D%A2)

\[4\] [K3S](https://github.com/k3s-io/k3s)

\[5\] [struct-net-device](https://www.kernel.org/doc/htmldocs/networking/API-struct-net-device.html)