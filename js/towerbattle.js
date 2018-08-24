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
        this.fps = "0";
    }

    update(gameInfo, input){
        if(this.count % 60 === 0){
        	this.fps = gameInfo.currentFps.toFixed(2);
        }
        this.count = this.count + 1;
        this.message = "Fps: " + this.fps + "\n" + this.origin + this.count.toString();
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
        const px = 20;
        context.font = px.toString()+"px 'Century Gothic'";
        context.fillStyle = "rgba(0,0,0," + this.alpha.toString() +")";
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;
        context.fillText(this.message, this.x, this.y-px);
    }
}

class FloatingSpriteActor extends SpriteActor {
    constructor(x, y, imgURI, imgWidth, random, change) {
        const img = assets.get(imgURI);
        const sprite = new Sprite(img, new Rectangle(0, 0, img.width, img.height));
        const hitArea = new Rectangle(0, 0, 0, 0);
        super(x, y, sprite, hitArea);

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

class ButtonObjectActor extends SpriteActor{
	constructor(x, y, width, height, imgURI, targetActor, tags=[]) {
		tags.push('button');
		const img = assets.get(imgURI);
        const sprite = new Sprite(img, new Rectangle(0, 0, img.width, img.height));
		const hitArea = new Rectangle(x, y, x + width, y + height);
        super(x, y, sprite, hitArea, tags);

        this.width = width;
        this.height = height;
        this.isPush = false;
        this._targetActor = targetActor;

        this.imgWidth = width;
        this.imgHeight = Math.floor(this.imgWidth * img.height / img.width);
    }

    isInBounds(point) {
        const actorLeft = this.x - this.width / 2;
        const actorRight = this.x + this.width / 2;
        const actorTop = this.y - this.height / 2;
        const actorBottom = this.y + this.height / 2;

    	//console.log(actorLeft + " " + actorRight + " " + actorTop + " " + actorBottom + " "+ point.getX()+ " " + point.getY());
        const horizontal = (actorLeft < point.getX() && point.getX() < actorRight);
        const vertical = (actorTop < point.getY() && point.getY() < actorBottom);

        return (horizontal && vertical);
    }

	update(gameInfo, input) {
		if(input.getMouseDown() && this.isInBounds(input.point)){
			this.isPush = true;
		}else if(input.getMouseUp()){
			this.isPush = false;
			if(this.isInBounds(input.point)){
				this._targetActor.dispatchEvent('rotate', new GameEvent(this._targetActor));
			}
		}
	}

    render(target) {
    	const context = target.getContext('2d');
		const rect = this.sprite.rectangle;

    	context.beginPath();
    	if(!this.isPush){
    		context.rect(this.x - this.width/2, this.y-this.height/2, this.width, this.height);
    		context.fillStyle = 'peachpuff';
    		context.shadowOffsetX = 3;
    		context.shadowOffsetY = 3;
    		context.shadowBlur = 1;
    		context.fill();
    		context.lineWidth = 2;
    		context.strokeStyle = 'coral';
    		context.shadowOffsetX = 0;
    		context.shadowOffsetY = 0;
    		context.shadowBlur = 0;
    		context.stroke();

    		context.shadowOffsetX = 3;
            context.shadowOffsetY = 3;
            context.shadowBlur = 1;
            context.drawImage(this.sprite.image,
                rect.x, rect.y,
                rect.width, rect.height,
                this.x - this.imgWidth / 2 , this.y - this.imgHeight / 2 ,
                this.imgWidth, this.imgHeight);
    	}else{
    		context.rect(this.x + 2 - this.width/2, this.y + 2 -this.height/2, this.width, this.height);
    		context.fillStyle = 'peachpuff';
    		context.shadowOffsetX = 1;
    		context.shadowOffsetY = 1;
    		context.shadowBlur = 1;
    		context.fill();
    		context.lineWidth = 2;
    		context.strokeStyle = 'coral';
    		context.shadowOffsetX = 0;
    		context.shadowOffsetY = 0;
    		context.shadowBlur = 0;
    		context.stroke();

    		context.shadowOffsetX = 3;
            context.shadowOffsetY = 3;
            context.shadowBlur = 1;
            context.drawImage(this.sprite.image,
                rect.x, rect.y,
                rect.width, rect.height,
                this.x - this.imgWidth / 2 + 2 , this.y - this.imgHeight / 2 + 2,
                this.imgWidth, this.imgHeight);
    	}
    }
}


class BattleObjectSpriteActor extends SpriteActor {
    constructor(x, y, imgURI, imgWidth, imgHeight = -1, tags = []) {
        const img = assets.get(imgURI);
        const sprite = new Sprite(img, new Rectangle(0, 0, img.width, img.height));
        const hitArea = new Rectangle(0, 0, 0, 0);
        super(x, y, sprite, hitArea, tags);

        this.count = 0;
        this.imgWidth = imgWidth;
        if(imgHeight === -1){
            this.imgHeight = Math.floor(imgWidth * img.height / img.width);
        }else{
        	this.imgHeight = imgHeight;
        }

        this.angle = 0;

        this.addEventListener('rotate', (e) => this.updateAngle());
    }

    updateAngle(){
    	this.angle += 45;
    	if(this.angle >= 360){
    		this.angle = 0;
    	}
    	console.log("rotate");
    }

    render(target) {
        const context = target.getContext('2d');
        context.beginPath();
        const rect = this.sprite.rectangle;
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;
        context.shadowBlur = 0;
        context.save();
        context.translate(this.x , this.y);
        context.rotate(this.angle/180*Math.PI);
        context.drawImage(this.sprite.image,
            rect.x, rect.y,
            rect.width, rect.height,
             - this.imgWidth / 2 , - this.imgHeight / 2 ,
            this.imgWidth, this.imgHeight);
        context.restore();
    }
    // render 継承
}

class TowerBattleTitleScene extends Scene {
    constructor(renderingTarget) {
        super('タイトル', 'aqua', renderingTarget);

        //TODO 配置をCanvasサイズで合わせる

        // logo x, y, img, width, height, floatSize, time
        const logo = new FloatingSpriteActor(200, 360, 'logo', 360, 7, 60);
        this.add(logo);

        // sun x, y, img, width, height, floatSize, time
        const sun = new FloatingSpriteActor(330, 70, 'sun', 120, 5, 95);
        this.add(sun);

        // kumo x, y, img, width, height, floatSize, time
        const kumo = new FloatingSpriteActor(170, 150, 'kumo', 300, 5, 95);
        this.add(kumo);

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


        //盤面
        //kusa x, y, img, width, floatSize, time
        const kusa = new BattleObjectSpriteActor(200, 590, 'kusa', 320, -1, ['target']);
        this.add(kusa);

        //jk1 x, y, img, width, floatSize, time
        const jk1 = new BattleObjectSpriteActor(200, 240, 'jk1', 50);
        this.add(jk1);



        //あとに描画されるもの
        //sun x, y, img, width, floatSize, time
        const sun = new FloatingSpriteActor(330, 70, 'sun', 120, 5, 95);
        this.add(sun);
        const turnButton = new ButtonObjectActor(200, 670, 240, 60 , "rotate", jk1);
        this.add(turnButton);
        const debugText = new DebugTextActor(0, 720, 'Main Frame:');
        this.add(debugText);
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

assets.addImage('sprite', 'assets/sprite.png');
assets.addImage('sun', 'assets/sun_yellow1.png');
assets.addImage('logo', 'assets/logo.png');
assets.addImage('kumo', 'assets/kumo.png');
assets.addImage('kusa', 'assets/kusa.png');
assets.addImage('jk1', 'assets/jk1.png');
assets.addImage('rotate', 'assets/rotate.png');
assets.loadAll().then((a) => {
    const game = new TowerBattleTitleGame();
    document.body.appendChild(game.screenCanvas);
    game.start();
});