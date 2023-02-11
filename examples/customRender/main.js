import {
  // getCurrentInstance,
  h,
  createRenderer,
} from "../../lib/guide-mini-vue.esm.js";

const App = {
  setup() {
    return {
      x: 100,
      y: 100,
    };
  },
  render() {
    return h("rect", { x: this.x, y: this.y });
  },
};

// console.log(PIXI, 'pixi')
const game = new PIXI.Application({
  with: 500,
  height: 500,
});

document.body.append(game.view);

const renderer = createRenderer({
  createElement(vnode) {
    let { type } = vnode;
    if (type === "rect") {
      const rect = new PIXI.Graphics();
      rect.beginFill(0xff0000);
      rect.drawRect(0, 0, 100, 100);
      rect.endFill();
      return rect;
    }
  },
  patchProp(el, key, val) {
    el[key] = val;
  },
  insert(el, parent) {
    parent.addChild(el);
  },
});

renderer.creatApp(App).mount(game.stage);
