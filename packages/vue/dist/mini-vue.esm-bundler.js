const toDisplayString = (val) => {
    return String(val);
};

var ShapeFlags;
(function (ShapeFlags) {
    ShapeFlags[ShapeFlags["ELEMENT"] = 1] = "ELEMENT";
    ShapeFlags[ShapeFlags["STATEFUL_COMPONENT"] = 2] = "STATEFUL_COMPONENT";
    ShapeFlags[ShapeFlags["TEXT_CHILDREN"] = 4] = "TEXT_CHILDREN";
    ShapeFlags[ShapeFlags["ARRAY_CHILDREN"] = 8] = "ARRAY_CHILDREN";
    ShapeFlags[ShapeFlags["SLOT_CHILDREN"] = 16] = "SLOT_CHILDREN";
})(ShapeFlags || (ShapeFlags = {}));

function getSequence(arr) {
    const p = arr.slice();
    const result = [0];
    let i, j, u, v, c;
    const len = arr.length;
    for (i = 0; i < len; i++) {
        const arrI = arr[i];
        if (arrI !== 0) {
            j = result[result.length - 1];
            if (arr[j] < arrI) {
                p[i] = j;
                result.push(i);
                continue;
            }
            u = 0;
            v = result.length - 1;
            while (u < v) {
                c = (u + v) >> 1;
                if (arr[result[c]] < arrI) {
                    u = c + 1;
                }
                else {
                    v = c;
                }
            }
            if (arrI < arr[result[u]]) {
                if (u > 0) {
                    p[i] = result[u - 1];
                }
                result[u] = i;
            }
        }
    }
    u = result.length;
    v = result[u - 1];
    while (u-- > 0) {
        result[u] = v;
        v = p[v];
    }
    return result;
}

const isString = (val) => typeof val === "string";
const extend = Object.assign;
const isObject = (val) => {
    return val !== null && typeof val === "object";
};
const isOwn = (val, key) => Object.prototype.hasOwnProperty.call(val, key);
const hasChanged = (val, newVal) => {
    return !Object.is(val, newVal);
};
const capitalize = (str) => {
    return str[0].toLocaleUpperCase() + str.slice(1);
};
const camelize = (str) => {
    // 选中所有 - 后面的第一个
    return str.replace(/-(\w)/g, (_, c) => {
        return c ? c.toLocaleUpperCase() : "";
    });
};
const toHandlerKey = (str) => {
    return str ? "on" + capitalize(str) : "";
};

const Fragment = Symbol("Fragment");
const Text = Symbol("Text");
const EMPTY_OBJ = {};
function createVnode(type, props, children) {
    let vnode = {
        type,
        props,
        component: null,
        key: props && props.key,
        shapeFlag: getShapeFlag(type),
        children,
    };
    if (typeof children === "string") {
        vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN;
    }
    // 组件 + children Object
    if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        if (typeof children === "object") {
            vnode.shapeFlag |= ShapeFlags.SLOT_CHILDREN;
        }
    }
    return vnode;
}
function createTextVnode(text) {
    return createVnode(Text, {}, text);
}
function getShapeFlag(type) {
    return typeof type === "string"
        ? ShapeFlags.ELEMENT
        : ShapeFlags.STATEFUL_COMPONENT;
}

function h(type, props, children) {
    return createVnode(type, props, children);
}

function renderSlots(slots, key, props = {}) {
    let slot = slots[key];
    if (slot) {
        return createVnode(Fragment, {}, slot(props));
    }
}

let activeEffect;
let shouldTrack;
class ReactiveEffect {
    constructor(fn, scheduler) {
        this.scheduler = scheduler;
        this.deps = [];
        this.active = true;
        this._fn = fn;
    }
    run() {
        // 如果不是响应式数据
        if (!this.active) {
            return this._fn();
        }
        activeEffect = this;
        shouldTrack = true;
        const ret = this._fn();
        shouldTrack = false;
        // this._fn();
        return ret;
    }
    stop() {
        if (this.active) {
            if (this.onStop) {
                this.onStop();
            }
            clearnEffect(this);
            this.active = false;
        }
    }
}
function clearnEffect(effect) {
    effect.deps.forEach((dep) => {
        dep.delete(effect);
    });
    // 这里已经不存在内容了
    effect.deps.length = 0;
}
const targetMap = new Map();
function track(target, key) {
    if (!isTracking())
        return;
    let depsMap = targetMap.get(target);
    if (!depsMap) {
        depsMap = new Map();
        targetMap.set(target, depsMap);
    }
    let dep = depsMap.get(key);
    if (!dep) {
        dep = new Set();
        depsMap.set(key, dep);
    }
    // 双向数据保存
    trackEffects(dep);
}
// 收集事件
function trackEffects(dep) {
    if (dep.has(activeEffect))
        return;
    dep.add(activeEffect);
    activeEffect.deps.push(dep);
}
function isTracking() {
    return shouldTrack && activeEffect !== undefined;
}
function trigger(target, key) {
    if (targetMap.has(target)) {
        let depsMap = targetMap.get(target);
        if (depsMap.has(key)) {
            let dep = depsMap.get(key);
            triggerEffects(dep);
        }
    }
}
// 触发事件
function triggerEffects(dep) {
    for (let effec of dep) {
        if (effec.scheduler) {
            effec.scheduler();
        }
        else {
            effec.run();
        }
    }
}
function effect(fn, options = {}) {
    const _effect = new ReactiveEffect(fn, options.scheduler);
    extend(_effect, options);
    _effect.run();
    let runner = _effect.run.bind(_effect);
    runner.effec = _effect;
    return runner;
}

const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonlyHandlesGet = createGetter(true, true);
function createGetter(isReadonly = false, shallow = false) {
    return function get(target, key) {
        if (key === "__v_isReactive" /* ReactiveFlags.IS_REACTIVE */) {
            return !isReadonly;
        }
        else if (key === "__v_isReadonly" /* ReactiveFlags.IS_READONLY */) {
            return isReadonly;
        }
        if (!isReadonly) {
            track(target, key);
        }
        const res = Reflect.get(target, key);
        if (shallow) {
            return res;
        }
        // 递归处理响应式
        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res);
        }
        return res;
    };
}
function createSetter() {
    return function set(target, key, value) {
        const res = Reflect.set(target, key, value);
        trigger(target, key);
        return res;
    };
}
const mutableHandles = {
    get,
    set,
};
const readonlyHandles = {
    get: readonlyGet,
    set(target, key, value) {
        console.warn(`${key} is readonly`, target);
        return true;
    },
};
const shallowReadonlyHandles = extend({}, readonlyHandles, {
    get: shallowReadonlyHandlesGet,
});

function isReactive(obj) {
    return !!obj["__v_isReactive" /* ReactiveFlags.IS_REACTIVE */];
}
function isReadonly(obj) {
    return !!obj["__v_isReadonly" /* ReactiveFlags.IS_READONLY */];
}
function isProxy(val) {
    return isReactive(val) || isReadonly(val);
}
function reactive(obj) {
    return createActiveObject(obj, mutableHandles);
}
function readonly(row) {
    return createActiveObject(row, readonlyHandles);
}
function shallowReadonly(row) {
    return createActiveObject(row, shallowReadonlyHandles);
}
function createActiveObject(row, baseHandlers) {
    return new Proxy(row, baseHandlers);
}

class RefImpl {
    constructor(value) {
        this._v_isRef = true;
        this._rawValue = value;
        this._value = convert(value);
        this.dep = new Set();
    }
    get value() {
        // 不是 effect 中的 直接返回值
        if (isTracking()) {
            trackEffects(this.dep);
        }
        return this._value;
    }
    set value(newValue) {
        if (hasChanged(this._rawValue, newValue)) {
            this._value = convert(newValue);
            this._rawValue = newValue;
            triggerEffects(this.dep);
        }
    }
}
function convert(value) {
    return isObject(value) ? reactive(value) : value;
}
function ref(val) {
    return new RefImpl(val);
}
function isRef(ref) {
    return !!ref._v_isRef;
}
function unRef(ref) {
    return isRef(ref) ? ref.value : ref;
}
function proxyRefs(objectWithRef) {
    return new Proxy(objectWithRef, {
        get(target, key) {
            return unRef(Reflect.get(target, key));
        },
        set(target, key, newValue) {
            // 只有这样才需要直接赋值
            if (isRef(target[key]) && !isRef(newValue)) {
                return (target[key].value = newValue);
            }
            return Reflect.set(target, key, newValue);
        },
    });
}

function emit(instance, event, ...args) {
    console.log("componentEmit", event);
    const { props } = instance;
    // TPP
    // 先去写一个特定的行为 -> 重构成通用的行为
    const handlerName = toHandlerKey(camelize(event));
    const handler = props[handlerName];
    handler && handler(...args);
}

function initProps(instance, rowProps) {
    instance.props = rowProps || {};
}

const publicPropertiesMap = {
    $el: (i) => i.vnode.el,
    $slots: (i) => i.slots,
    $props: (i) => i.props,
};
const PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        let { setupState, props } = instance;
        if (isOwn(setupState, key)) {
            return setupState[key];
        }
        else if (isOwn(props, key)) {
            return props[key];
        }
        let publicGetter = publicPropertiesMap[key];
        if (publicGetter)
            return publicGetter(instance);
    },
};

function initSlots(instance, children) {
    // array
    // instance.slots = normalizeSlotValue(children);
    // object
    let { vnode } = instance;
    if (vnode.shapeFlag & ShapeFlags.SLOT_CHILDREN) {
        normalizeObjectSlots(children, instance.slots);
    }
}
function normalizeObjectSlots(children, slots) {
    for (const key in children) {
        const value = children[key];
        slots[key] = (props) => normalizeSlotValue(value(props));
    }
}
function normalizeSlotValue(value) {
    return Array.isArray(value) ? value : [value];
}

function createComponentInstance(vnode, parent) {
    // console.log(parent, "parent");
    let component = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        slots: {},
        next: null,
        // todo 这里不会出现原型链的问题
        provides: parent ? parent.provides : {},
        isMounted: false,
        subTree: null,
        parent,
        emit: () => { },
    };
    component.emit = emit;
    return component;
}
function setupComponent(instance) {
    initProps(instance, instance.vnode.props);
    initSlots(instance, instance.vnode.children);
    setupStateFulComponent(instance);
}
function setupStateFulComponent(instance) {
    const Component = instance.type;
    const { setup } = Component;
    // ctx
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);
    if (setup) {
        setCurrentInstance(instance);
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit.bind(null, instance),
        });
        setCurrentInstance(null);
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    // TODO function
    if (typeof setupResult === "object") {
        instance.setupState = proxyRefs(setupResult);
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    let Component = instance.type;
    if (compiler && !Component.render) {
        if (Component.template) {
            Component.render = compiler(Component.template);
        }
    }
    instance.render = Component.render;
}
let currentInstance = null;
function getCurrentInstance() {
    return currentInstance;
}
function setCurrentInstance(instance) {
    currentInstance = instance;
}
let compiler;
function registerRuntimeCompiler(_compiler) {
    compiler = _compiler;
}

function provide(key, val) {
    var _a;
    let currentInstance = getCurrentInstance();
    if (currentInstance) {
        let { provides } = currentInstance;
        const parentProvides = (_a = currentInstance.parent) === null || _a === void 0 ? void 0 : _a.provides;
        // todo 下面两个为什么
        // init
        if (provides === parentProvides) {
            // 原型链操作
            provides = currentInstance.provides = Object.create(parentProvides);
        }
        provides[key] = val;
    }
}
function inject(key, defaultValue) {
    let currentInstance = getCurrentInstance();
    if (currentInstance) {
        let parentProvides = currentInstance.parent.provides;
        if (key in parentProvides) {
            return parentProvides[key];
        }
        else if (defaultValue) {
            if (typeof defaultValue === "function") {
                return defaultValue();
            }
            else
                return defaultValue;
        }
    }
}

function createAppApi(render) {
    return function createApp(rootComponet) {
        return {
            mount(rootContainer) {
                // 先 vnode
                // component -> vnode
                // 所有逻辑操作 都会基于 vnode 做处理
                let vnode = createVnode(rootComponet);
                render(vnode, rootContainer);
            },
        };
    };
}

function shouldUpdateComponent(preVnode, nextVnode) {
    let { props: preProps } = preVnode;
    let { props: nextProps } = nextVnode;
    for (const key in nextProps) {
        if (nextProps[key] !== preProps[key]) {
            return true;
        }
    }
    return false;
}

const queue = [];
let isFlushPending = false;
const p = Promise.resolve();
function nextTick(fn) {
    return fn ? p.then(fn) : p;
}
function queueJobs(job) {
    if (!queue.includes(job)) {
        queue.push(job);
    }
    queueFlush();
}
function queueFlush() {
    if (isFlushPending)
        return;
    isFlushPending = true;
    nextTick(flushJobs);
}
function flushJobs() {
    isFlushPending = false;
    let job;
    while ((job = queue.shift())) {
        job && job();
    }
}

function createRenderer(options) {
    let { createElement: hostCreateElement, insert: hostInsert, patchProp: hostPatchProp, remove: hostRemove, setElementText: hostSetElementText, } = options;
    function render(vnode, container) {
        patch(null, vnode, container, null, null);
    }
    // n1 => old vnode
    // n2 => new vnode
    function patch(n1, n2, container, parentComponent, anchor) {
        const { shapeFlag, type } = n2;
        switch (type) {
            case Fragment:
                processFragment(n1, n2, container, parentComponent, anchor);
                break;
            case Text:
                processText(n1, n2, container);
                break;
            default:
                if (shapeFlag & ShapeFlags.ELEMENT) {
                    processElement(n1, n2, container, parentComponent, anchor);
                }
                else {
                    processComponent(n1, n2, container, parentComponent, anchor);
                }
                break;
        }
    }
    function processComponent(n1, n2, container, parentComponent, anthor) {
        if (!n1) {
            mountComponent(n2, container, parentComponent, anthor);
        }
        else {
            updateComponent(n1, n2);
        }
    }
    function updateComponent(n1, n2) {
        // 拿出保存的实例对象
        const instance = (n2.component = n1.component);
        if (shouldUpdateComponent(n1, n2)) {
            instance.next = n2;
            instance.update();
        }
        else {
            n2.el = n1.el;
            instance.vnode = n2;
        }
    }
    function mountComponent(initialVnode, container, parentComponent, anthor) {
        let instance = (initialVnode.component = createComponentInstance(initialVnode, parentComponent));
        // 处理 setup
        setupComponent(instance);
        setupRenderEffect(instance, initialVnode, container, anthor);
    }
    function setupRenderEffect(instance, ininalvnode, container, anthor) {
        instance.update = effect(() => {
            if (!instance.isMounted) {
                console.log("init");
                let { proxy } = instance;
                const subTree = instance.render.call(proxy, proxy);
                instance.subTree = subTree;
                patch(null, subTree, container, instance, anthor);
                ininalvnode.el = subTree.el;
                instance.isMounted = true;
            }
            else {
                console.log("update");
                let { proxy, next, vnode } = instance;
                if (next) {
                    next.el = vnode.el;
                    updateComponentPreRender(instance, next);
                }
                const subTree = instance.render.call(proxy, proxy);
                const preSubTree = instance.subTree;
                instance.subTree = subTree;
                patch(preSubTree, subTree, container, instance, anthor);
            }
        }, {
            scheduler() {
                queueJobs(instance.update);
            },
        });
    }
    function updateComponentPreRender(instance, nextVnode) {
        instance.vnode = nextVnode;
        instance.next = null;
        // console.log(instance, nextVnode);
        instance.props = nextVnode.props;
    }
    function processElement(n1, n2, container, parentComponent, anchor) {
        if (!n1) {
            mountElement(n2, container, parentComponent, anchor);
        }
        else {
            // 更新操作
            patchElement(n1, n2, container, parentComponent, anchor);
        }
    }
    function patchElement(n1, n2, container, parentComponent, anchor) {
        console.log("patchElement", container);
        // console.log("old", n1);
        // console.log("new", n2);
        let oldProps = n1.props || EMPTY_OBJ;
        let newProps = n2.props || EMPTY_OBJ;
        let el = (n2.el = n1.el);
        patchChildren(n1, n2, el, parentComponent, anchor);
        patchProps(el, oldProps, newProps);
    }
    function patchChildren(n1, n2, container, parentComponent, anchor) {
        const { shapeFlag: prevShapeFlag, children: c1 } = n1;
        const { shapeFlag, children: c2 } = n2;
        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                // 1. 把老的 children 清空
                unmountChildren(n1.children);
            }
            // 2.直接 设置 text
            if (c1 !== c2) {
                hostSetElementText(container, c2);
            }
        }
        else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                // array diff array
                patchKeyedChildren(c1, c2, container, parentComponent, anchor);
            }
            else if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
                // 1. 把老的 text children 清空
                hostSetElementText(container, "");
                // 2. 设置 arr
                mountChildren(c2, container, parentComponent, anchor);
            }
        }
    }
    // ! 如果有需要一定要好好复盘
    function patchKeyedChildren(c1, c2, container, parentComponent, parentAnthor) {
        let i = 0;
        const l2 = c2.length;
        let e1 = c1.length - 1;
        let e2 = l2 - 1;
        function isSomeVnodeType(n1, n2) {
            return n1.type === n2.type && n1.key === n2.key;
        }
        // 左侧对比
        while (i <= e1 && i <= e2) {
            let n1 = c1[i];
            let n2 = c2[i];
            if (isSomeVnodeType(n1, n2)) {
                patch(n1, n2, container, parentComponent, parentAnthor);
            }
            else {
                break;
            }
            i++;
        }
        // 右侧对比
        while (i <= e1 && i <= e2) {
            let n1 = c1[e1];
            let n2 = c2[e2];
            if (isSomeVnodeType(n1, n2)) {
                patch(n1, n2, container, parentComponent, parentAnthor);
            }
            else {
                break;
            }
            e1--;
            e2--;
        }
        // 新的比旧的多
        if (i > e1) {
            if (i <= e2) {
                const nextPos = e2 + 1;
                const anchor = nextPos >= l2 ? null : c2[nextPos].el;
                while (i <= e2) {
                    patch(null, c2[i], container, parentComponent, anchor);
                    i++;
                }
            }
            // 旧的比新的多
        }
        else if (i > e2) {
            while (i <= e1) {
                hostRemove(c1[i].el);
                i++;
            }
        }
        else {
            // 中间对比
            let s1 = i;
            let s2 = i;
            const toBePatched = e2 - s2 + 1;
            let patched = 0;
            const keyToNewIndexMap = new Map();
            const newIndexToOldIndexMap = new Array(toBePatched).fill(0);
            for (let i = s2; i < e1; i++) {
                let nextChild = c2[i];
                keyToNewIndexMap.set(nextChild.key, i);
            }
            for (let i = s1; i <= e1; i++) {
                const prevChild = c1[i];
                if (patched >= toBePatched) {
                    hostRemove(prevChild.el);
                    continue;
                }
                let newIndex;
                if (prevChild.key !== null) {
                    newIndex = keyToNewIndexMap.get(prevChild.key);
                }
                else {
                    for (let j = s2; j <= e2; j++) {
                        if (isSomeVnodeType(prevChild, c2[j])) {
                            newIndex = j;
                        }
                    }
                }
                if (newIndex === undefined) {
                    hostRemove(prevChild.el);
                }
                else {
                    newIndexToOldIndexMap[newIndex - s2] = i + 1;
                    patch(prevChild, c2[newIndex], container, parentComponent, null);
                    patched++;
                }
            }
            // 获取到最长递增子序列
            const increasingNewIndexSequence = getSequence(newIndexToOldIndexMap);
            let j = increasingNewIndexSequence.length - 1;
            for (let i = toBePatched - 1; i >= 0; i--) {
                const nextIndex = i + s2;
                const nextChild = c2[nextIndex];
                const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : null;
                if (i !== increasingNewIndexSequence[j]) {
                    console.log("移动位置");
                    hostInsert(nextChild.el, container, anchor);
                }
                else {
                    j--;
                }
            }
        }
        // console.log(i, e1, e2, "我就是一个 i哦 哦哦");
    }
    function unmountChildren(child) {
        for (let i = 0; i < child.length; i++) {
            const el = child[i].el;
            hostRemove(el);
        }
    }
    function patchProps(el, oldProps, newProps) {
        if (oldProps !== newProps) {
            for (const key in newProps) {
                const prevProp = oldProps[key];
                const nextProp = newProps[key];
                if (prevProp !== nextProp) {
                    hostPatchProp(el, key, prevProp, nextProp);
                }
            }
            if (oldProps !== EMPTY_OBJ) {
                for (const key in oldProps) {
                    const prevProp = oldProps[key];
                    if (!(key in newProps)) {
                        hostPatchProp(el, key, prevProp, null);
                    }
                }
            }
        }
    }
    function mountElement(n2, container, parentComponent, anchor) {
        // 初始化的赋值
        const el = (n2.el = hostCreateElement(n2));
        const { children, shapeFlag } = n2;
        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            el.textContent = children;
        }
        else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            // vonode
            mountChildren(n2.children, el, parentComponent, anchor);
        }
        const { props } = n2;
        for (let key in props) {
            const val = props[key];
            hostPatchProp(el, key, null, val);
        }
        // container.appendChild(el);
        hostInsert(el, container, anchor);
    }
    function mountChildren(children, container, parentComponent, anthor) {
        children.forEach((v) => patch(null, v, container, parentComponent, anthor));
    }
    function processFragment(n1, n2, continuer, parentComponent, anthor) {
        mountChildren(n2.children, continuer, parentComponent, anthor);
    }
    function processText(n1, n2, container) {
        const { children } = n2;
        const textNode = (n2.el = document.createTextNode(children));
        container.append(textNode);
    }
    return {
        creatApp: createAppApi(render),
    };
}

function createElement(vnode) {
    // createRenderer()
    const el = (vnode.el = document.createElement(vnode.type));
    return el;
}
function insert(child, parent, anthor) {
    // parent.appendChild(el);
    parent.insertBefore(child, anthor || null);
}
function patchProp(el, key, preVal, newVal) {
    let isOn = (key) => /^on[A-Z]/.test(key);
    if (isOn(key)) {
        const event = key.slice(2).toLocaleLowerCase();
        el.addEventListener(event, newVal);
    }
    if (newVal === undefined || newVal === null) {
        el.removeAttribute(key);
    }
    else {
        el.setAttribute(key, newVal);
    }
}
function remove(child) {
    const parent = child.parentNode;
    if (parent) {
        parent.removeChild(child);
    }
}
function setElementText(el, text) {
    // console.log(el, text);
    el.textContent = text;
}
const renderer = createRenderer({
    createElement,
    insert,
    patchProp,
    remove,
    setElementText,
});
function createApp(...arg) {
    return renderer.creatApp(...arg);
}

var runtimeDom = /*#__PURE__*/Object.freeze({
    __proto__: null,
    createApp: createApp,
    h: h,
    createTextVnode: createTextVnode,
    createElementVNode: createVnode,
    renderSlots: renderSlots,
    getCurrentInstance: getCurrentInstance,
    registerRuntimeCompiler: registerRuntimeCompiler,
    provide: provide,
    inject: inject,
    createRenderer: createRenderer,
    nextTick: nextTick,
    toDisplayString: toDisplayString,
    shallowReadonly: shallowReadonly,
    readonly: readonly,
    isReactive: isReactive,
    isReadonly: isReadonly,
    isProxy: isProxy,
    ref: ref,
    proxyRefs: proxyRefs,
    effect: effect
});

const TO_DISPLAY_STRING = Symbol("toDisplayString");
const CREAT_ELEMENT_VNODE = Symbol("createElementVNode");
const helperMapName = {
    [TO_DISPLAY_STRING]: "toDisplayString",
    [CREAT_ELEMENT_VNODE]: 'createElementVNode'
};

function genarator(ast) {
    let context = createCodegenContext();
    let { push } = context;
    genFunctionPreamble(context, ast);
    const functionName = "render";
    const args = ["_ctx", "_cache"];
    const signature = args.join(", ");
    push(`function ${functionName}(${signature}){`);
    push("return ");
    genNode(ast.codegenNode, context);
    push("}");
    return {
        code: context.code,
    };
}
function genFunctionPreamble(context, ast) {
    const VueBinging = "Vue";
    let { push } = context;
    let aliasHelpers = (s) => `${helperMapName[s]}: _${helperMapName[s]}`;
    if (ast.helpers.length > 0) {
        push(`const { ${ast.helpers.map(aliasHelpers).join(", ")} } = ${VueBinging}`);
    }
    push("\n");
    push("return ");
}
function genNode(node, context) {
    switch (node.type) {
        case 1 /* NodeTypes.TEXT */:
            genText(node, context);
            break;
        case 0 /* NodeTypes.INTERPOLATION */:
            genInterprolation(node, context);
            break;
        case 2 /* NodeTypes.SIMPLE_EXPRESSION */:
            genExpression(node, context);
            break;
        case 3 /* NodeTypes.ELEMENT */:
            genElement(node, context);
            break;
        case 5 /* NodeTypes.COMPOUND_EXPRESSION */:
            genCompundExpression(node, context);
            break;
    }
}
function genCompundExpression(node, context) {
    const { children } = node;
    const { push } = context;
    for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (isString(child)) {
            push(child);
        }
        else {
            genNode(child, context);
        }
    }
}
function genElement(node, context) {
    const { push, helper } = context;
    const { tag, props, children } = node;
    // push(`${helper(CREAT_ELEMENT_VNODE)}('${tag}', ${props}, `);
    push(`${helper(CREAT_ELEMENT_VNODE)}(`);
    genNodeList(genNullableArgs([tag, props, children]), context);
    // genNode(children, context);
    push(")");
}
function genNodeList(nodes, context) {
    const { push } = context;
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (isString(node)) {
            push(`${node}`);
        }
        else {
            genNode(node, context);
        }
        // node 和 node 之间需要加上 逗号(,)
        // 但是最后一个不需要 "div", [props], [children]
        if (i < nodes.length - 1) {
            push(", ");
        }
    }
}
function genNullableArgs(args) {
    // 把末尾为null 的都删除掉
    // vue3源码中，后面可能会包含 patchFlag、dynamicProps 等编译优化的信息
    // 而这些信息有可能是不存在的，所以在这边的时候需要删除掉
    let i = args.length;
    // 这里 i-- 用的还是特别的巧妙的
    // 当为0 的时候自然就退出循环了
    while (i--) {
        if (args[i] != null)
            break;
    }
    // 把为 falsy 的值都替换成 "null"
    return args.slice(0, i + 1).map((arg) => arg || "null");
}
function createCodegenContext() {
    let context = {
        code: "",
        push(source) {
            context.code += source;
        },
        helper(key) {
            return `_${helperMapName[key]}`;
        },
    };
    return context;
}
function genText(node, context) {
    let { push } = context;
    push(`'${node.content}'`);
}
function genInterprolation(node, context) {
    let { push, helper } = context;
    push(`${helper(TO_DISPLAY_STRING)}(`);
    genNode(node.content, context);
    push(")");
}
function genExpression(node, context) {
    let { push } = context;
    push(`${node.content}`);
}

function baseParse(content) {
    const context = createParserContext(content);
    return createRoot(parseChildren(context, []));
}
function createParserContext(content) {
    return {
        source: content,
    };
}
function createRoot(content) {
    return {
        children: content,
        type: 4 /* NodeTypes.ROOT */,
    };
}
function isEnd(context, ancestors) {
    const s = context.source;
    // </div>
    if (s.startsWith("</")) {
        for (let i = ancestors.length - 1; i >= 0; i--) {
            const tag = ancestors[i].tag;
            if (startWithEngTagOpen(s, tag)) {
                return true;
            }
        }
    }
    // if (ancestors && s.startsWith(`</${ancestors}>`)) {
    //   return true;
    // }
    return !s.length;
}
function startWithEngTagOpen(source, tag) {
    return (source.startsWith("</") &&
        source.slice(2, 2 + tag.length).toLowerCase() === tag.toLowerCase());
}
function parseChildren(context, ancestors) {
    const nodes = [];
    while (!isEnd(context, ancestors)) {
        let node;
        const s = context.source;
        if (s.startsWith("{{")) {
            // 解析插值
            node = parseInterplation(context);
        }
        else if (s.startsWith("<")) {
            if (/[a-z]/i.test(s[1])) {
                node = parseElement(context, ancestors);
            }
        }
        if (!node) {
            node = parseText(context);
        }
        nodes.push(node);
    }
    return nodes;
}
function parseTextData(context, length) {
    const content = context.source.slice(0, length);
    advanceBy(context, length);
    return content;
}
function parseText(context) {
    let endIndex = context.source.length;
    let endTokens = ["</", "{{"];
    for (let i = 0; i < endTokens.length; i++) {
        const index = context.source.indexOf(endTokens[i]);
        if (index !== -1 && index < endIndex) {
            endIndex = index;
        }
    }
    let content = parseTextData(context, endIndex);
    return {
        type: 1 /* NodeTypes.TEXT */,
        content,
    };
}
function parseInterplation(context) {
    // context  = {{message}}
    const openDelimiter = "{{";
    const closeDelimiter = "}}";
    const closeIndex = context.source.indexOf(closeDelimiter, openDelimiter.length);
    advanceBy(context, openDelimiter.length);
    const rawContentLength = closeIndex - openDelimiter.length;
    const rawContent = parseTextData(context, rawContentLength);
    const content = rawContent.trim();
    advanceBy(context, closeDelimiter.length);
    return {
        type: 0 /* NodeTypes.INTERPOLATION */,
        content: {
            type: 2 /* NodeTypes.SIMPLE_EXPRESSION */,
            content,
        },
    };
}
function parseElement(context, ancestors) {
    // 获取 tag
    const element = parseTag(context, 0 /* TagType.START */);
    ancestors.push(element);
    element.children = parseChildren(context, ancestors);
    ancestors.pop();
    if (startWithEngTagOpen(context.source, element.tag)) {
        parseTag(context, 1 /* TagType.END */);
    }
    else {
        throw new Error(`缺少结束标签:${element.tag}`);
    }
    return element;
}
function parseTag(context, type) {
    const match = /^<\/?([a-z]*)/i.exec(context.source);
    const tag = match[1];
    advanceBy(context, match[0].length);
    advanceBy(context, 1);
    if (type === 1 /* TagType.END */)
        return;
    return {
        type: 3 /* NodeTypes.ELEMENT */,
        tag,
    };
}
function advanceBy(context, length) {
    context.source = context.source.slice(length);
}

function transform(root, options = {}) {
    const context = createTransformContext(root, options);
    traverseNode(root, context);
    createCodegenNode(root);
    root.helpers = [...context.helpers.keys()];
}
function createTransformContext(root, options) {
    const context = {
        root,
        helpers: new Map(),
        helper(key) {
            context.helpers.set(key, 1);
        },
        nodeTransforms: options.nodeTransforms || [],
    };
    return context;
}
function traverseNode(node, context) {
    // 执行一些指定的执行操作
    let nodeTransforms = context.nodeTransforms;
    let exitFns = [];
    for (let i = 0; i < nodeTransforms.length; i++) {
        let transform = nodeTransforms[i];
        // 这里执行一些外部需要执行的插件
        const onExit = transform(node, context);
        if (onExit)
            exitFns.push(onExit);
    }
    switch (node.type) {
        case 0 /* NodeTypes.INTERPOLATION */:
            // 引入一些导入的内容
            context.helper(TO_DISPLAY_STRING);
            break;
        case 4 /* NodeTypes.ROOT */:
            traverChildNode(node, context);
            break;
        case 3 /* NodeTypes.ELEMENT */:
            traverChildNode(node, context);
            break;
    }
    let i = exitFns.length;
    while (i--) {
        exitFns[i]();
    }
}
function traverChildNode(node, context) {
    let children = node.children;
    for (let i = 0; i < children.length; i++) {
        const childNode = children[i];
        traverseNode(childNode, context);
    }
}
function createCodegenNode(root) {
    const child = root.children[0];
    if (child.type === 3 /* NodeTypes.ELEMENT */) {
        root.codegenNode = child.codegenNode;
    }
    else {
        root.codegenNode = root.children[0];
    }
}

function createVnodeCall(context, vnodeTag, vnodeProps, vnodeChildren) {
    context.helper(CREAT_ELEMENT_VNODE);
    return {
        type: 3 /* NodeTypes.ELEMENT */,
        tag: vnodeTag,
        props: vnodeProps,
        children: vnodeChildren,
    };
}

function transformElment(node, context) {
    if (node.type === 3 /* NodeTypes.ELEMENT */) {
        return () => {
            // 中间处理层
            // tag
            const vnodeTag = `'${node.tag}'`;
            // props
            let vnodeProps;
            // children
            const children = node.children;
            let vnodeChildren = children[0];
            node.codegenNode = createVnodeCall(context, vnodeTag, vnodeProps, vnodeChildren);
        };
    }
}

function transformExpression(node) {
    if (node.type === 0 /* NodeTypes.INTERPOLATION */) {
        node.content = processExpression(node.content);
    }
}
function processExpression(node) {
    node.content = "_ctx." + node.content;
    return node;
}

function isText(node) {
    return node.type === 1 /* NodeTypes.TEXT */ || node.type === 0 /* NodeTypes.INTERPOLATION */;
}

function transformText(node) {
    if (node.type === 3 /* NodeTypes.ELEMENT */) {
        return () => {
            let { children } = node;
            let currentContainer;
            for (let i = 0; i < children.length; i++) {
                const child = children[i];
                if (isText(child)) {
                    for (let j = i + 1; j < children.length; j++) {
                        const next = children[j];
                        if (isText(next)) {
                            if (!currentContainer) {
                                currentContainer = children[i] = {
                                    type: 5 /* NodeTypes.COMPOUND_EXPRESSION */,
                                    children: [child],
                                };
                            }
                            currentContainer.children.push(" + ");
                            currentContainer.children.push(next);
                            children.splice(j, 1);
                            j--;
                        }
                        else {
                            currentContainer = undefined;
                            break;
                        }
                    }
                }
            }
        };
    }
}

function baseCompaile(template) {
    const ast = baseParse(template);
    transform(ast, {
        nodeTransforms: [transformExpression, transformElment, transformText],
    });
    return genarator(ast);
}

function compaileToFunction(template) {
    const { code } = baseCompaile(template);
    const render = new Function("Vue", code)(runtimeDom);
    return render;
}
registerRuntimeCompiler(compaileToFunction);

export { createApp, createVnode as createElementVNode, createRenderer, createTextVnode, effect, getCurrentInstance, h, inject, isProxy, isReactive, isReadonly, nextTick, provide, proxyRefs, readonly, ref, registerRuntimeCompiler, renderSlots, shallowReadonly, toDisplayString };
