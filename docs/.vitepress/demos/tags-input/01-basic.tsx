// 基础用法 | 只写根组件就按标准结构铺出标题与盒，标签按当前值铺；在框中输入后按 Enter 落下一个标签
import type { ReactNode } from "react";
import { XhTagsInputRoot } from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [tags, setTags] = useState<string[]>(["Vue", "TypeScript"]);
  return (
    <>
      <XhTagsInputRoot value={tags} onValueChange={details => setTags(details.value)} label="技术栈" placeholder="回车落一个" />
      <p data-demo-output>
        当前：
        {tags.length ? tags.join("、") : "（无）"}
      </p>
    </>
  );
}
