import { createApp } from "vue";
import App from "./App.vue";
import XihanUI from "xihan-ui";
import router from "./router";
import { IconBase, addIcons, listIcons } from "@xihan-ui/icons";
import type { IconTypeCustomized } from "@xihan-ui/icons";

import * as Icons from "@xihan-ui/icons/packs";
const icons = Object.values(Icons).map(icon => icon as IconTypeCustomized);
addIcons(...icons);

import "@xihan-ui/themes";

const app = createApp(App);

app.component("XhIcon", IconBase);

app.use(XihanUI);
app.use(router);
app.mount("#app");
