'use strict';

class TextActor extends Actor {
    constructor(x, y, text) {
        const hitArea = new Rectangle(0, 0, 0, 0);
        super(x, y, hitArea);

        this.message = text;
    }

    //update,render 継承
}

class StartTextActor extends Actor {
    constructor(x, y, text) {
        const hitArea = new Rectangle(0, 0, 0, 0);
        super(x, y, hitArea);

        this.message = text;
    }

    //update 継承
    update(gameInfo, input){
    }

    render(target) {
        const context = target.getContext('2d');

        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;
        context.shadowBlur = 0;

        const px = 32;
        context.font = px.toString()+"px 'Century Gothic'";
        const alpha = (Math.random() + 2) / 3

        context.fillStyle = "rgba(255,255,255,"+ alpha.toString() +")";
        const textWidth = context.measureText(this.message).width;
        context.fillText(this.message, this.x - textWidth/ 2, this.y - px);

        context.strokeStyle = "rgba(150,150,255,0.3)";
        context.strokeText(this.message, this.x - textWidth/ 2, this.y - px);
    }
}

class SceneFrameTextActor extends TextActor {
    constructor(x, y, text) {
        super(x, y, text)

        this.count = 0;
        this.origin = text;
        this.message = this.origin + this.count.toString();
    }

    update(gameInfo, input){
    this.count = this.count + 1;
        this.message = this.origin + this.count.toString();
    }

    render(target) {
        const context = target.getContext('2d');
        context.font = "40px 'Century Gothic'";
        context.fillStyle = 'black';
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;
        context.fillText(this.message, this.x, this.y);
    }
}

class FloatingSpriteActor extends SpriteActor {
    constructor(x, y, imgURI, imgWidth, imgHeight, random, change) {
        const img = assets.get(imgURI);
        const sprite = new Sprite(img, new Rectangle(0, 0, img.width, img.height));
        const hitArea = new Rectangle(0, 0, 0, 0);
        super(x, y, sprite, hitArea, [img]);

        this.count = 0;
        this.random = random;
        this.change = change;
        this.imgWidth = imgWidth;
        this.imgHeight = imgHeight;

        this.originX = x + random / 2;
        this.originY = y + random / 2;
        this.prevX = 0;
        this.prevY = 0;
        this.nextTargetX = Math.random() * (this.random + 1) - this.random;
        this.nextTargetY = Math.random() * (this.random + 1) - this.random;
        this.angle = 0;
    }

    update(gameInfo, input){
        this.count = this.count + 1;
        const nextCount = this.count - Math.floor(this.count / this.change) * this.change;
        if(nextCount === 0){
            this.prevX = this.nextTargetX;
            this.prevY = this.nextTargetY;
            this.nextTargetX = Math.random() * (this.random + 1) - this.random;
            this.nextTargetY = Math.random() * (this.random + 1) - this.random;
        }

        this.x = this.originX + this.prevX + (this.nextTargetX - this.prevX) * nextCount / this.change;
        this.y = this.originY + this.prevY + (this.nextTargetY - this.prevY) * nextCount / this.change;
    }

    render(target) {
        const context = target.getContext('2d');
        context.beginPath();
        const rect = this.sprite.rectangle;
        context.shadowColor ="#999";
        context.shadowOffsetX = 2;
        context.shadowOffsetY = 1;
        context.shadowBlur = 3;
        context.drawImage(this.sprite.image,
            rect.x, rect.y,
            rect.width, rect.height,
            this.x - this.imgWidth / 2 , this.y - this.imgHeight / 2 ,
            this.imgWidth, this.imgHeight);
    }
    //render 継承
}

class TowerBattleTitleScene extends Scene {
    constructor(renderingTarget) {
        super('タイトル', 'aqua', renderingTarget);

        //logo x, y, img, width, height, floatSize, time
        const logo = new FloatingSpriteActor(210, 340, 'logo', 434, 105, 7, 60);
        this.add(logo);

        //sun x, y, img, width, height, floatSize, time
        const sun = new FloatingSpriteActor(300, 100, 'sun', 120, 120, 5, 95);
        this.add(sun);

        const start = new StartTextActor(200, 560, '>>   Start   <<');
        this.add(start);

        const sceneFrame = new SceneFrameTextActor(10, 710, 'Title Frame:');
        this.add(sceneFrame);
    }

    update(gameInfo, input) {
        super.update(gameInfo, input);
        if(input.getKeyDown(' ')) {
            const mainScene = new TowerBattleMainScene(this.renderingTarget);
            this.changeScene(mainScene);
        }
    }
}

class TowerBattleTitleGame extends Game {
    constructor() {
        super('TowerBattle', 400, 720, 60);
        const titleScene = new TowerBattleTitleScene(this.screenCanvas);
        this.changeScene(titleScene);
    }
}

assets.addImage('sprite', 'sprite.png');
assets.addImage('sun', 'sun_yellow1.png');
assets.addImage('logo', 'logo.png');
assets.loadAll().then((a) => {
    const game = new TowerBattleTitleGame();
    document.body.appendChild(game.screenCanvas);
    game.start();
});