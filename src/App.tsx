import { useEffect, useMemo, useState } from "react";
import liff from "@line/liff";
import ApiGroup from "./components/ApiGroup";
import { miniAppApiRegistry } from "./api/registry";
import type { RunContext } from "./api/types";
import "./App.css";

function App() {
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    let active = true;
    const liffId = import.meta.env.VITE_LIFF_ID;
    if (!liffId) {
      setError("未配置 VITE_LIFF_ID；客户端 API 将保持禁用状态。");
      return () => { active = false; };
    }
    liff.init({ liffId }).then(() => {
      if (!active) return;
      setInitialized(true);
      setIsLoggedIn(liff.isLoggedIn());
    }).catch((reason: unknown) => {
      if (active) setError(reason instanceof Error ? reason.message : String(reason));
    });
    return () => { active = false; };
  }, []);

  const context = useMemo<RunContext>(() => ({
    initialized,
    isInClient: initialized && liff.isInClient(),
    isLoggedIn,
    isMiniApp: import.meta.env.VITE_MINI_APP !== "false",
    isVerifiedMiniApp: import.meta.env.VITE_MINI_APP_VERIFIED === "true",
    hasCommonProfilePlugin: import.meta.env.VITE_MINI_APP !== "false",
    iapEnabled: import.meta.env.VITE_IAP_ENABLED === "true",
    hasServerAdapter: import.meta.env.VITE_SERVER_ADAPTER === "true",
    liff,
  }), [initialized, isLoggedIn]);

  const groups = ["service-messages", "common-profile", "iap-client", "iap-server", "webhook"] as const;

  return (
    <main className="App">
      <header className="hero"><p className="eyebrow">LINE MINI APP</p><h1>API Playground</h1><p>按分组测试 LINE MINI App 专属 API，并查看运行条件与原始响应。</p><div className="runtime-status"><span className={initialized ? "status-ready" : "status-warn"}>{initialized ? "LIFF initialized" : "等待 LIFF 初始化"}</span><span>{isLoggedIn ? "已登录" : "未登录"}</span><span>{context.isInClient ? "LINE 客户端" : "外部浏览器"}</span></div></header>
      {error && <div className="init-error"><strong>初始化提示</strong><span>{error}</span></div>}
      <div className="group-list">{groups.map((group) => <ApiGroup key={group} group={group} definitions={miniAppApiRegistry.filter((api) => api.group === group)} context={context} />)}</div>
    </main>
  );
}

export default App;
