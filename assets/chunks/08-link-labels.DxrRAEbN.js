const n=`// 连线上的字 | 连线的 label 写在连线中点，描一圈底色压在线上也读得清；和名字压住时不写，数据表里多一列照样读得到
import type { ReactNode } from "react";
import { XhGraphChartRoot } from "@xihan-ui/react";

const people = [
  { id: "li", name: "李明" },
  { id: "wang", name: "王芳" },
  { id: "yu", name: "李小雨" },
  { id: "chen", name: "陈刚" },
  { id: "zhou", name: "周婷" },
];

// 关系名短时才写在线上，长句放进提示框或旁边的表
const relations = [
  { source: "li", target: "wang", label: "夫妻" },
  { source: "li", target: "yu", label: "父女" },
  { source: "wang", target: "yu", label: "母女" },
  { source: "li", target: "chen", label: "同事" },
  { source: "wang", target: "zhou", label: "同学" },
];

export default function Demo(): ReactNode {
  return (
    <XhGraphChartRoot
      nodes={people}
      links={relations}
      caption="一家人和他们的朋友"
    />
  );
}
`;export{n as default};
