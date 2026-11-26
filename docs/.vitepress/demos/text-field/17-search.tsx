// 回车搜索与在途 | onValueCommit 在回车时带出当前值，输入法选字的回车不算；loading 让输入框报告 aria-busy、盒里转一枚加载环，输入照常可用
import type { ReactNode } from "react";
import { XhTextFieldRoot } from "@xihan-ui/react";
import { useRef, useState } from "react";

export default function Demo(): ReactNode {
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState("");
  const timer = useRef(0);

  // 模拟一次远程查询：回车即发起，上一轮没落地的先撤掉
  function search(details: { value: string }): void {
    window.clearTimeout(timer.current);
    setLoading(true);
    timer.current = window.setTimeout(() => {
      setLoading(false);
      setSearched(details.value.trim() || "全部成员");
    }, 800);
  }

  return (
    <>
      <XhTextFieldRoot
        label="搜索成员"
        type="search"
        placeholder="输入姓名后按回车"
        clearable
        loading={loading}
        onValueCommit={search}
      />
      <span data-demo-output>{loading ? "查询中…" : searched ? `已查询：${searched}` : "（还没查询）"}</span>
    </>
  );
}
