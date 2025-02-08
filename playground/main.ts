import { createApp } from "vue";
import XihanUI from "xihan-ui";
import App from "./App.vue";
import "@xihan-ui/themes/src/index.scss";
import "@xihan-ui/components/button/styles/index";
import { iconManager } from "@xihan-ui/themes";

const app = createApp(App);
app.use(XihanUI);
app.use(iconManager);
app.mount("#app");
