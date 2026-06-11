# 1元灵感小店

一个纯线上、1 元一次、扫码即付的 AI 灵感小店。
价格低、需求量大、跑得起来。

## 商品（每个 1 元）

| 名称 | 入口 | 简介 |
|------|------|------|
| AI 解梦 | `#product/dream` | 把梦里奇怪的情节交给 AI |
| AI 抽签 | `#product/fortune` | 心里默念一个问题，从 100 支签里抽一支 |
| AI 写诗 | `#product/poem` | 给人 / 事 / 词，写一首小诗 |
| AI 起名 | `#product/name` | 给宝宝、笔名、店名起个好名字 |
| AI 头像配文 | `#product/avatar` | 一段能当签名的人设文案 |
| AI 嘴替 | `#product/roast` | 帮我说一句难听的话 |

## 跑起来

项目是 3 个文件 + 1 张收款码，纯静态：

```
yuan-shop/
├── index.html          入口
├── assets/
│   ├── app.js          28 KB — 路由 / 商品 / 订单 / 后台
│   ├── app.css         8.6 KB
│   └── qrcode.jpg      153 KB — 你的支付宝收款码
```

### 本地

```bash
cd D:\codex\yuan-shop
python -m http.server 8123
# 浏览器开 http://127.0.0.1:8123/yuan-shop/index.html
```

### 公网（飞书妙搭）

```powershell
cd D:\codex\yuan-shop
.\deploy.ps1
```

部署脚本会自动：
1. 创建一个妙搭应用
2. 把整个目录打包成 tar.gz 上传
3. 设置企业全员可访问
4. 打印访问链接

## 路由

| URL | 说明 |
|-----|------|
| `#home` | 商品列表 |
| `#product/<id>` | 下单页（dream / fortune / poem / name / avatar / roast） |
| `#pay/<orderId>` | 扫码支付页（含订单号 + 备注格式） |
| `#order/<orderId>` | 用户查订单页（输入订单号也能查） |
| `#admin` | 商家后台（看单 / 标记已付 / 写交付 / 导出 JSON） |
| `#faq` | 常见问题 |

## 跑通核心流程

1. 用户进首页 → 选一个服务（6 选 1）
2. 写请求 + 留联系方式 → 生成订单号 `Y…`
3. 跳到支付页 → 扫支付宝码付 1 元 → 备注里写「订单号｜服务名」
4. 商家在 `#admin` 看到新订单 → 标记已付 → 在交付框里写结果 → 标记已交付
5. 用户用订单号到 `#order/<id>` 查 → 看到已交付 + 结果

## 数据

- 全部存在浏览器 `localStorage`（key=`yuan_shop_v1`）
- 换电脑 / 换浏览器就看不到旧单
- 商家后台「导出 JSON」可备份

## 单元 / 端到端测试

`C:\Users\heng\AppData\Local\Temp\e2e-shop.js` 跑了一遍 43 个断言全 PASS：

- 6 个 SKU 全部渲染、价格都对
- 下单 → 支付 → 订单查询 → 商家标记 → 交付 全链路 OK
- 输入校验（空请求 / 空联系方式会被拒）
- 演示数据、订单搜索、状态筛选、JSON 导出按钮都齐
- 错误路径（未知商品、未知订单号、未知 FAQ）正常降级

## 限制

- 当前没有真支付回调 — 商家靠「备注里写订单号」人工识别付款
- 用户的订单数据存在他本机 localStorage，清缓存就丢
- 没有真后端，「商家后台」和买家看到的是同一台电脑上的同一份 localStorage

如果以后想升级到多用户、能抢单、能退款的真电商：
- 把 `addOrder` / `getOrder` / `updateOrder` 换成 fetch 到一个云函数
- 加一个 Webhook 接支付宝回调
- 给订单加一个 user_id（用 cookie / 微信 / 支付宝登录拿 open_id）
