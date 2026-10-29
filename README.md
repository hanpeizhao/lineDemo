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

项目根目录现在使用 `.env` 保存可以提交到 Git 的默认前端配置：

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

当前仓库的 `.env` 只有 `VITE_LIFF_ID`，它是 LIFF App 标识，不是 Channel Access Token 或服务端密钥，可以作为项目默认配置提交到 Git。

| 变量 | 说明 |
| --- | --- |
| `VITE_LIFF_ID` | 必填。用于 `liff.init()` 的 LIFF ID。 |
| `VITE_MINI_APP` | 默认为 MINI App 模式；设为 `false` 可关闭 MINI App 条件。 |
| `VITE_MINI_APP_VERIFIED` | 控制已认证 MINI App 相关条件。 |
| `VITE_IAP_ENABLED` | 控制 IAP 客户端 API 是否进入可运行条件。 |
| `VITE_SERVER_ADAPTER` | 仅表示是否允许进入服务端适配器状态，不会自动提供后端实现。 |

### Vite 如何读取环境变量

项目通过 `import.meta.env` 读取变量，主要使用位置是 [`src/App.tsx`](src/App.tsx) 和 [`src/main.tsx`](src/main.tsx)：

```ts
const liffId = import.meta.env.VITE_LIFF_ID;
```

Vite 会根据运行模式加载以下文件：

| 文件 | 作用 | 是否建议提交 |
| --- | --- | --- |
| `.env` | 所有模式都会加载的默认配置 | 可以，只能包含公开配置 |
| `.env.local` | 所有模式的本地覆盖配置 | 不提交 |
| `.env.development` | `npm run dev` 使用的开发配置 | 视内容决定 |
| `.env.development.local` | 开发模式的本地覆盖配置 | 不提交 |
| `.env.production` | `npm run build` 使用的生产配置 | 视内容决定 |
| `.env.production.local` | 生产构建的本地覆盖配置 | 不提交 |

同一个变量同时存在时，更具体的文件会覆盖通用文件。例如 `.env.local` 会覆盖 `.env`。

当前项目的命令对应关系是：

```text
npm run dev      → development 模式 → 读取开发环境变量
npm run build    → production 模式  → 读取生产环境变量并写入 dist/
npm run preview  → 预览已经构建好的 dist/，不会重新读取并注入变量
```

只有以 `VITE_` 开头的变量才会被暴露给浏览器端代码。由于这些值会在构建时写入前端产物，以下内容绝对不能放进 `.env` 或任何 `VITE_` 变量：

- Channel Access Token
- Client Secret
- 服务端 API 密钥
- 数据库密码
- 其他需要保密的凭证

这些敏感信息必须放在后端服务或 GitHub Actions/部署平台的服务端 Secret 中。

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

### GitHub Actions 自动部署

仓库已包含 [`deploy-pages.yml`](.github/workflows/deploy-pages.yml)。向 `master` 分支 push 后，GitHub Actions 会自动：

1. 安装 Node.js 和 npm 依赖。
2. 执行 `npm ci`。
3. 执行 `npm run build` 生成 `dist/`。
4. 上传 `dist/` 作为 GitHub Pages artifact。
5. 使用 `actions/deploy-pages` 发布到 GitHub Pages。

首次使用时，在仓库 Settings → Pages → Build and deployment → Source 中选择 `GitHub Actions`。

当前 `.env` 已包含公开的 `VITE_LIFF_ID`，因此 workflow 构建时会自动读取它。不要把敏感服务端凭证配置到前端环境变量中。

workflow 使用的权限是：

```yaml
contents: read
pages: write
id-token: write
```

由于这是 GitHub Pages 项目站点，`vite.config.ts` 使用了：

```ts
base: "/lineDemo/"
```

因此默认访问地址是：

```text
https://你的用户名.github.io/lineDemo/
```

如果仓库名称发生变化，需要同步修改 `vite.config.ts` 中的 `base`，并重新部署。

## 注意事项

- `VITE_LIFF_ID` 未配置时，页面仍可打开，但 LIFF 客户端能力无法初始化。
- 浏览器直接访问和 LINE 客户端内访问的 API 支持范围不同。
- `liff.sendMessages()`、扫码等能力通常要求 LINE 客户端环境。
- `liff.getProfile()`、Token、消息分享等能力可能要求登录和相应 Scope。
- IAP、Common Profile 和 Service Message 还受 MINI App 配置、认证状态和后端能力影响。
- `dist/`、`.env.local` 和依赖目录不应提交到 Git。

## 许可证

本项目当前作为内部 API 测试工具使用。LINE API 的使用请遵守 LINE Developers 相关服务条款和官方文档要求。
