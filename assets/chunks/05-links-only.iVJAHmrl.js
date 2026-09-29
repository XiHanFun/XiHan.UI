const e=`// 只写流带 | 不写 nodes 时节点按流带里出现的先后推断，名字就是身份，全部用同一个颜色
import type { ReactNode } from "react";
import { XhSankeyChartRoot } from "@xihan-ui/react";

// 节点从流带推断：源与目标写名字即可
const links = [
  { source: "煤炭", target: "发电", value: 420 },
  { source: "天然气", target: "发电", value: 160 },
  { source: "天然气", target: "供热", value: 90 },
  { source: "水电", target: "发电", value: 130 },
  { source: "发电", target: "工业", value: 340 },
  { source: "发电", target: "居民", value: 210 },
  { source: "发电", target: "损耗", value: 160 },
  { source: "供热", target: "居民", value: 70 },
  { source: "供热", target: "损耗", value: 20 },
];

export default function Demo(): ReactNode {
  return (
    <XhSankeyChartRoot
      links={links}
      caption="年度能源流向（万吨标准煤）"
    />
  );
}
`;export{e as default};
