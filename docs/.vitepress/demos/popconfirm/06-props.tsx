// props 写法 | 不写结构时按标准结构铺：触发器、标题、说明与确认文字几个属性写出一个弹出确认；取消钮的文字缺省取语言包
import type { ReactNode } from "react";
import { XhPopconfirmRoot } from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [answer, setAnswer] = useState("还没答复");
  return (
    <>
      <XhPopconfirmRoot
        trigger="删除这条记录"
        title="删除后不可恢复"
        description="这条记录连同它的附件一起清掉。"
        confirmText="删除"
        onConfirm={() => setAnswer("已删除")}
        onCancelPress={() => setAnswer("已取消")}
      />
      <span data-demo-output>{`答复：${answer}`}</span>
    </>
  );
}
