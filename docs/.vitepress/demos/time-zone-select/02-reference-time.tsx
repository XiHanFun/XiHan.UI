// 参考时刻 | 用排期当天而不是今天计算 DST 偏移
import type { ReactNode } from "react";
import { XhTimeZoneSelect } from "@xihan-ui/react";

const zones = ["America/New_York", "Europe/London", "Asia/Shanghai"];

export default function Demo(): ReactNode {
  return (
    <>
      <XhTimeZoneSelect defaultValue="America/New_York" timeZones={zones} referenceTime={Date.UTC(2026, 0, 15)} translations={{ label: "冬季排期时区" }} />
      <XhTimeZoneSelect defaultValue="America/New_York" timeZones={zones} referenceTime={Date.UTC(2026, 6, 15)} translations={{ label: "夏季排期时区" }} />
    </>
  );
}
