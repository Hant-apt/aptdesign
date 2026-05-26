# 腾讯云轻量服务器部署说明

这个站点是纯静态网站，不需要 Cloudflare Pages 或 Wrangler。上线到腾讯云轻量服务器时，推荐使用 Nginx 托管 `index.html`、`styles.css`、`script.js` 和 `assets/`，并为 `aptdesign.cn` / `www.aptdesign.cn` 配置免费 HTTPS。

## 1. 域名解析

在腾讯云 DNSPod 中添加解析记录：

| 主机记录 | 记录类型 | 记录值 |
| --- | --- | --- |
| `@` | `A` | 轻量服务器公网 IP |
| `www` | `A` | 轻量服务器公网 IP |

解析生效后，用 `ping 你的域名` 或 DNSPod 控制台确认指向服务器公网 IP。

## 2. 服务器安装 Nginx

登录轻量服务器后执行：

```bash
sudo apt update
sudo apt install -y nginx
sudo mkdir -p /var/www/aptdesign
sudo chown -R $USER:$USER /var/www/aptdesign
```

如果服务器是 CentOS / TencentOS，把安装命令换成：

```bash
sudo yum install -y nginx
sudo systemctl enable --now nginx
sudo mkdir -p /var/www/aptdesign
sudo chown -R $USER:$USER /var/www/aptdesign
```

## 3. 配置站点

把 `deploy/tencent-nginx.conf` 复制到服务器：

```bash
sudo cp /path/to/tencent-nginx.conf /etc/nginx/conf.d/aptdesign.conf
```

配置文件已使用 `aptdesign.cn www.aptdesign.cn`，如域名变更再同步修改。

检查并重载 Nginx：

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 4. 发布网站文件

在本机项目目录运行：

```powershell
.\deploy\publish-tencent.ps1 -HostName "服务器公网IP" -UserName "ubuntu"
```

如果使用 SSH 密钥：

```powershell
.\deploy\publish-tencent.ps1 -HostName "服务器公网IP" -UserName "ubuntu" -SshKey "C:\path\to\key.pem"
```

脚本会把当前站点文件复制到服务器的 `/var/www/aptdesign`，然后执行 `nginx -t` 和重载。

## 5. 免费 HTTPS

域名解析完成后，建议在服务器上使用腾讯云 SSL 证书或 Certbot 配置 HTTPS。

Ubuntu 常用方式：

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d 你的域名 -d www.你的域名
```

完成后访问 `https://你的域名` 检查证书和页面是否正常。
