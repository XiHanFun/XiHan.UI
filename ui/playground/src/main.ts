import { createApp } from "vue";
import App from "./App.vue";
import XihanUI from "xihan-ui";
import router from "./router";
import { IconBase, addIcons, listIcons } from "@xihan-ui/icons";
import type { IconTypeCustomized } from "@xihan-ui/icons";

import * as AdiIcons from "@xihan-ui/icons/packs/adi";
import * as BsiIcons from "@xihan-ui/icons/packs/bsi";
import * as BxiIcons from "@xihan-ui/icons/packs/bxi";
import * as CiIcons from "@xihan-ui/icons/packs/cii";
import * as FaIcons from "@xihan-ui/icons/packs/fa";

// 将 FaIcons 转换为 IconTypeCustomized[]
const adiIcons = Object.values(AdiIcons).map(icon => icon as IconTypeCustomized);
const bsiIcons = Object.values(BsiIcons).map(icon => icon as IconTypeCustomized);
const bxiIcons = Object.values(BxiIcons).map(icon => icon as IconTypeCustomized);
const ciIcons = Object.values(CiIcons).map(icon => icon as IconTypeCustomized);
const faIcons = Object.values(FaIcons).map(icon => icon as IconTypeCustomized);
addIcons(...adiIcons, ...bsiIcons, ...bxiIcons, ...ciIcons, ...faIcons);

const app = createApp(App);

app.component("XhIcon", IconBase);

app.use(XihanUI);
app.use(router);
app.mount("#app");
