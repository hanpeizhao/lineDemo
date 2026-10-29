import type { ApiDefinition, ApiGroup as ApiGroupName, RunContext } from "../api/types";
import ApiTestCard from "./ApiTestCard";

const groupInfo: Record<ApiGroupName, { title: string; description: string }> = {
  "service-messages": { title: "服务消息", description: "服务通知 Token 和服务消息发送。" },
  "common-profile": { title: "Common Profile 自动填充", description: "获取和自动填充用户资料。" },
  "iap-client": { title: "应用内购买 · 客户端", description: "在 MINI App 客户端查询商品和发起购买。" },
  "iap-server": { title: "应用内购买 · 服务端", description: "服务端预留订单和查询支付 Webhook 历史。" },
  webhook: { title: "Webhook 事件", description: "支付完成和退款事件的 Payload 说明。" },
  "liff-properties": { title: "LIFF · SDK 属性", description: "LIFF SDK 的只读属性。" },
  "liff-initialization": { title: "LIFF · 初始化", description: "LIFF 初始化和启动配置。" },
  "liff-environment": { title: "LIFF · 运行环境", description: "运行环境、版本和 API 可用性。" },
  "liff-auth": { title: "LIFF · 登录与权限", description: "登录、Token 和权限管理。" },
  "liff-profile": { title: "LIFF · 用户资料", description: "用户资料和好友关系。" },
  "liff-window": { title: "LIFF · 窗口", description: "窗口打开和关闭。" },
  "liff-message": { title: "LIFF · 消息", description: "发送消息和目标选择器。" },
  "liff-scan": { title: "LIFF · 二维码", description: "二维码扫描 API。" },
  "liff-permanent-link": { title: "LIFF · 永久链接", description: "LIFF 永久链接生成和参数处理。" },
  "liff-plugins": { title: "LIFF · 插件与国际化", description: "插件注册和语言设置。" },
  "liff-mini-app": { title: "LIFF · MINI App 扩展", description: "MINI App 专属扩展能力。" },
};

type Props = { group: ApiGroupName; definitions: readonly ApiDefinition[]; context: RunContext };
export default function ApiGroup({ group, definitions, context }: Props) {
  const info = groupInfo[group];
  return <section className="api-group"><div className="group-heading"><h2>{info.title}</h2><p>{info.description}</p></div><div className="api-grid">{definitions.map((definition) => <ApiTestCard key={definition.id} definition={definition} context={context} />)}</div></section>;
}
