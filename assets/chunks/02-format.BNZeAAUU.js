const e=`// 码制 | 零售商品用 EAN / UPC，外箱用 ITF-14，工业标签用 Code 39；定长数字码制的校验位可省略，组件补齐
import type { BarCodeFormat } from "@xihan-ui/headless";
import type { ReactNode } from "react";
import { XhBarCode } from "@xihan-ui/react";

const samples: { format: BarCodeFormat; value: string; name: string }[] = [
  { format: "ean13", value: "400638133393", name: "EAN-13" },
  { format: "ean8", value: "9638507", name: "EAN-8" },
  { format: "upca", value: "03600029145", name: "UPC-A" },
  { format: "upce", value: "0425261", name: "UPC-E" },
  { format: "itf14", value: "1540014128876", name: "ITF-14" },
  { format: "code39", value: "XH-0915", name: "Code 39" },
];

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "end" }}>
      {samples.map(item => (
        <div key={item.format} style={{ display: "grid", gap: "6px", justifyItems: "center" }}>
          <XhBarCode format={item.format} value={item.value} height={48} />
          <span style={{ fontSize: "12px" }}>{item.name}</span>
        </div>
      ))}
    </div>
  );
}
`;export{e as default};
