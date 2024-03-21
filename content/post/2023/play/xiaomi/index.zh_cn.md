+++
title = "homeassistant 小米登录配置"
date = "2023-09-16"
slug = "homeassistant_xiaomi_login"
categories = [
    "homeassistant","小米"
]
image = "https://img.ququ123.top/img/test.jpeg"
+++


[原文链接，转载请注明出处](https://www.ququ123.top/2024/03/ququ-blog)

## 服务器ssh配置
- 打开SSH服务器上的SSH配置文件，在大多数Linux系统上通常是/etc/ssh/sshd_config文件。

- 确保以下配置项没有被注释（行首没有#符号）,配置项允许TCP端口转发。

- `AllowTcpForwarding yes` 

- 保存并关闭SSH配置文件。

- 重新加载SSH服务器配置：systemctl reload sshd
- 或者重启服务器
## 本机配置ssh隧道

- 运行命令 ssh -ND 9999 username@your-remote-server.com 建立带有动态端口转发的SSH连接。
- -N 选项阻止执行远程命令，只打开连接以进行转发。
- -D 9999 选项在本地机器上创建一个“动态”转发端口，将所有流量通过SOCKS v4或v5路由到远程- 服务器。
- 保持终端打开，切换到Firefox。
- 打开Firefox设置，搜索“SOCKS”，点击突出显示的“网络代理”设置按钮。选择“手动代理配置”。在SOCKS主机中输入 localhost，端口输入 9999，选择SOCKS v5。点击“确定”保存设置。

## 检查firefox
- firefox访问https://www.showmyip.com
- 显示IP是否是你的服务器IP，是的话就代表成功了

## firefox 访问
- 在设置好代理的firefox，打开homeassistant主页，正常添加xiaomi Miot Auto组件
- 登录小米帐号，会提示`提示登陆小米账号需要安全验证，[点击这里]继续`
- 提示错误的时候，右键复制“click”的访问链接
- firefox打开复制的访问链接，手机设备通过验证
- 再回到登录xiaomi Miot Auto窗口，点击登录即可
- 多试几次是可以成功的

## 问题
- 如果复制链接登录验证还无效，那就直接打开mi.com，登录帐号，再返回homeassistant主页，正常添加xiaomi Miot Auto组件