import { Application } from "./pixi/app";

let app = new Application();
app.runners.init.run();

document.getElementById("app").appendChild(app.view);