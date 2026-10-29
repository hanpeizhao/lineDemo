import { clientRunners } from "./clientRunners";
import type { ApiDefinition, ApiGroup, ApiInput, ApiRequirement } from "./types";

const docs = "https://developers.line.biz/en/reference/liff/";
const initialized: ApiRequirement[] = ["initialized"];
const loggedIn: ApiRequirement[] = ["initialized", "loggedIn"];

function client(
  id: string,
  group: ApiGroup,
  name: string,
  anchor: string,
  description: string,
  input: ApiInput,
  runner: ApiDefinition["runner"],
  requirements: ApiRequirement[] = initialized,
  autoRun = true,
): ApiDefinition {
  return { id, group, name, kind: "client", docUrl: `${docs}#${anchor}`, description, input, requirements, autoRun, runner };
}

export const liffApiRegistry: readonly ApiDefinition[] = [
  { id: "liff-id", group: "liff-properties", name: "liff.id", kind: "property", docUrl: `${docs}#id`, description: "只读的 LIFF App ID 属性。", input: { type: "none" }, requirements: [], autoRun: false },
  { id: "liff-ready", group: "liff-properties", name: "liff.ready", kind: "property", docUrl: `${docs}#ready`, description: "等待 LIFF 首次初始化完成的 Promise 属性。", input: { type: "none" }, requirements: [], autoRun: false },
  { id: "liff-init", group: "liff-initialization", name: "liff.init()", kind: "client", docUrl: `${docs}#initialize-liff-app`, description: "初始化 LIFF App；当前页面已经在启动阶段初始化，重复运行需谨慎。", input: { type: "json", label: "Config", defaultValue: '{\n  "liffId": ""\n}' }, requirements: [], autoRun: false, runner: async (payload, context) => { try { return { ok: true, data: await (context.liff as any).init(JSON.parse(payload)) }; } catch (error) { return { ok: false, error: { message: error instanceof Error ? error.message : String(error), raw: error } }; } } },
  client("liff-get-os", "liff-environment", "liff.getOS()", "get-os", "获取运行 LIFF App 的操作系统。", { type: "none" }, clientRunners.getOs, [], true),
  client("liff-get-app-language", "liff-environment", "liff.getAppLanguage()", "get-app-language", "获取 LINE App 的语言设置。", { type: "none" }, clientRunners.getAppLanguage, [], true),
  client("liff-get-language", "liff-environment", "liff.getLanguage()", "get-language", "获取运行环境语言；官方已标记为 deprecated。", { type: "none" }, clientRunners.getLanguage, [], true),
  client("liff-get-version", "liff-environment", "liff.getVersion()", "get-version", "获取 LIFF SDK 版本。", { type: "none" }, clientRunners.getVersion, [], true),
  client("liff-get-line-version", "liff-environment", "liff.getLineVersion()", "get-line-version", "获取用户的 LINE 版本。", { type: "none" }, clientRunners.getLineVersion, [], true),
  client("liff-get-context", "liff-environment", "liff.getContext()", "get-context", "获取启动 LIFF App 的页面环境和 Scope。", { type: "none" }, clientRunners.getContext),
  client("liff-is-in-client", "liff-environment", "liff.isInClient()", "is-in-client", "判断是否运行在 LIFF 浏览器。", { type: "none" }, clientRunners.isInClient, [], true),
  client("liff-is-logged-in", "liff-auth", "liff.isLoggedIn()", "is-logged-in", "判断当前用户是否已登录。", { type: "none" }, clientRunners.isLoggedIn, [], true),
  client("liff-is-api-available", "liff-environment", "liff.isApiAvailable()", "is-api-available", "检查指定 API 在当前环境和 LINE 版本中是否可用。", { type: "text", label: "API name", defaultValue: "shareTargetPicker" }, clientRunners.isApiAvailable),
  client("liff-login", "liff-auth", "liff.login()", "login", "在外部浏览器中登录 LIFF 用户。", { type: "json", label: "Login config", defaultValue: "{\n  \"redirectUri\": \"\"\n}" }, clientRunners.login, [], false),
  client("liff-logout", "liff-auth", "liff.logout()", "logout", "退出当前 LIFF 用户登录状态。", { type: "none" }, clientRunners.logout, loggedIn, false),
  client("liff-get-access-token", "liff-auth", "liff.getAccessToken()", "get-access-token", "获取当前用户 Access Token。", { type: "none" }, clientRunners.getAccessToken, loggedIn),
  client("liff-get-id-token", "liff-auth", "liff.getIDToken()", "get-id-token", "获取当前用户 ID Token，需要 openid Scope。", { type: "none" }, clientRunners.getIdToken, loggedIn),
  client("liff-get-decoded-id-token", "liff-auth", "liff.getDecodedIDToken()", "get-decoded-id-token", "获取解码后的 ID Token Payload。", { type: "none" }, clientRunners.getDecodedIdToken, loggedIn),
  client("liff-permission-get-granted-all", "liff-auth", "liff.permission.getGrantedAll()", "permission-get-granted-all", "获取用户已同意的全部权限。", { type: "none" }, clientRunners.getGrantedAll, loggedIn),
  client("liff-permission-query", "liff-auth", "liff.permission.query()", "permission-query", "查询指定权限的同意状态。", { type: "text", label: "Permission", defaultValue: "profile" }, clientRunners.permissionQuery, loggedIn),
  client("liff-permission-request-all", "liff-auth", "liff.permission.requestAll()", "permission-request-all", "请求用户同意全部权限。", { type: "json", label: "Options", defaultValue: "{}" }, clientRunners.permissionRequestAll, loggedIn, false),
  client("liff-get-profile", "liff-profile", "liff.getProfile()", "get-profile", "获取当前用户 Profile，需要 profile Scope。", { type: "none" }, clientRunners.getProfile, loggedIn),
  client("liff-get-friendship", "liff-profile", "liff.getFriendship()", "get-friendship", "获取用户与关联 LINE Official Account 的好友状态。", { type: "none" }, clientRunners.getFriendship, loggedIn, false),
  client("liff-request-friendship", "liff-profile", "liff.requestFriendship()", "request-friendship", "请求用户添加关联 LINE Official Account 为好友。", { type: "none" }, clientRunners.requestFriendship, loggedIn, false),
  client("liff-open-window", "liff-window", "liff.openWindow()", "open-window", "在 LINE 内置浏览器或外部浏览器打开 URL。", { type: "json", label: "Options", defaultValue: '{\n  "url": "https://line.me",\n  "external": true\n}' }, clientRunners.openWindow, initialized, false),
  client("liff-close-window", "liff-window", "liff.closeWindow()", "close-window", "关闭 LIFF App 窗口。", { type: "none" }, clientRunners.closeWindow, [], false),
  client("liff-send-messages", "liff-message", "liff.sendMessages()", "send-messages", "代表用户向当前聊天发送消息。", { type: "json", label: "Messages", defaultValue: '[{\n  "type": "text",\n  "text": "Hello, World!"\n}]' }, clientRunners.sendMessages, ["initialized", "inLineClient", "loggedIn"], false),
  client("liff-share-target-picker", "liff-message", "liff.shareTargetPicker()", "share-target-picker", "打开目标选择器分享消息。", { type: "json", label: "Messages and options", defaultValue: '{\n  "messages": [{\n    "type": "text",\n    "text": "Hello, World!"\n  }],\n  "options": {}\n}' }, clientRunners.shareTargetPicker, loggedIn, false),
  client("liff-scan-code-v2", "liff-scan", "liff.scanCodeV2()", "scan-code-v2", "打开 2D Code Reader V2。", { type: "none" }, clientRunners.scanCodeV2, ["initialized", "inLineClient"], false),
  client("liff-scan-code", "liff-scan", "liff.scanCode()", "scan-code", "打开旧版 2D Code Reader；部分环境不支持。", { type: "none" }, clientRunners.scanCode, ["initialized", "inLineClient"], false),
  client("liff-permanent-link-create-url-by", "liff-permanent-link", "liff.permanentLink.createUrlBy()", "permanent-link-create-url-by", "获取指定页面的 LIFF 永久链接。", { type: "text", label: "Current page URL", defaultValue: "" }, clientRunners.permanentLinkCreateUrlBy),
  client("liff-permanent-link-create-url", "liff-permanent-link", "liff.permanentLink.createUrl()", "permanent-link-create-url", "获取当前页面的 LIFF 永久链接；官方提示未来可能 deprecated。", { type: "none" }, clientRunners.permanentLinkCreateUrl, initialized, true),
  client("liff-permanent-link-set-extra-query-param", "liff-permanent-link", "liff.permanentLink.setExtraQueryParam()", "permanent-link-set-extra-query-param", "为当前页面永久链接增加额外 Query 参数。", { type: "text", label: "Query string", defaultValue: "user_tracking_id=8888" }, clientRunners.permanentLinkSetExtraQueryParam, initialized, false),
  { id: "liff-use", group: "liff-plugins", name: "liff.use()", kind: "property", docUrl: `${docs}#use`, description: "注册并初始化 LIFF Plugin；本项目在启动阶段注册 Common Profile Plugin。", input: { type: "none" }, requirements: [], autoRun: false },
  client("liff-i18n-set-lang", "liff-plugins", "liff.i18n.setLang()", "i18n-set-lang", "设置 LIFF SDK UI 的语言。", { type: "text", label: "Language", defaultValue: "en" }, clientRunners.i18nSetLang, [], false),
  client("liff-create-shortcut", "liff-mini-app", "liff.createShortcutOnHomeScreen()", "create-shortcut-on-home-screen", "在设备主屏幕添加 LINE MINI App 快捷方式。", { type: "json", label: "Options", defaultValue: '{\n  "url": ""\n}' }, clientRunners.createShortcutOnHomeScreen, ["initialized", "miniApp", "verifiedMiniApp"], false),
];
