var e=`// 格线 | ruled 画外框与格与格之间的横竖线，跨行跨列的格子里不出线；画格线时间距档位不生效
import type { ReactNode } from "react";
import { XhGridItem, XhGridRoot } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhGridRoot cols={4} ruled style={{ inlineSize: "min(640px, 100%)" }}>
      <XhGridItem>申请人</XhGridItem>
      <XhGridItem>王小明</XhGridItem>
      <XhGridItem>部门</XhGridItem>
      <XhGridItem>研发部</XhGridItem>
      <XhGridItem>事由</XhGridItem>
      <XhGridItem span={3}>参加前端技术大会，往返两天</XhGridItem>
      <XhGridItem rowSpan={2}>附件</XhGridItem>
      <XhGridItem span={3}>会议邀请函.pdf</XhGridItem>
      <XhGridItem span={3}>行程单.pdf</XhGridItem>
    </XhGridRoot>
  );
}
`;export{e as default};