var e=`// 流图 | 折线堆叠写 stackOffset: 'wiggle'：各层以中线上下铺开、整体摆动最小，读的是每层的宽窄与起落
import type { ReactNode } from "react";
import { XhCartesianChartRoot } from "@xihan-ui/react";

const sales = [
  { week: 1, books: 12, games: 4, music: 8, video: 3 },
  { week: 2, books: 14, games: 6, music: 7, video: 4 },
  { week: 3, books: 13, games: 9, music: 7, video: 6 },
  { week: 4, books: 11, games: 14, music: 6, video: 9 },
  { week: 5, books: 10, games: 18, music: 6, video: 12 },
  { week: 6, books: 9, games: 15, music: 8, video: 16 },
  { week: 7, books: 10, games: 11, music: 11, video: 18 },
  { week: 8, books: 12, games: 8, music: 14, video: 15 },
  { week: 9, books: 15, games: 6, music: 16, video: 11 },
  { week: 10, books: 17, games: 5, music: 13, video: 8 },
];

// 同一个 stack 的折线写 wiggle：流图
const series = [
  { mark: "line", x: "week", y: "books", name: "图书", area: true, curve: "monotone", symbols: "none", stack: "all", stackOffset: "wiggle" },
  { mark: "line", x: "week", y: "games", name: "游戏", area: true, curve: "monotone", symbols: "none", stack: "all", stackOffset: "wiggle" },
  { mark: "line", x: "week", y: "music", name: "音乐", area: true, curve: "monotone", symbols: "none", stack: "all", stackOffset: "wiggle" },
  { mark: "line", x: "week", y: "video", name: "影视", area: true, curve: "monotone", symbols: "none", stack: "all", stackOffset: "wiggle" },
] as const;

export default function Demo(): ReactNode {
  return (
    <XhCartesianChartRoot
      data={sales}
      series={series}
      caption="各品类的周销量走势"
    />
  );
}
`;export{e as default};