'use strict';

class TextActor extends Actor {
    constructor(x, y, text) {
        const hitArea = new Rectangle(0, 0, 0, 0);
        super(x, y, hitArea);

        this.message = text;
    }

    // update,render 継承
}

class StartTextActor extends Actor {
    constructor(x, y, text) {
        const hitArea = new Rectangle(0, 0, 0, 0);
        super(x, y, hitArea);

        this.message = text;
    }

    // update 継承
    update(gameInfo, input){
    }

    render(target) {
        const context = target.getContext('2d');

        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;
        context.shadowBlur = 0;

        const px = 39;
        context.font = px.toString()+"px 'Century Gothic'";
        const alpha = (Math.random() + 2) / 3

        context.fillStyle = "rgba(255,255,255,"+ alpha.toString() +")";
        const textWidth = context.measureText(this.message).width;
        context.fillText(this.message, this.x - textWidth/ 2, this.y - px);

        context.strokeStyle = "rgba(0,0,0,0.3)";
        context.strokeText(this.message, this.x - textWidth/ 2, this.y - px);
    }
}

class DebugTextActor extends TextActor {
    constructor(x, y, text) {
        super(x, y, text)

        this.count = 0;
        this.origin = text;
        this.message = this.origin + this.count.toString();
        this.alpha = 0;
    }

    update(gameInfo, input){
        this.count = this.count + 1;
        this.message = this.origin + this.count.toString();
        if(input.getKeyDown(' ')) {
            if(this.alpha > 0){
            	this.alpha = 0;
            }else{
            	this.alpha = 1.0 ;
            }
        }
    }

    render(target) {
        const context = target.getContext('2d');
        context.font = "40px 'Century Gothic'";
        context.fillStyle = "rgba(0,0,0," + this.alpha.toString() +")";
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;
        context.fillText(this.message, this.x, this.y);
    }
}

class FloatingSpriteActor extends SpriteActor {
    constructor(x, y, imgURI, imgWidth, random, change) {
        const img = assets.get(imgURI);
        const sprite = new Sprite(img, new Rectangle(0, 0, img.width, img.height));
        const hitArea = new Rectangle(0, 0, 0, 0);
        super(x, y, sprite, hitArea, [img]);

        this.count = 0;
        this.random = random;
        this.change = change;
        this.imgWidth = imgWidth;
        this.imgHeight = Math.floor(imgWidth * img.height / img.width);

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
    // render 継承
}

class TowerBattleTitleScene extends Scene {
    constructor(renderingTarget) {
        super('タイトル', 'aqua', renderingTarget);

        //TODO 配置をCanvasサイズで合わせる

        // logo x, y, img, width, height, floatSize, time
        const logo = new FloatingSpriteActor(200, 340, 'logo', 360, 7, 60);
        this.add(logo);

        // sun x, y, img, width, height, floatSize, time
        const sun = new FloatingSpriteActor(300, 100, 'sun', 120, 5, 95);
        this.add(sun);

        const start = new StartTextActor(200, 600, '>>  START  <<');
        this.add(start);

        const sceneFrame = new DebugTextActor(10, 710, 'Title Frame:');
        this.add(sceneFrame);
    }

    update(gameInfo, input) {
        super.update(gameInfo, input);
        if(input.getMouseDown()) {
        	const upLine = gameInfo.screenRectangle.height * 0.6;
        	const bottomLine = gameInfo.screenRectangle.height * 0.9;
        	if(input.point.getY() > upLine && input.point.getY() < bottomLine){
                const mainScene = new TowerBattleMainScene(this.renderingTarget);
                this.changeScene(mainScene);
        	}
        }
    }
}

class TowerBattleMainScene extends Scene {
    constructor(renderingTarget) {
        super('メイン', 'aqua', renderingTarget);

        //sun x, y, img, width, floatSize, time
        const sun = new FloatingSpriteActor(300, 100, 'sun', 120, 5, 95);
        this.add(sun);

        const sceneFrame = new DebugTextActor(10, 710, 'Main Frame:');
        this.add(sceneFrame);
    }

    update(gameInfo, input) {
        super.update(gameInfo, input);
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