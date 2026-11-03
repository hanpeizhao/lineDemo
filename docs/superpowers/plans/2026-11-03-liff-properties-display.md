# LIFF Properties Display Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 展示 `liff.id`、`liff.ready`、`liff.use()` 的运行结果，并让 `liff.init()` 默认使用 `VITE_LIFF_ID`。

**Architecture:** 在现有 `liffApiRegistry` 中为三个无副作用的展示项增加 runner；`liff.use()` runner 读取启动阶段已经写入的插件状态，不再次调用 SDK 注册方法。`liff.init()` 继续允许用户编辑 JSON，但初始 `liffId` 由 Vite 环境变量生成。

**Tech Stack:** React 19, TypeScript, Vite, Vitest。

**Spec:** `docs/superpowers/specs/2026-11-03-liff-properties-display-design.md`

## Global Constraints

- `liff.use(new LiffCommonProfilePlugin())` 继续只在 `src/main.tsx` 启动阶段执行。
- `liff.init()` 默认参数使用 `import.meta.env.VITE_LIFF_ID`。
- 未配置 `VITE_LIFF_ID` 时默认值保持空字符串。
- 不新增依赖，不改变现有 API 卡片交互协议。

## Review Focus

- 环境变量缺失：`liff.init()` 默认值仍应是合法 JSON，且 `liffId` 为空字符串。
- `liff.ready` 尚未完成：runner 应等待 Promise，而不是展示 Promise 对象本身。
- `liff.use()` 状态为 false：应展示未注册状态，不执行重复注册。
- 属性 runner 异常：应沿用现有 `ApiTestCard` 的错误处理路径。

### Task 1: Add LIFF property runners and environment-backed init defaults

**Files:**
- Modify: `src/api/liffRegistry.ts`
- Test: `src/api/__tests__/registry.test.ts`

**Interfaces:**
- Consumes: existing `RunContext.liff`, `RunContext.hasCommonProfilePlugin`, and `ApiDefinition.runner`.
- Produces: runners for `liff-id`, `liff-ready`, and `liff-use`; an `liff-init` default JSON whose `liffId` equals `import.meta.env.VITE_LIFF_ID ?? ""`.

- [ ] **Step 1: Write the failing tests**

  Add tests that locate the four registry entries and assert:
  - `liff-init` parses to `{ liffId: import.meta.env.VITE_LIFF_ID ?? "" }`.
  - `liff-id`, `liff-ready`, and `liff-use` each have a runner.
  - invoking the three runners with a context whose `liff.id` is `"test-liff-id"`, whose `liff.ready` resolves to `"ready"`, and whose `hasCommonProfilePlugin` is `true` returns successful data containing those values.
  - invoking `liff-use` with `hasCommonProfilePlugin: false` returns successful data indicating `registered: false` and does not require a `liff.use` call.

- [ ] **Step 2: Run the focused test to verify it fails**

  Run: `npm test -- --run src/api/__tests__/registry.test.ts`

  Expected: FAIL because the property definitions lack runners and `liff-init` still has an empty hardcoded `liffId`.

- [ ] **Step 3: Implement the minimal registry changes**

  In `src/api/liffRegistry.ts`, add small async runners that return `{ ok: true, data: ... }`; read `context.liff.id`, await `context.liff.ready`, and expose `{ registered: context.hasCommonProfilePlugin }` respectively. Set the init default with `JSON.stringify({ liffId: import.meta.env.VITE_LIFF_ID ?? "" }, null, 2)`.

- [ ] **Step 4: Run the focused test to verify it passes**

  Run: `npm test -- --run src/api/__tests__/registry.test.ts`

  Expected: PASS with all registry tests green.

### Task 2: Run full verification

**Files:**
- Verify: `src/api/__tests__/registry.test.ts`, all existing test files, TypeScript/Vite build.

**Interfaces:**
- Consumes: Task 1 registry runners and environment-backed default.
- Produces: verified working test suite and production build.

- [ ] **Step 1: Run the full test suite**

  Run: `npm test -- --run`

  Expected: PASS with zero failed tests.

- [ ] **Step 2: Run the production build**

  Run: `npm run build`

  Expected: exit code 0 with successful TypeScript checking and Vite bundle generation.

- [ ] **Step 3: Check the final diff**

  Run: `git diff --check`

  Expected: no whitespace errors.
