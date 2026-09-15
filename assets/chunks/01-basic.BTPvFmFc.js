const e=`// 基础用法 | 一排可摘标签，每一枚都是库里的 tag：整组只占一个 Tab 位，方向键走标签，Delete 或 Backspace 摘掉，那颗叉就是 tag 的 close-trigger
import type { ReactNode } from "react";
import { XhTagGroupRoot } from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [tags, setTags] = useState([
    { value: "vue", label: "Vue" },
    { value: "react", label: "React" },
    { value: "svelte", label: "Svelte" },
    { value: "angular", label: "Angular" },
  ]);

  // 条目的去留归宿主：组件只报「用户要摘这一枚」
  function remove({ value }: { value: string }): void {
    setTags(list => list.filter(tag => tag.value !== value));
  }

  return (
    <>
      <XhTagGroupRoot
        collection={tags}
        label="技术栈"
        deletable
        onItemDelete={remove}
      />
      <p>{\`还剩：\${tags.length ? tags.map(tag => tag.label).join("、") : "（空）"}\`}</p>
    </>
  );
}
`;export{e as default};
