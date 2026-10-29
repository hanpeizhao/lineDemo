# LINE MINI App API 分组测试台设计

## 目标

将当前最小化的 `liDemo` 改造成一个面向 LINE MINI App 的 API 测试台，参考 `liff-playground` 的交互方式，把官方 LINE MINI App API 按能力分组展示。每个测试项都应能够展示 API 名称、文档入口、参数输入、运行按钮、返回值或错误，并明确说明运行环境和权限要求。

## 背景与现状

- 当前项目只有 `src/App.tsx` 中的 LIFF 初始化状态展示，没有 API 测试组件或分组模型。
- `liff-playground` 使用通用 `Snippet` 组件封装 API 测试卡片，并在 `main.tsx` 中初始化 LIFF、注入插件和区分运行环境。
- LINE MINI App 专属文档包含服务消息、Common Profile Quick-fill、IAP 客户端、IAP 服务端和 IAP Webhook 事件。
- 浏览器端可以直接运行 LIFF/MINI App 客户端 API；Channel Access Token、服务通知发送和 IAP 服务端 API 不能放在前端直接调用。

## 目标范围

### 首期目标

实现一个数据驱动的前端测试台，覆盖以下 10 个主动 API：

1. `POST /message/v3/notifier/token`
2. `POST /message/v3/notifier/send?target=service`
3. `liff.$commonProfile.get(scopes, options)`
4. `liff.$commonProfile.getDummy(scopes, options, caseId)`
5. `liff.$commonProfile.fill(profile)`
6. `liff.iap.getPlatformProducts({ productIds })`
7. `liff.iap.requestConsentAgreement()`
8. `liff.iap.createPayment({ productId, orderId })`
9. `POST /iap/v1/product/reserve`
10. `GET /iap/v1/webhook/events`

同时展示两个 Webhook 事件说明：`purchaseComplete` 和 `refundComplete`。Webhook 不是由前端主动执行的 API，而是服务端接收和校验的事件。

### 非目标

- 不在前端保存 Channel Access Token、LIFF Access Token 以外的长期密钥或服务端凭据。
- 不把服务消息和 IAP 服务端请求伪装成浏览器直连 LINE API。
- 不在首期实现完整的订单、商品、用户和通知业务系统。
- 不替代 LINE Developers Console 的权限申请、商品配置和 Webhook URL 配置。
- 不把通用 LIFF API 全量复制进来；本项目聚焦 LINE MINI App 专属 API。

## 方案比较

### 方案 A：单个 `App.tsx` 直接编写测试项

实现最快，但每个 API 都会重复参数输入、执行、错误和结果处理逻辑，不适合持续增加测试项。

### 方案 B：数据驱动的 API 注册表与通用测试卡片（采用）

使用 API 定义对象描述分类、名称、文档链接、参数、运行条件和执行器；页面按分类渲染通用测试卡片。客户端 API 可以直接绑定 `liff` 方法，服务端 API 通过后端适配器绑定。该方案最贴合 `liff-playground` 的 `Snippet` 模式，同时避免把所有逻辑堆积在 `App.tsx`。

### 方案 C：前端和服务端完全拆成两个独立项目

安全边界清晰，但首期需要额外的后端项目、部署和配置管理，超出当前测试台的必要范围。因此首期只定义服务端适配接口，不强制引入独立后端工程。

## 页面结构

页面从上到下分为：

1. **运行环境栏**：LIFF/MINI App 初始化状态、LIFF ID、是否在 LINE 客户端、登录状态和当前运行环境。
2. **权限提示区**：统一说明未登录、非 LINE 客户端、未认证 MINI App、未开通 IAP 或未安装插件等限制。
3. **API 分组区**：按下面的顺序展示测试组。
   - Service Messages
   - Common Profile Quick-fill
   - In-app Purchase（Client）
   - In-app Purchase（Server）
   - Webhook Events
4. **测试卡片**：每个卡片显示 API 名称、HTTP/JS 类型、文档按钮、条件标签、参数输入、运行按钮、加载状态、结果和错误。

服务端 API 卡片默认显示“需要后端适配器”，没有配置适配器时禁止运行，并提供配置说明；不能在浏览器中直接拼接并发送 Channel Access Token。

## 前端模块设计

建议的目录结构：

```text
src/
  api/
    types.ts                 # API 分类、参数、结果和运行条件类型
    registry.ts              # 全部 LINE MINI App API 定义
    clientRunners.ts         # liff.* 客户端 API 执行器
    serverRunners.ts         # 后端适配器调用接口
  components/
    ApiGroup.tsx             # 分组标题和说明
    ApiTestCard.tsx          # 通用测试卡片
    JsonEditor.tsx           # JSON 参数编辑器
    ResultPanel.tsx           # 成功、错误、耗时和原始结果
    CapabilityTags.tsx        # 环境与权限标签
  App.tsx                    # 初始化状态和按 registry 渲染
  main.tsx                   # LIFF 初始化与插件注入
```

### API 定义模型

每个 API 使用统一定义，核心字段如下：

```ts
type ApiGroup =
  | 'service-messages'
  | 'common-profile'
  | 'iap-client'
  | 'iap-server'
  | 'webhook'

type ApiDefinition = {
  id: string
  group: ApiGroup
  name: string
  kind: 'client' | 'server' | 'event'
  docUrl: string
  input: InputDefinition
  requirements: Requirement[]
  run: ApiRunner
}
```

`run` 统一返回可序列化结果；异常统一转换为包含 `message`、`code`、`details` 和 `raw` 的错误结果。这样卡片不需要知道具体 API 的异常格式。

### 参数输入

- 无参数 API：不显示编辑器。
- 简单字符串或数字：使用输入框。
- JSON 对象或数组：使用带格式化和校验提示的文本区域。
- 固定枚举：使用下拉框，例如 `status`、Common Profile scopes 和 `caseId`。
- 敏感字段：默认使用密码输入，不回显到持久化状态。

首期不把参数写入 localStorage，避免保存 Token 或用户资料；刷新页面后恢复安全的默认示例值即可。

## 各分组的执行策略

### Service Messages

两个 API 都标记为 `server`。前端只调用后端适配器，例如：

```text
POST /api/line-mini-app/service-notification-token
POST /api/line-mini-app/service-message
```

后端负责注入 Channel Access Token，并将 LINE API 的状态码、响应体和请求 ID 原样以安全形式返回。前端可以使用 `liff.getAccessToken()` 获取用户 Access Token，再把短期 Token传给后端；不能把 Channel Access Token 放到前端环境变量。

### Common Profile Quick-fill

三个 API 标记为 `client`，使用 `@line/liff-common-profile-plugin`。在 MINI App 初始化前调用 `liff.use(new LiffCommonProfilePlugin())`。

- `get`：默认 scopes 使用姓名、邮箱、电话和邮编。
- `getDummy`：默认 `caseId = 1`，允许选择 1 到 10。
- `fill`：先使用上一步的资料结果，再执行填充；同时保留手动 JSON 输入入口。

卡片需要显示“仅 LINE MINI App / 需要 Quick-fill 权限 / 需要正确安装插件”标签。

### IAP Client

三个 API 标记为 `client`，均显示“需要申请 IAP 权限”和“需要登录”。

- `getPlatformProducts`：输入商品 ID 数组。
- `requestConsentAgreement`：无参数，结果显示用户同意或拒绝。
- `createPayment`：输入商品 ID和后端预留订单返回的 `orderId`。

支付卡片默认不自动运行，避免页面加载时触发系统支付流程。

### IAP Server

两个 API 标记为 `server`，通过后端适配器运行：

```text
POST /api/line-mini-app/iap/reserve
GET  /api/line-mini-app/iap/webhook-events
```

前端只收集测试参数；后端负责使用 User Access Token 或 Channel Access Token 调用 LINE API，并返回状态码、`x-line-request-id`、响应体和错误体。

### Webhook Events

两个事件只提供 payload 示例、字段说明和签名校验说明，不提供“RUN”按钮。后续若接入测试后端，可以增加“发送模拟事件到本地 Webhook”功能，但不属于首期目标。

## 运行条件和展示规则

每张卡片根据条件显示标签，并在不满足条件时禁用运行按钮：

- `需要登录`
- `仅 LINE 客户端`
- `仅 MINI App`
- `需要已认证 MINI App`
- `需要 Quick-fill 权限`
- `需要 IAP 权限`
- `需要服务端适配器`
- `不会自动运行`

执行过程显示 loading；重复点击时应避免并发运行同一测试。结果区域至少包含执行时间、成功/失败状态、结构化 JSON 和错误信息。

## 安全与错误处理

- 不在前端代码、Vite 构建产物或浏览器 localStorage 中保存 Channel Access Token。
- Token、用户资料、订单号和支付结果只在当前页面内存中展示。
- 服务端响应应过滤 Authorization、原始 Token 和完整用户敏感资料。
- 将 HTTP 错误、LIFF 错误、JSON 解析错误和环境限制错误统一为用户可读消息，同时保留原始错误用于开发调试。
- 对服务消息发送和支付操作默认关闭自动运行，并在 UI 上明确这是有外部副作用的操作。

## 验收标准

- 页面能按 5 个分组渲染所有 10 个主动 API 和 2 个 Webhook 事件。
- 每个主动 API 都有官方文档链接、参数说明、运行条件和结果展示。
- 客户端 API 的调用逻辑不散落在 `App.tsx`，而是集中在 registry 和 runner 模块。
- 未满足条件时，卡片给出明确原因且不能误触发。
- 服务端 API 没有直连 LINE API 的前端凭据泄漏风险，并能在未配置后端时清楚提示。
- `npm run build` 通过，且至少覆盖 registry 完整性、条件判断、参数解析和错误展示的测试。

## 后续实现边界

设计批准后，下一步先建立 API 类型、registry、通用卡片和客户端 runner，再接入 Quick-fill 插件与服务端适配器占位。服务端真实代理、Webhook 接收和部署配置可以作为第二阶段，避免把密钥管理和前端 UI 同时引入首期改造。
