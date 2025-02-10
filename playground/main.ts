import { createApp } from "vue";
import XihanUI from "xihan-ui";
import App from "./App.vue";
import "@xihan-ui/themes/src/index.scss";
import "@xihan-ui/components/button/styles/index";

const app = createApp(App);
app.use(XihanUI);
app.mount("#app");
