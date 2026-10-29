# LINE MINI App API Playground Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将 `liDemo` 改造成一个按能力分组、可运行客户端 API 并安全占位服务端 API 的 LINE MINI App 测试台。

**Architecture:** 采用数据驱动的 API registry，使用通用 `ApiTestCard` 渲染每个测试项。客户端 API 通过独立 runner 调用 `liff.*`，服务端 API 只连接可选的后端适配器，不在浏览器保存 Channel Access Token。

**Tech Stack:** React 19、TypeScript、Vite、`@line/liff` 2.31.2、`@line/liff-common-profile-plugin`、Vitest。

**Spec:** `docs/superpowers/specs/2026-10-29-line-mini-app-api-playground-design.md`

## Global Constraints

- 覆盖 10 个主动 API 和 `purchaseComplete`、`refundComplete` 两个 Webhook 事件。
- 前端不得保存 Channel Access Token 或其他长期服务端凭据。
- 服务消息和 IAP 服务端 API 不得从浏览器直接调用 LINE API。
- 服务消息发送和支付操作默认不自动运行。
- 未满足运行条件时，测试卡片必须禁用运行按钮并显示原因。
- 首期不实现完整后端业务，只定义服务端适配器接口和无适配器提示。
- 参数不写入 `localStorage`；Token、用户资料和订单信息只保存在当前页面内存。

## Review Focus

- 未初始化、非 LINE 客户端和未登录状态：客户端测试不能误调用，测试覆盖 `canRun` 的禁用原因。
- JSON 参数为空、格式错误或类型错误：卡片显示可读错误，不让异常打断整个页面；测试参数解析失败路径。
- 有副作用的服务消息和支付 API：不能自动执行，测试 registry 的 `autoRun: false`。
- Quick-fill 插件未安装或 API 被外部浏览器调用：保留 LINE 错误信息并显示插件/环境提示，测试统一错误归一化。
- 服务端适配器未配置：服务端卡片不可执行且不构造直连 LINE API 请求，测试占位 runner 的安全失败结果。

## File Map

- Create `src/api/types.ts`: API 分组、输入定义、运行条件、结果和 runner 类型。
- Create `src/api/conditions.ts`: 基于 LIFF 状态计算是否可运行及禁用原因。
- Create `src/api/clientRunners.ts`: Common Profile 和 IAP 客户端 API 的 runner。
- Create `src/api/serverRunners.ts`: 服务端适配器接口和安全的未配置占位 runner。
- Create `src/api/registry.ts`: 全部 10 个主动 API 和 2 个事件的定义及官方文档链接。
- Create `src/components/ApiTestCard.tsx`: 通用 API 测试卡片。
- Create `src/components/ApiGroup.tsx`: 分组标题、说明和卡片列表。
- Create `src/components/JsonEditor.tsx`: JSON 参数输入、格式校验和默认值。
- Create `src/components/ResultPanel.tsx`: 成功结果、错误结果和执行耗时展示。
- Modify `src/main.tsx`: 初始化 LIFF，并在 MINI App 模式注册 Common Profile 插件。
- Modify `src/App.tsx`: 读取运行状态，按 registry 分组渲染页面。
- Modify `src/App.css`: 测试台布局、分组、卡片和结果状态样式。
- Modify `package.json`: 添加 Common Profile 插件和测试脚本/依赖。
- Create `src/api/__tests__/registry.test.ts`: registry 完整性和 API 元数据测试。
- Create `src/api/__tests__/conditions.test.ts`: 运行条件测试。
- Create `src/api/__tests__/runners.test.ts`: 参数解析、客户端错误归一化和服务端占位 runner 测试。

### Task 1: 建立测试工具链与 API 类型边界

**Files:**
- Modify: `package.json`
- Create: `src/api/types.ts`
- Create: `src/api/__tests__/registry.test.ts`
- Create: `src/api/__tests__/conditions.test.ts`

**Interfaces:**
- Produces `ApiDefinition`, `ApiGroup`, `ApiRequirement`, `ApiInputDefinition`, `RunContext`, `RunResult` 和 `RunError` 类型。
- `ApiDefinition` 必须包含 `id`, `group`, `name`, `kind`, `docUrl`, `input`, `requirements`, `autoRun`, `runner`。

- [ ] **Step 1: 添加失败测试和测试脚本**

  在 `package.json` 添加 `test` 和 `test:watch` 脚本，并为 registry 完整性测试准备断言：五个分组存在、主动 API 数量为 10、Webhook 事件数量为 2、每个定义具有唯一 `id` 和 HTTPS 文档链接。

- [ ] **Step 2: 运行测试确认失败**

  Run: `npm test -- --run src/api/__tests__/registry.test.ts`

  Expected: FAIL，因为 registry 和类型文件尚不存在。

- [ ] **Step 3: 实现类型文件和测试依赖**

  在 `src/api/types.ts` 定义严格的联合类型；使用 Vitest 作为 TypeScript 测试 runner。不要在类型中引入 React 组件依赖。

- [ ] **Step 4: 运行类型检查和测试**

  Run: `npm test -- --run src/api/__tests__/registry.test.ts`

  Expected: 测试可以加载类型和测试配置，但在 registry 完成前仍只保留明确的待实现失败。

- [ ] **Step 5: Commit**

  ```bash
  git add package.json package-lock.json src/api/types.ts src/api/__tests__
  git commit -m "test: establish api playground test boundaries"
  ```

### Task 2: 实现运行条件、错误归一化和服务端安全占位

**Files:**
- Create: `src/api/conditions.ts`
- Create: `src/api/serverRunners.ts`
- Create: `src/api/__tests__/conditions.test.ts`
- Create: `src/api/__tests__/runners.test.ts`

**Interfaces:**
- `getRunState(requirements: ApiRequirement[], context: RunContext): RunState`
- `normalizeError(error: unknown): RunError`
- `createUnavailableServerRunner(message: string): ApiRunner`

- [ ] **Step 1: 写失败测试**

  覆盖未初始化、非 LINE 客户端、未登录、缺少插件、缺少后端适配器等条件；断言返回 `canRun: false` 和稳定的禁用原因。覆盖 JSON 解析异常转换为 `RunError`，并断言未配置服务端 runner 不发起网络请求。

- [ ] **Step 2: 运行测试确认失败**

  Run: `npm test -- --run src/api/__tests__/conditions.test.ts src/api/__tests__/runners.test.ts`

  Expected: FAIL，因为条件函数和安全占位 runner 尚不存在。

- [ ] **Step 3: 实现条件和错误处理**

  条件计算只读取传入的运行上下文，不直接访问浏览器全局；服务端占位 runner 直接返回结构化配置错误，不构造 LINE API URL。

- [ ] **Step 4: 运行测试确认通过**

  Run: `npm test -- --run src/api/__tests__/conditions.test.ts src/api/__tests__/runners.test.ts`

  Expected: PASS。

- [ ] **Step 5: Commit**

  ```bash
  git add src/api/conditions.ts src/api/serverRunners.ts src/api/__tests__
  git commit -m "feat: add safe api run conditions"
  ```

### Task 3: 注册全部 LINE MINI App API 和客户端 runner

**Files:**
- Create: `src/api/clientRunners.ts`
- Create: `src/api/registry.ts`
- Modify: `src/api/__tests__/registry.test.ts`
- Modify: `src/api/__tests__/runners.test.ts`

**Interfaces:**
- `miniAppApiRegistry: readonly ApiDefinition[]`
- `runClientApi(id: string, payload: unknown, context: RunContext): Promise<RunResult>`
- `getApiDefinition(id: string): ApiDefinition | undefined`

- [ ] **Step 1: 写失败测试**

  断言 registry 包含以下 ID：`service-notification-token`, `send-service-message`, `common-profile-get`, `common-profile-get-dummy`, `common-profile-fill`, `iap-get-platform-products`, `iap-request-consent`, `iap-create-payment`, `iap-reserve-purchase`, `iap-webhook-history`, `purchase-complete-event`, `refund-complete-event`。

  断言 Common Profile 和 IAP Client 的客户端定义绑定 runner，服务消息和 IAP Server 定义标记为 `kind: 'server'`，事件定义标记为 `kind: 'event'`，副作用 API 的 `autoRun` 为 `false`。

- [ ] **Step 2: 运行测试确认失败**

  Run: `npm test -- --run src/api/__tests__/registry.test.ts src/api/__tests__/runners.test.ts`

  Expected: FAIL，因为 registry 和客户端 runner 尚不存在。

- [ ] **Step 3: 实现客户端 runner 和 registry**

  使用传入的 `liff` 实例或可替换依赖，避免测试直接依赖真实 LINE 环境。Common Profile runner 支持 `get`、`getDummy`、`fill`；IAP runner 支持商品查询、条款同意和支付。支付和服务消息定义默认不自动运行。所有定义补齐对应的 LINE Developers 官方文档 URL。

- [ ] **Step 4: 运行测试确认通过**

  Run: `npm test -- --run src/api/__tests__/registry.test.ts src/api/__tests__/runners.test.ts`

  Expected: PASS，并确认主动 API 数量为 10、事件数量为 2。

- [ ] **Step 5: Commit**

  ```bash
  git add src/api/clientRunners.ts src/api/registry.ts src/api/__tests__
  git commit -m "feat: register line mini app api tests"
  ```

### Task 4: 实现通用参数编辑器、结果面板和测试卡片

**Files:**
- Create: `src/components/JsonEditor.tsx`
- Create: `src/components/ResultPanel.tsx`
- Create: `src/components/ApiTestCard.tsx`
- Create: `src/components/ApiGroup.tsx`
- Modify: `src/api/__tests__/runners.test.ts`

**Interfaces:**
- `JsonEditor({ value, onChange, schema, disabled })`
- `ResultPanel({ result, durationMs })`
- `ApiTestCard({ definition, context })`
- `ApiGroup({ group, definitions, context })`

- [ ] **Step 1: 写组件行为测试**

  测试 JSON 格式错误时显示可读错误；测试未满足条件时 Run 按钮 disabled；测试点击 Run 后显示 loading，成功后显示 JSON，失败后显示错误；测试事件定义不显示 Run 按钮。

- [ ] **Step 2: 运行测试确认失败**

  Run: `npm test -- --run src/components`

  Expected: FAIL，因为组件尚不存在。

- [ ] **Step 3: 实现通用组件**

  卡片只依赖 `ApiDefinition` 和 `RunContext`，不在组件中写具体 LINE API 分支。参数根据 `input` 定义渲染；执行期间锁定按钮；副作用 API 显示“手动运行”提示；错误通过 `normalizeError` 展示。

- [ ] **Step 4: 运行测试确认通过**

  Run: `npm test -- --run src/components`

  Expected: PASS。

- [ ] **Step 5: Commit**

  ```bash
  git add src/components src/api/__tests__
  git commit -m "feat: add reusable api test cards"
  ```

### Task 5: 接入 MINI App 初始化和分组页面

**Files:**
- Modify: `src/main.tsx`
- Modify: `src/App.tsx`
- Modify: `src/App.css`
- Modify: `package.json`

**Interfaces:**
- `App` 创建 `RunContext`，按 registry 的 group 顺序渲染 `ApiGroup`。
- `main.tsx` 在 MINI App 模式先注册 `LiffCommonProfilePlugin`，再调用 `liff.init`。

- [ ] **Step 1: 写页面集成测试或静态断言**

  断言页面标题和五个分组标题存在；断言 registry 中的每个主动 API 都能映射到一个卡片；断言初始化失败显示错误而不是渲染可执行状态。

- [ ] **Step 2: 运行测试确认失败**

  Run: `npm test -- --run src/App.test.tsx`

  Expected: FAIL，因为 App 仍是旧的初始化示例。

- [ ] **Step 3: 实现初始化与页面**

  参考 `liff-playground` 的 filter 思路，但当前首期只聚焦 MINI App；从环境变量读取 LIFF ID。初始化状态通过 context 传给卡片；不能在 `useEffect` 依赖缺失的情况下重复初始化。

- [ ] **Step 4: 运行测试和构建**

  Run: `npm test -- --run src/App.test.tsx`

  Expected: PASS。

  Run: `npm run build`

  Expected: TypeScript 检查和 Vite 构建均通过。

- [ ] **Step 5: Commit**

  ```bash
  git add src/main.tsx src/App.tsx src/App.css package.json package-lock.json src/App.test.tsx
  git commit -m "feat: render grouped line mini app playground"
  ```

### Task 6: 完成安全占位提示、文档链接和最终验证

**Files:**
- Modify: `src/api/registry.ts`
- Modify: `src/components/ApiTestCard.tsx`
- Modify: `src/App.css`
- Create: `README.md`

**Interfaces:**
- 服务端卡片显示后端适配器配置说明；事件卡片显示 payload 示例、字段和签名校验说明。
- 所有主动 API 卡片均可打开官方文档链接。

- [ ] **Step 1: 写最终验收测试**

  断言 5 个分组、10 个主动 API、2 个事件、全部官方链接、全部要求标签和副作用 API 的 `autoRun: false`。

- [ ] **Step 2: 运行验收测试**

  Run: `npm test -- --run`

  Expected: 全部测试 PASS。

- [ ] **Step 3: 完善文案和 README**

  记录环境变量、MINI App Endpoint URL、Quick-fill/IAP 权限、后端适配器未配置时的限制和安全注意事项。不要写入真实 Token。

- [ ] **Step 4: 执行最终验证**

  Run: `npm run build`

  Expected: 构建成功。

  Run: `git diff --check`

  Expected: 无空白错误。

- [ ] **Step 5: Commit**

  ```bash
  git add src README.md package.json package-lock.json
  git commit -m "docs: finalize line mini app api playground"
  ```

## Self-Review

- Spec coverage: 分组和 API 注册由 Task 3 覆盖；通用卡片和运行条件由 Task 2/4 覆盖；初始化和页面由 Task 5 覆盖；安全边界和事件说明由 Task 2/6 覆盖；构建与测试由 Task 1/5/6 覆盖。
- Type consistency: `ApiDefinition`、`RunContext`、`ApiRunner` 先在 Task 1 定义，后续 registry、runner 和组件均依赖这些接口。
- Review focus coverage: 五类风险分别在 Task 2、Task 3、Task 4 和 Task 5 的测试步骤中固定。
- Proportion: 计划只定义文件边界、接口、测试断言和验证命令，不预写实现细节。
