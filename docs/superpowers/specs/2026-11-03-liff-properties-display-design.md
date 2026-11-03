# LIFF 属性展示与初始化参数设计

## 意图

让 LIFF API 测试页实际展示 `liff.id`、`liff.ready` 和 `liff.use()` 的结果，并让 `liff.init()` 测试卡片默认使用环境变量中的 `VITE_LIFF_ID`。

## 范围

- 为 `liff.id` 增加只读属性 runner，展示当前 LIFF ID。
- 为 `liff.ready` 增加 runner，等待并展示 LIFF 首次初始化 Promise 的结果。
- 为 `liff.init()` 的默认 JSON 参数读取 `import.meta.env.VITE_LIFF_ID`。
- 为 `liff.use()` 增加状态展示 runner，反映启动阶段是否已注册 Common Profile Plugin。

## 非目标与约束

- 不改变应用启动流程：`liff.use(new LiffCommonProfilePlugin())` 继续只在 `main.tsx` 执行。
- 不在点击 `liff.use()` 卡片时重复注册插件，避免 SDK 状态和插件生命周期产生副作用。
- 未配置 `VITE_LIFF_ID` 时保持空字符串输入，并保留现有初始化错误提示。

## 方案

考虑过直接在 `liff.use()` runner 中再次注册插件，但这会重复执行启动逻辑；本方案采用只读展示 runner，与现有启动职责分离，改动最小且可测试。

## 验收

- 三个属性卡片点击后均有可见 JSON 结果。
- `liff.init()` 卡片默认值包含 `VITE_LIFF_ID`。
- 现有测试和构建通过。
