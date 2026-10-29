import type { ApiDefinition, ApiGroup as ApiGroupName, RunContext } from "../api/types";
import ApiTestCard from "./ApiTestCard";

const groupInfo: Record<ApiGroupName, { title: string; description: string }> = {
  "service-messages": { title: "Service Messages", description: "服务通知 Token 和服务消息发送。" },
  "common-profile": { title: "Common Profile Quick-fill", description: "获取和自动填充用户 Common Profile。" },
  "iap-client": { title: "In-app Purchase · Client", description: "在 MINI App 客户端查询商品和发起购买。" },
  "iap-server": { title: "In-app Purchase · Server", description: "服务端预留订单和查询支付 Webhook 历史。" },
  webhook: { title: "Webhook Events", description: "支付完成和退款事件的 Payload 说明。" },
};

type Props = { group: ApiGroupName; definitions: readonly ApiDefinition[]; context: RunContext };
export default function ApiGroup({ group, definitions, context }: Props) {
  const info = groupInfo[group];
  return <section className="api-group"><div className="group-heading"><h2>{info.title}</h2><p>{info.description}</p></div><div className="api-grid">{definitions.map((definition) => <ApiTestCard key={definition.id} definition={definition} context={context} />)}</div></section>;
}
