// 选择模式 | selection-mode="extended" 是「裸点换一条、Ctrl 与 Shift 才扩选」，与 multiple 档的区别就在裸点
import type { ReactNode } from "react";
import { XhListboxRoot } from "@xihan-ui/react";
import { useState } from "react";

const options = [
  { value: "a", label: "report.pdf" },
  { value: "b", label: "cover.png" },
  { value: "c", label: "notes.md" },
  { value: "d", label: "data.csv" },
];

export default function Demo(): ReactNode {
  const [files, setFiles] = useState<string[]>(["a"]);

  return (
    <>
      <XhListboxRoot
        value={files}
        onValueChange={details => setFiles(details.value)}
        collection={options}
        label="文件（extended）"
        selectionMode="extended"
        style={{ maxInlineSize: "320px" }}
      />
      <p>{`已选：${files.length ? files.join("、") : "（无）"}`}</p>
    </>
  );
}
