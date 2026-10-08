var e=`// 缩略图条与下载 | 浮层里自己放一排缩略图跳到任一张、一个下载按钮存下当前这张：两者都只读写 index，与翻页同一份状态
import type { ReactNode } from "react";
import { DownloadIcon } from "@xihan-ui/icons";
import {
  XhDownloadTrigger,
  XhIcon,
  XhImageViewerCloseTrigger,
  XhImageViewerContent,
  XhImageViewerCounter,
  XhImageViewerImage,
  XhImageViewerNextTrigger,
  XhImageViewerPrevTrigger,
  XhImageViewerRoot,
  XhImageViewerToolbar,
  XhImageViewerViewport,
  XhImageViewerZoomInTrigger,
  XhImageViewerZoomOutTrigger,
} from "@xihan-ui/react";

// 内联的示例图，省得示例依赖外部资源
const items = [
  { src: "data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2016%209%22%3E%3Crect%20width=%2216%22%20height=%229%22%20fill=%22%23475569%22/%3E%3Cpath%20d=%22M0%209%206%203%2016%209z%22%20fill=%22%2394a3b8%22/%3E%3C/svg%3E", alt: "雪山" },
  { src: "data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2016%209%22%3E%3Crect%20width=%2216%22%20height=%229%22%20fill=%22%237c3aed%22/%3E%3Cpath%20d=%22M0%209%206%203%2016%209z%22%20fill=%22%23c4b5fd%22/%3E%3C/svg%3E", alt: "暮色" },
  { src: "data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2016%209%22%3E%3Crect%20width=%2216%22%20height=%229%22%20fill=%22%23065f46%22/%3E%3Cpath%20d=%22M0%209%206%203%2016%209z%22%20fill=%22%236ee7b7%22/%3E%3C/svg%3E", alt: "森林" },
];

// 下载时才把图片取成 Blob：点哪张下哪张
function blobOf(index: number): () => Promise<Blob> {
  return () => fetch(items[index]!.src).then(response => response.blob());
}

export default function Demo(): ReactNode {
  return (
    <XhImageViewerRoot collection={items}>
      {({ index, setIndex, setOpen }) => (
        <>
          <div style={{ display: "flex", gap: "var(--xh-space-2)" }}>
            {items.map((item, i) => (
              <button
                key={item.src}
                type="button"
                style={{ border: "none", padding: 0, cursor: "zoom-in", background: "none" }}
                onClick={() => {
                  setIndex(i);
                  setOpen(true);
                }}
              >
                <img src={item.src} alt={item.alt} style={{ inlineSize: "120px", aspectRatio: "4/3", objectFit: "cover", borderRadius: "var(--xh-shape-surface)", display: "block" }} />
              </button>
            ))}
          </div>
          <XhImageViewerContent>
            <XhImageViewerViewport>
              <XhImageViewerImage />
            </XhImageViewerViewport>
            <XhImageViewerCounter />
            <XhImageViewerPrevTrigger />
            <XhImageViewerNextTrigger />
            {/* 下载按钮放进一层定位壳：落在左上角，与右上角的关闭钮对称 */}
            <div style={{ position: "absolute", insetBlockStart: "var(--xh-space-6)", insetInlineStart: "var(--xh-space-6)", zIndex: 1 }}>
              <XhDownloadTrigger data={blobOf(index)} fileName={\`\${items[index]!.alt}.svg\`}>
                <XhIcon icon={DownloadIcon} />
                {" "}
                下载
              </XhDownloadTrigger>
            </div>
            <div style={{ position: "absolute", insetBlockEnd: "calc(var(--xh-space-6) * 3)", insetInline: 0, zIndex: 1, display: "flex", justifyContent: "center", gap: "var(--xh-space-2)" }}>
              {items.map((item, i) => (
                <button
                  key={item.src}
                  type="button"
                  aria-label={\`第 \${i + 1} 张：\${item.alt}\`}
                  aria-current={i === index ? "true" : undefined}
                  style={{ border: "none", padding: 0, background: "none", cursor: "pointer", borderRadius: "var(--xh-shape-inset)", outlineOffset: "var(--xh-ring-offset)", outline: i === index ? "var(--xh-ring-width) solid currentColor" : "none", opacity: i === index ? 1 : 0.6 }}
                  onClick={() => setIndex(i)}
                >
                  <img src={item.src} alt="" style={{ inlineSize: "64px", aspectRatio: "4/3", objectFit: "cover", borderRadius: "var(--xh-shape-inset)", display: "block" }} />
                </button>
              ))}
            </div>
            <XhImageViewerToolbar>
              <XhImageViewerZoomOutTrigger />
              <XhImageViewerZoomInTrigger />
            </XhImageViewerToolbar>
            <XhImageViewerCloseTrigger />
          </XhImageViewerContent>
        </>
      )}
    </XhImageViewerRoot>
  );
}
`;export{e as default};