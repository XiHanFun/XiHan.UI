const n=`// 八个改尺把手 | 四条边加四个角；min-size 与 max-size 在拖、推、setDimensions 三处同时生效
import type { FloatingPanelResizeEdge } from "@xihan-ui/headless";
import type { ReactNode } from "react";
import {
  XhFloatingPanelBody,
  XhFloatingPanelCloseTrigger,
  XhFloatingPanelContent,
  XhFloatingPanelDragTrigger,
  XhFloatingPanelHeader,
  XhFloatingPanelPositioner,
  XhFloatingPanelResizeTrigger,
  XhFloatingPanelRoot,
  XhFloatingPanelTitle,
  XhFloatingPanelTrigger,
} from "@xihan-ui/react";

// 边先角后：角上的把手要盖在两条边的交叠处
const edges: FloatingPanelResizeEdge[] = [
  "n",
  "e",
  "s",
  "w",
  "ne",
  "se",
  "sw",
  "nw",
];

export default function Demo(): ReactNode {
  return (
    <XhFloatingPanelRoot
      defaultPosition={{ x: 240, y: 220 }}
      defaultDimensions={{ width: 320, height: 200 }}
      minSize={{ width: 240, height: 160 }}
      maxSize={{ width: 520, height: 420 }}
    >
      <XhFloatingPanelTrigger>打开面板</XhFloatingPanelTrigger>
      <XhFloatingPanelPositioner>
        <XhFloatingPanelContent>
          <XhFloatingPanelHeader>
            <XhFloatingPanelTitle>图层属性</XhFloatingPanelTitle>
            <XhFloatingPanelDragTrigger />
            <XhFloatingPanelCloseTrigger />
          </XhFloatingPanelHeader>
          <XhFloatingPanelBody>
            <p style={{ margin: 0 }}>
              往任一边拖到底就停在 240×160；把手聚焦后方向键推 10px、Shift 推
              50px。
            </p>
          </XhFloatingPanelBody>
          {edges.map(edge => (
            <XhFloatingPanelResizeTrigger key={edge} edge={edge} />
          ))}
        </XhFloatingPanelContent>
      </XhFloatingPanelPositioner>
    </XhFloatingPanelRoot>
  );
}
`;export{n as default};
