import m = require("mithril");

export class Main implements m.ClassComponent {

    constructor() {}
    public view() {
        return m("H2", `Hello! ${this.appState.status}`);
    }

}

// Be sure to have <div id="content/> in your HTML where we can mount the Mithril

const content = document.getElementById("content") as Element;

m.route(content, "/",
    {
        "/": new Main(appState),
    });
