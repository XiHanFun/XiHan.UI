// 一组图共用一个预览层 | 图与图之间不必互相认识：宿主拿着地址数组与当前下标，预览层里只放一份图片实例
import type { CSSProperties, KeyboardEvent, ReactNode } from "react";
import {
  XhButton,
  XhDialogCloseTrigger,
  XhDialogContent,
  XhDialogRoot,
  XhDialogTitle,
  XhImageFallback,
  XhImageImage,
  XhImageRoot,
} from "@xihan-ui/react";
import { useState } from "react";

function tile(bg: string, mark: string): string {
  return `data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%204%203%22%3E%3Crect%20width=%224%22%20height=%223%22%20fill=%22%23${bg}%22/%3E%3Ccircle%20cx=%222%22%20cy=%221.5%22%20r=%220.8%22%20fill=%22%23${mark}%22/%3E%3C/svg%3E`;
}

const shots = [
  { src: tile("1e3a8a", "93c5fd"), title: "海面" },
  { src: tile("065f46", "6ee7b7"), title: "林地" },
  { src: tile("7c2d12", "fdba74"), title: "岩壁" },
];

const thumbStyle = {
  "--xh-image-w": "96px",
  "--xh-image-ratio": "4 / 3",
  "cursor": "zoom-in",
} as CSSProperties;

const largeStyle = {
  "--xh-image-w": "100%",
  "--xh-image-ratio": "4 / 3",
  "--xh-image-fit": "contain",
} as CSSProperties;

export default function Demo(): ReactNode {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  function preview(at: number): void {
    setIndex(at);
    setOpen(true);
  }

  // 翻页就是下标加减，走到头回绕
  function step(delta: number): void {
    setIndex(prev => (prev + delta + shots.length) % shots.length);
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>, at: number): void {
    if (event.key !== "Enter" && event.key !== " ")
      return;
    event.preventDefault();
    preview(at);
  }

  const current = shots[index] ?? shots[0]!;

  return (
    <>
      <div style={{ display: "flex", gap: "8px" }}>
        {shots.map((shot, at) => (
          <XhImageRoot
            key={shot.title}
            src={shot.src}
            alt={shot.title}
            role="button"
            tabIndex={0}
            aria-label={`放大查看 ${shot.title}`}
            style={thumbStyle}
            onClick={() => preview(at)}
            onKeyDown={event => onKeyDown(event, at)}
          >
            <XhImageImage />
            <XhImageFallback>加载中</XhImageFallback>
          </XhImageRoot>
        ))}
      </div>

      <XhDialogRoot
        open={open}
        onOpenChange={details => setOpen(details.open)}
        size="lg"
        translations={{ close: "关闭" }}
      >
        <XhDialogContent>
          <XhDialogTitle>{current.title}</XhDialogTitle>

          {/* 只有一份实例，src 换了机器就重走一遍加载，回退内容照常顶位 */}
          <XhImageRoot src={current.src} alt={current.title} style={largeStyle}>
            <XhImageImage />
            <XhImageFallback>加载中</XhImageFallback>
          </XhImageRoot>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <XhButton size="sm" variant="outline" onClick={() => step(-1)}>上一张</XhButton>
            <span style={{ fontSize: "13px" }}>{`${index + 1} / ${shots.length}`}</span>
            <XhButton size="sm" variant="outline" onClick={() => step(1)}>下一张</XhButton>
          </div>

          <XhDialogCloseTrigger />
        </XhDialogContent>
      </XhDialogRoot>
    </>
  );
}
