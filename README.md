# lineDemo

lineDemo 是一个基于 React、TypeScript 和 Vite 的 LINE API 能力测试台，参考 LINE 官方 `liff-playground` 项目设计，用于集中测试 LINE MINI App APIs 与 LIFF APIs。

页面以中文为主，支持按 Tab 和功能分组查看 API，编辑请求参数、执行客户端 API，并查看结构化返回结果或错误信息。

## 功能概览

- `LINE MINI App APIs` 与 `LIFF APIs` 双 Tab 切换。
- 按功能分组展示 API：登录、权限、用户资料、消息、二维码、IAP、Common Profile 等。
- 数据驱动的 API registry，统一维护 API 名称、文档链接、参数示例、运行条件和 runner。
- 支持 JSON 参数编辑和结果展示。
- 支持 LIFF SDK 初始化状态、登录状态、LINE 客户端环境和 MINI App 条件提示。
- API 前置条件不满足时仍可点击运行，错误会显示在结果区，不会调用真实 runner。
- 对官方支持的 LIFF 能力执行 `liff.isApiAvailable()` 检查；不支持时显示错误，但不禁用运行按钮。
- 移动端响应式布局：窄屏下使用单列卡片、可横向滚动的 Tab 和满宽操作按钮。

## API 覆盖范围

当前 registry 包含：

- 42 个可调用 API，包括 LINE MINI App、LIFF 客户端和服务端 API。
- 3 个只读或启动阶段 API 属性/项目项。
- 2 个 Webhook 事件示例。

主要分组如下：

### LINE MINI App APIs

- Service Messages
- Common Profile
- In-App Purchase · Client
- In-App Purchase · Server
- Webhook Events

### LIFF APIs

- SDK Properties
- Initialization
- Environment
- Login & Permissions
- User Profile
- Window
- Message
- QR Code
- Permanent Link
- Plugin & i18n
- MINI App Extensions

完整 API 定义位于 [`src/api/registry.ts`](src/api/registry.ts) 和 [`src/api/liffRegistry.ts`](src/api/liffRegistry.ts)。

## 技术栈

- React 19
- TypeScript
- Vite
- Vitest
- Testing Library
- `@line/liff` 2.31.2
- `@line/liff-common-profile-plugin`

## 环境要求

- Node.js：建议使用当前项目支持的 LTS 版本。
- npm：项目包含 `package-lock.json`，安装依赖时建议使用 npm。
- 一个已在 LINE Developers Console 中创建的 LIFF 或 LINE MINI App 配置。

## 环境变量

在项目根目录创建 `.env.local`：

```env
# LIFF 或 LINE MINI App 的 LIFF ID
VITE_LIFF_ID=你的-LIFF-ID

# 是否按 MINI App 模式运行
VITE_MINI_APP=true

# 当前 MINI App 是否已认证
VITE_MINI_APP_VERIFIED=false

# 是否启用 IAP 客户端能力
VITE_IAP_ENABLED=false

# 是否配置了服务端适配器
VITE_SERVER_ADAPTER=false
```

| 变量 | 说明 |
| --- | --- |
| `VITE_LIFF_ID` | 必填。用于 `liff.init()` 的 LIFF ID。 |
| `VITE_MINI_APP` | 默认为 MINI App 模式；设为 `false` 可关闭 MINI App 条件。 |
| `VITE_MINI_APP_VERIFIED` | 控制已认证 MINI App 相关条件。 |
| `VITE_IAP_ENABLED` | 控制 IAP 客户端 API 是否进入可运行条件。 |
| `VITE_SERVER_ADAPTER` | 仅表示是否允许进入服务端适配器状态，不会自动提供后端实现。 |

不要把 Channel Access Token、服务端密钥或其他敏感凭证放入 `VITE_` 环境变量。Vite 会在构建时把 `VITE_` 变量写入前端产物，服务端 API 应通过后端代理实现。

## 本地开发

安装依赖：

```bash
npm install
```

启动开发服务器：

```bash
npm run dev
```

### 使用 `npm install` 还是 `npm ci`

- 本地首次开发或修改依赖：使用 `npm install`。
- CI、GitHub Actions 和部署环境：使用 `npm ci`，它会严格按照 `package-lock.json` 安装依赖。

## 测试与构建

```bash
# 运行完整测试
npm test -- --run

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

构建产物输出到 `dist/` 目录。

## LIFF / MINI App 配置

LINE 平台要求 LIFF 或 MINI App 的 Endpoint URL 使用 HTTPS。部署完成后，需要在 LINE Developers Console 对应应用配置中设置：

```text
Endpoint URL = 部署后的 HTTPS 地址
```

参考官方文档：

- [LIFF API Reference](https://developers.line.biz/en/reference/liff/)
- [LINE MINI App API Reference](https://developers.line.biz/en/reference/line-mini-app/)
- [Adding a LIFF app to your channel](https://developers.line.biz/en/docs/liff/registering-liff-apps/)

## API 运行规则

### 前置条件

API 定义中的 `requirements` 用于提示运行条件，例如：

- `initialized`：LIFF 已完成初始化。
- `inLineClient`：当前在 LINE 客户端内运行。
- `loggedIn`：用户已登录。
- `miniApp`：当前为 LINE MINI App 环境。
- `verifiedMiniApp`：当前 MINI App 已认证。
- `iapEnabled`：已开启 IAP 能力。
- `serverAdapter`：已配置服务端适配器。

这些条件由 [`src/api/conditions.ts`](src/api/conditions.ts) 统一计算。条件不满足时，卡片会显示提示，用户仍然可以点击运行；点击后会在结果区显示 `REQUIREMENT_NOT_MET`，并跳过真实 API runner。

### `liff.isApiAvailable()`

`liff.isApiAvailable()` 不是任意 LIFF 方法的通用检测器，只能用于官方支持的能力名称。当前项目仅对以下能力配置检测：

| API | 检查名 |
| --- | --- |
| `liff.shareTargetPicker()` | `shareTargetPicker` |
| `liff.scanCodeV2()` | `scanCodeV2` |
| `liff.scanCode()` | `scanCode` |
| `liff.createShortcutOnHomeScreen()` | `addToHomeV2` |

其他 API，例如 `liff.getAppLanguage()`、`liff.getProfile()` 和 `liff.iap.*`，会直接调用自身，由 API 返回实际结果或错误。

### 服务端 API

Service Messages 和 IAP Server API 需要后端服务代理。当前项目中的 server runner 是安全占位实现，用于展示参数、条件和错误提示，不会把 Channel Access Token 放到浏览器中，也不会直接请求 LINE Server API。

## 项目结构

```text
src/
├── api/
│   ├── registry.ts          # 合并 MINI App 与 LIFF API registry
│   ├── liffRegistry.ts      # LIFF API 定义
│   ├── clientRunners.ts     # LIFF/客户端 API runner
│   ├── serverRunners.ts     # 服务端占位 runner
│   ├── conditions.ts        # API 前置条件计算
│   ├── groups.ts             # Tab 与分组关系
│   └── types.ts              # API 类型定义
├── components/
│   ├── ApiGroup.tsx          # API 分组
│   ├── ApiTestCard.tsx       # API 测试卡片
│   ├── JsonEditor.tsx        # JSON 参数编辑器
│   └── ResultPanel.tsx       # 结果面板
├── App.tsx                   # 页面入口和 LIFF 初始化
└── App.css                   # 页面与移动端响应式样式
```

## GitHub Pages 部署

lineDemo 是纯前端静态项目，可以使用 GitHub Pages 部署，不需要 Netlify 或独立后端来托管页面。

### 构建

```bash
npm ci
npm run build
```

将 `dist/` 目录发布到 GitHub Pages。

### 项目站点路径

如果使用项目站点，例如：

```text
https://你的用户名.github.io/lineDemo/
```

需要在 `vite.config.ts` 配置：

```ts
export default defineConfig({
  base: "/lineDemo/",
  plugins: [react()],
});
```

如果使用用户站点根域名或自定义域名，`base` 通常使用 `/`。

### GitHub Actions

当前仓库尚未包含 GitHub Pages workflow。建议使用 GitHub Pages Actions：

1. 在仓库 Settings → Pages 中将 Source 设置为 GitHub Actions。
2. 添加 workflow，在默认分支 push 时执行 `npm ci` 和 `npm run build`。
3. 上传 `dist/` 作为 Pages artifact。
4. 使用 `actions/deploy-pages` 发布。

部署时需要注入 `VITE_LIFF_ID` 等构建变量。不要把敏感服务端凭证配置到前端构建变量中。

## 注意事项

- `VITE_LIFF_ID` 未配置时，页面仍可打开，但 LIFF 客户端能力无法初始化。
- 浏览器直接访问和 LINE 客户端内访问的 API 支持范围不同。
- `liff.sendMessages()`、扫码等能力通常要求 LINE 客户端环境。
- `liff.getProfile()`、Token、消息分享等能力可能要求登录和相应 Scope。
- IAP、Common Profile 和 Service Message 还受 MINI App 配置、认证状态和后端能力影响。
- `dist/`、`.env.local` 和依赖目录不应提交到 Git。

## 许可证

本项目当前作为内部 API 测试工具使用。LINE API 的使用请遵守 LINE Developers 相关服务条款和官方文档要求。
