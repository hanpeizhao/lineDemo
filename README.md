# LINE MINI App API Playground

这是一个用于分组测试 LINE MINI App 专属 API 的 React/Vite playground，界面参考 LINE 官方 `liff-playground`。

## 本地运行

创建 `.env.local`：

```env
VITE_LIFF_ID=你的-LIFF-ID
VITE_MINI_APP=true
VITE_MINI_APP_VERIFIED=false
VITE_IAP_ENABLED=false
VITE_SERVER_ADAPTER=false
```

然后运行：

```bash
npm install
npm run dev
```

LINE MINI App 的 Endpoint URL 必须使用 HTTPS，并且需要在 LINE Developers Console 中配置。未配置 `VITE_LIFF_ID` 时，页面仍可打开，但客户端 API 会保持禁用状态。

## API 分组

- Service Messages
- Common Profile Quick-fill
- In-app Purchase（Client）
- In-app Purchase（Server）
- Webhook Events

服务消息和 IAP 服务端 API 当前通过安全占位 runner 展示。`VITE_SERVER_ADAPTER=true` 只表示前端允许进入服务端适配器状态；实际项目仍需要后端代理，并且 Channel Access Token 不得放入前端环境变量或浏览器存储。

## 验证

```bash
npm test -- --run
npm run build
```
