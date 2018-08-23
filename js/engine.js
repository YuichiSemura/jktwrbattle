/*
    ○原典はこちらからダウンロード
    JavaScriptで弾幕STGをフルスクラッチで作る その1 ゲームエンジン編
    https://sbfl.net/blog/2016/05/18/javascript-danmaku-stg-1/

    ○勉強に使用したページ集
    ・ES6(ES2015)チートシート https://qiita.com/morrr/items/883cb902ccda37e840bc #Qiita
    ・JavaScriptのGetter/Setter 〜 JSおくのほそ道 #018 https://qiita.com/hosomichi/items/c7d3cae7884a5e12a064 #Qiita
    ・JavaScriptにおけるvar/let/constの使い分け https://sbfl.net/blog/2016/07/14/javascript-var-let-const/
    ・もうはじめよう、ES6~ECMAScript6の基本構文まとめ(JavaScript)~ https://qiita.com/takeharu/items/cbbe017bbdd120015ca0 #Qiita
    ・ECMAScript6のアロー関数とPromiseまとめ - JavaScript https://qiita.com/takeharu/items/c23998d22903e6d3c1d9 #Qiita
    ・非同期処理ってどういうこと？JavaScriptで一から学ぶ https://qiita.com/kiyodori/items/da434d169755cbb20447 #Qiita
    ・JavaScriptの「this」は「4種類」？？ https://qiita.com/takeharu/items/9935ce476a17d6258e27 #Qiita
*/
'use strict';

// 矩形
class Rectangle {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    // 当たり判定について
    hitTest(other) {
        const horizontal = (other.x < this.x + this.width) &&
            (this.x < other.x + other.width);
        const vertical = (other.y < this.y + this.height) &&
            (this.y < other.y + other.height);
        return (horizontal && vertical);
    }
}

// 画像
class Sprite {
    constructor(image, rectangle) {
        this.image = image;
        this.rectangle = rectangle;
    }
}

// アセットに画像をロードするクラス
class AssetLoader {
    // Map オブジェクトはその要素について挿入順で反復処理を行うことができます。
    // for...of ループは各処理で [キー, 値] の配列を返します。
    // for (var [key, value] of myMap) {
    // console.log(key + ' = ' + value);
    // }
    constructor() {
        this._promises = [];
        this._assets = new Map();
    }

    // Promiseでロードする
    addImage(name, url) {
        const img = new Image();
        img.src = url;

        const promise = new Promise((resolve, reject) =>
            img.addEventListener('load', (e) => {
                this._assets.set(name, img);
                resolve(img);
            }));

        this._promises.push(promise);
    }

    loadAll() {
        return Promise.all(this._promises).then((p) => this._assets);
    }

    get(name) {
        return this._assets.get(name);
    }
}

const assets = new AssetLoader();

// イベントを自分で実装するとこんなに楽なんだね！
class EventDispatcher {
    constructor() {
        this._eventListeners = {};
    }

    addEventListener(type, callback) {
        if(this._eventListeners[type] == undefined) {
            this._eventListeners[type] = [];
        }

        this._eventListeners[type].push(callback);
    }

    dispatchEvent(type, event) {
        const listeners = this._eventListeners[type];
        if(listeners != undefined) listeners.forEach((callback) => callback(event));
    }
}

class GameEvent {
    constructor(target) {
        this.target = target;
    }
}

// オブジェクトのもとになるもの．継承して使う．
class Actor extends EventDispatcher {
    constructor(x, y, hitArea, tags = []) {
        super();
        this.hitArea = hitArea;
        this._hitAreaOffsetX = hitArea.x;
        this._hitAreaOffsetY = hitArea.y;
        this.tags = tags;

        this.x = x;
        this.y = y;
    }

    // updateとrenderは継承先で定義する
    update(gameInfo, input) {}
    render(target) {}

    hasTag(tagName) {
        return this.tags.includes(tagName);
    }

    // 他のActorの生成
    spawnActor(actor) {
        this.dispatchEvent('spawnactor', new GameEvent(actor));
    }

    // 自身の削除
    destroy() {
        this.dispatchEvent('destroy', new GameEvent(this));
    }

    get x() {
        return this._x;
    }

    set x(value) {
        this._x = value;
        this.hitArea.x = value + this._hitAreaOffsetX;
    }

    get y() {
        return this._y;
    }

    set y(value) {
        this._y = value;
        this.hitArea.y = value + this._hitAreaOffsetY;
    }
}

class SpriteActor extends Actor {
    constructor(x, y, sprite, hitArea, tags=[]) {
        super(x, y, hitArea, tags);
        this.sprite = sprite;
        this.width = sprite.rectangle.width;
        this.height = sprite.rectangle.height;
    }

    render(target) {
        const context = target.getContext('2d');
        context.beginPath();
        const rect = this.sprite.rectangle;
        context.drawImage(this.sprite.image,
            rect.x, rect.y,
            rect.width, rect.height,
            this.x, this.y,
            rect.width, rect.height);
    }

    isOutOfBounds(boundRect) {
        const actorLeft = this.x;
        const actorRight = this.x + this.width;
        const actorTop = this.y;
        const actorBottom = this.y + this.height;

        const horizontal = (actorRight < boundRect.x || actorLeft > boundRect.width);
        const vertical = (actorBottom < boundRect.y || actorTop > boundRect.height);

        return (horizontal || vertical);
    }
}

// https://qiita.com/lookman/items/a50b8ae85b0f7e8605d2
class Point {
    constructor(x = 0, y = 0) {
        this.x, this.y; // public
        this.set(x, y);
    }

    set(x, y) {
        this._x = x;
        this._y = y;
    }

    getX() {
        return this._x;
    }

    getY() {
    	return this._y;
    }

    on(event) {
        const rect = event.target.getBoundingClientRect();
        this.set(
            event.clientX - rect.left,
            event.clientY - rect.top
        );
    }
}

class Input {
    constructor(keyMap, prevKeyMap, mouseDown, prevMouseDown, point, prevPoint) {
        this.keyMap = keyMap;
        this.prevKeyMap = prevKeyMap;
        this.mouseDown = mouseDown;
        this.prevMouseDown = prevMouseDown;
        this.point = point;
        this.prevPoint = prevPoint;
    }

    _getKeyFromMap(keyName, map) {
        if(map.has(keyName)) {
            return map.get(keyName);
        } else {
            return false;
        }
    }

    _getPrevKey(keyName) {
        return this._getKeyFromMap(keyName, this.prevKeyMap);
    }

    getKey(keyName) {
        return this._getKeyFromMap(keyName, this.keyMap);
    }

    getKeyDown(keyName) {
        const prevDown = this._getPrevKey(keyName);
        const currentDown = this.getKey(keyName);
        return (!prevDown && currentDown);
    }

    getKeyUp(keyName) {
        const prevDown = this._getPrevKey(keyName);
        const currentDown = this.getKey(keyName);
        return (prevDown && !currentDown);
    }

    getMouseDown() {
        return (!this.prevMouseDown && this.mouseDown);
    }

    getMouseUp() {
    	return (this.prevMouseDown && !this.mouseDown);
    }
}

class InputReceiver {
    constructor() {
        this._keyMap = new Map();
        this._prevKeyMap = new Map();
        this._mouseDown = false;
        this._prevMouseDown = false;
        this._point = new Point();
        this._prevPoint = new Point();

        addEventListener('keydown', (ke) =>
        {
        	this._keyMap.set(ke.key, true);
        	console.log(ke.key);
        });
        addEventListener('keyup', (ke) => this._keyMap.set(ke.key, false));

        addEventListener('mousedown', (e) => this._mouseDown = true);
        addEventListener('mouseup', (e) => this._mouseDown = false);
        addEventListener('mousemove', (e) => this._point.on(e));
        // addEventListener('mouseover', (e) => console.log(e));
    }

    getInput() {
        const keyMap = new Map(this._keyMap);
        const prevKeyMap = new Map(this._prevKeyMap);
        this._prevKeyMap = new Map(this._keyMap);

        const mouseDown = this._mouseDown;
        const prevMouseDown = this._prevMouseDown;
        this._prevMouseDown = this._mouseDown;

        const point = this._point;
        const prevPoint = this._prevPoint;
        this._prevPoint = this._point;

        return new Input(keyMap, prevKeyMap, mouseDown, prevMouseDown, point, prevPoint);
    }
}

class Scene extends EventDispatcher {
    constructor(name, backgroundColor, renderingTarget) {
        super();

        this.name = name;
        this.backgroundColor = backgroundColor;
        this.actors = [];
        this.renderingTarget = renderingTarget;

        this._destroyedActors = [];
    }

    add(actor) {
        this.actors.push(actor);
        actor.addEventListener('spawnactor', (e) => this.add(e.target));
        actor.addEventListener('destroy', (e) => this._addDestroyedActor(e.target));
    }

    remove(actor) {
        const index = this.actors.indexOf(actor);
        this.actors.splice(index, 1);
    }

    changeScene(newScene) {
        const event = new GameEvent(newScene);
        this.dispatchEvent('changescene', event);
    }

    update(gameInfo, input) {
        this._updateAll(gameInfo, input);
        this._hitTest();
        this._disposeDestroyedActors();
        this._clearScreen(gameInfo);
        this._renderAll();
    }

    _updateAll(gameInfo, input) {
        this.actors.forEach((actor) => actor.update(gameInfo, input));
    }

    _hitTest() {
        const length = this.actors.length;
        for(let i=0; i < length - 1; i++) {
            for(let j=i+1; j < length; j++) {
                const obj1 = this.actors[i];
                const obj2 = this.actors[j];
                const hit = obj1.hitArea.hitTest(obj2.hitArea);
                if(hit) {
                    obj1.dispatchEvent('hit', new GameEvent(obj2));
                    obj2.dispatchEvent('hit', new GameEvent(obj1));
                }
            }
        }
    }

    _clearScreen(gameInfo) {
        const context = this.renderingTarget.getContext('2d');
        const width = gameInfo.screenRectangle.width;
        const height = gameInfo.screenRectangle.height;
        context.fillStyle = this.backgroundColor;
        context.fillRect(0, 0, width, height);
    }

    _renderAll() {
        this.actors.forEach((obj) => obj.render(this.renderingTarget));
    }

    _addDestroyedActor(actor) {
        this._destroyedActors.push(actor);
    }

    _disposeDestroyedActors() {
        this._destroyedActors.forEach((actor) => this.remove(actor));
        this._destroyedActors = [];
    }
}

class GameInformation {
    constructor(title, screenRectangle, maxFps, currentFps) {
        this.title = title;
        this.screenRectangle = screenRectangle;
        this.maxFps = maxFps;
        this.currentFps = currentFps;
    }
}

class Game {
    constructor(title, width, height, maxFps) {
        this.title = title;
        this.width = width;
        this.height = height;
        this.maxFps = maxFps;
        this.currentFps = 0;

        this.screenCanvas = document.createElement('canvas');
        this.screenCanvas.height = height;
        this.screenCanvas.width = width;

        this._inputReceiver = new InputReceiver();
        this._prevTimestamp = 0;

        console.log(`${title}が初期化されました。`);
    }

    changeScene(newScene) {
        this.currentScene = newScene;
        this.currentScene.addEventListener('changescene', (e) => this.changeScene(e.target));
        console.log(`シーンが${newScene.name}に切り替わりました。`);
    }

    start() {
        requestAnimationFrame(this._loop.bind(this));
    }

    _loop(timestamp) {
        const elapsedSec = (timestamp - this._prevTimestamp) / 1000;
        const accuracy = 0.9; // あまり厳密にするとフレームが飛ばされることがあるので
        const frameTime = 1 / this.maxFps * accuracy; // 精度を落とす
        if(elapsedSec <= frameTime) {
            requestAnimationFrame(this._loop.bind(this));
            return;
        }

        this._prevTimestamp = timestamp;
        this.currentFps = 1 / elapsedSec;

        //ここで作って渡す（使い回さない）
        const screenRectangle = new Rectangle(0, 0, this.width, this.height);
        const info = new GameInformation(this.title, screenRectangle,
                                         this.maxFps, this.currentFps);
        const input = this._inputReceiver.getInput();
        this.currentScene.update(info, input);

        requestAnimationFrame(this._loop.bind(this));
    }
}