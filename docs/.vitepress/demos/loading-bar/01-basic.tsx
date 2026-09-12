// 基础用法 | 条子贴在视口顶边（往页面最上方看）；不给 value 就是不确定进度，宽度自行往前爬，loading 翻 false 才冲到头并淡出
import type { ReactNode } from "react";
import {
  XhButton,
  XhLoadingBarRange,
  XhLoadingBarRoot,
  XhLoadingBarTrack,
} from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [loading, setLoading] = useState(false);
  // 只读进度用 value-change 接；写进 value prop 会把它变成确定进度，爬升就停了
  const [value, setValue] = useState(0);

  return (
    <>
      <XhLoadingBarRoot loading={loading} onValueChange={details => setValue(details.value)}>
        <XhLoadingBarTrack>
          <XhLoadingBarRange />
        </XhLoadingBarTrack>
      </XhLoadingBarRoot>

      <XhButton variant="solid" onClick={() => setLoading(true)}>开始加载</XhButton>
      <XhButton variant="outline" onClick={() => setLoading(false)}>结束加载</XhButton>
      <span>{`假进度：${Math.round(value)}%`}</span>
    </>
  );
}
