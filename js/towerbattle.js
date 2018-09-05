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
		this.count = 0;
		this.tm = 50;
	}

	// update 継承
	update(gameInfo, input){
	}

	render(target) {
		const context = target.getContext('2d');

		context.shadowOffsetX = 0;
		context.shadowOffsetY = 0;
		context.shadowBlur = 0;

		const px = 42;
		context.font = px.toString()+"px 'Century Gothic'";

		this.count = ++this.count%this.tm;
		const alpha = 0.6 + Math.min(this.count, this.tm - this.count)/100

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
		this.mouseMessage = "";
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
		this.mouseX = input.point.getX();
		this.mouseY = input.point.getY();
		this.mouseMessage = "X:" + this.mouseX.toString() + " Y:" + this.mouseY.toString();
	}

	render(target) {
		const context = target.getContext('2d');
		const px = 20;
		context.font = px.toString()+"px 'Century Gothic'";
		context.fillStyle = "rgba(0,0,0," + Math.round(this.alpha*0.5, 3).toString() +")";
		context.shadowOffsetX = 0;
		context.shadowOffsetY = 0;
		context.fillText(this.message, this.x, this.y - px/2);
		context.fillText(this.mouseMessage, this.x, this.y - px*3/2);

		context.beginPath();
		context.moveTo(this.mouseX, 0);
		context.lineTo(this.mouseX, target.height);
		context.moveTo(0, this.mouseY);
		context.lineTo(target.width, this.mouseY);
		context.closePath();
		context.strokeStyle = "rgba(0,0,0," + Math.round(this.alpha*0.5, 3).toString() +")";
		context.stroke();
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

		this.isGameover = false;
		this.isGameoverCount = 1;
	}

	update(gameInfo, input){
		if(this.isGameover){
			this.originY = this.originY + this.isGameoverCount++*0.3;
		}
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
}

class ButtonObjectActor extends SpriteActor{
	constructor(x, y, width, height, label, tags=[]) {
		const img = assets.get(label);
		const sprite = new Sprite(img, new Rectangle(0, 0, img.width, img.height));
		const hitArea = new Rectangle(x, y, x + width, y + height);
		super(x, y, sprite, hitArea, tags);

		this.label = label;

		this.width = width;
		this.height = height;
		this.isPush = false;

		this.imgWidth = width;
		this.imgHeight = Math.floor(this.imgWidth * img.height / img.width);
		this.isEnabled = true;

		this.isGameover = false;
		this.isGameoverCount = 1;
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
		if(this.isGameover){
			this.y = this.y + this.isGameoverCount++*0.1;
		}

		if(input.getMouseDown() && this.isEnabled && this.isInBounds(input.point)){
			this.isPush = true;
		}else if(input.getMouseUp() && this.isEnabled){
			if(this.isPush == true && this.isInBounds(input.point)){
				gameInfo.currentScene.dispatchEvent(this.label, new GameEvent(this));
			}
			this.isPush = false;
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

class MatterGameEvent extends GameEvent {
	constructor(target, imgId ,point, angle, imgWidth, imgHeight){
		super(target);
		this.point = point;
		this.imgId = imgId;
		this.angle = angle;
		this.width = imgWidth;
		this.height = imgHeight;
	}
}

class MatterActor extends Actor{
	constructor(target){
		super(0, 0, new Rectangle,  []);

		this.target = target;

		this.engine = Matter.Engine.create();
		this.world = this.engine.world;

		this.render2 = Matter.Render.create({
			element: this.target,
			engine: this.engine,
			options: {
				wireframes: false,
			}
		});

		this.runner = Matter.Runner.create();
		Matter.Runner.run(this.runner, this.engine);
		this.count = 0;

		Shape.kusa.position = {x : this.target.width*0.475 , y : this.target.height*0.80 };
		const kusa = Matter.Body.create(Shape.kusa);
		Matter.Body.scale(kusa, Shape.kusaScale, Shape.kusaScale);
		Matter.World.add(this.world, [kusa]);

		//this.addEventListener('addTarget', (e) => this.add(e));
		this.debug = false;
	}

	update(gameInfo, input) {
		if(this.count%20 === 0){
			//const maru = Matter.Bodies.rectangle(400, 0, 30, 50);
			//const maru = Matter.Bodies.circle(400, 0, 12);
			//Matter.World.add(this.world, [maru]);
		}

		if(this.count == -1){
			const jk1 = Matter.Body.create(Shape.jk1);
			Matter.Body.scale(jk1, Shape.jk1Scale, Shape.jk1Scale);
			const jk2 = Matter.Body.create(Shape.jk2);
			Matter.Body.scale(jk2, Shape.jk2Scale, Shape.jk2Scale);
			Matter.World.add(this.world, [jk1, jk2]);
		}

		if(input.getKeyDown(' ')) {
			//this.engine.enableSleeping = !this.engine.enableSleeping;
			this.debug = !this.debug;
		}
		if(input.getKeyDown('Enter')) {
			this.render2.options.wireframes = !this.render2.options.wireframes;
		}

		this.count++;
	}

	render(target) {
		const bodies = this.world.bodies;
		const context = target.getContext('2d');
		const render = this.render2;
		const options = this.render2.options;
		const engine = this.render2.engine;

		context.shadowOffsetX = 2;
		context.shadowOffsetY = 2;
		context.shadowBlur = 3;

		Matter.Render.bodies(this.render2, bodies, context);
		if(this.debug){

			//Matter.Render.world(this.render2);

			//Matter.Render.bodyBounds(render, bodies, context);

			//Matter.Render.bodyAxes(render, bodies, context);

			Matter.Render.bodyPositions(render, bodies, context);

			Matter.Render.bodyVelocity(render, bodies, context);

			//Matter.Render.bodyIds(render, bodies, context);

			Matter.Render.separations(render, engine.pairs.list, context);

			Matter.Render.collisions(render, engine.pairs.list, context);

			//Matter.Render.vertexNumbers(render, bodies, context);

			//Matter.Render.mousePosition(render, render.mouse, context);

			//Matter.Render.grid(render, engine.broadphase, context);

			//Matter.Render.debug(render, context);

			//Matter.Render.endViewTransform(render);
		}

	}

	add(event){
		const point = event.point,id = event.imgId, angle = event.angle, width = event.width, height = event.height;
		Shape.imgArray[id].position = {x : point.getX() , y : 200 };
		const tg = Matter.Body.create(Shape.imgArray[id]);

		//jk1.angle = this.angle/180*Math.PI;
		Matter.World.add(this.world, [tg]);

		//から追加位置への調整
		const originVector = Matter.Vector.create(tg.position.x, tg.position.y);
		const zureX = (0.5 - tg.render.sprite.xOffset) * width;
		const zureY = (0.5 - tg.render.sprite.yOffset) * height;

		const pos = Matter.Vector.create(zureX, zureY);
		const pos2 = Matter.Vector.rotate(pos, angle*Math.PI/180);
		const pos3 = Matter.Vector.sub(originVector, pos2);

		Matter.Body.setPosition(tg, pos3);
		Matter.Body.scale(tg, Shape.imgArray[id].originScale, Shape.imgArray[id].originScale);
		Matter.Body.rotate(tg, angle*Math.PI/180);
	}

	isInBound(){
		const bodies = this.world.bodies;
		for (var i = 0; i < bodies.length; i++) {
			const body = bodies[i];
			if(body.position.y > this.target.height){
				return false;
			}
		}
		return true;
	}

	breakBodies(){
		const bodies = this.world.bodies;
		for (var i = 0; i < bodies.length; i++) {
			const body = bodies[i];
			Matter.Body.setStatic(body,false);
		}
	}
}

class BattleObjectSpriteActor extends SpriteActor {
	constructor(x, y, tags = []) {
		tags.push('target');
		const num = Math.floor( Math.random() * Shape.imgArray.length ) ;
		const img = assets.get(Shape.imgArray[num].label);
		const sprite = new Sprite(img, new Rectangle(0, 0, img.width, img.height));
		const hitArea = new Rectangle(0, 0, 0, 0);
		super(x, y, sprite, hitArea, tags);

		this.count = 0;
		this.imgId = num;

		this.imgWidth = img.width * Shape.imgArray[num].originScale;
		this.imgHeight = Math.floor(this.imgWidth * img.height / img.width);

		this.angle = 0;
		this.addEventListener('rotate', (e) => this.updateAngle());
	}

	updateAngle(){
		this.angle += 45;
		if(this.angle >= 360){
			this.angle = 0;
		}
	}

	isInBounds(point) {
		const actorLeft = this.x - this.imgWidth / 2;
		const actorRight = this.x + this.imgWidth / 2;
		const actorTop = this.y - this.imgHeight / 2;
		const actorBottom = this.y + this.imgHeight / 2;
		const horizontal = (actorLeft < point.getX() && point.getX() < actorRight);
		const vertical = (actorTop < point.getY() && point.getY() < actorBottom);
		return (horizontal && vertical);
	}

	update(gameInfo, input) {
		if(this.isPush == true){
			this.x = input.point.getX();
		}
		if(input.getMouseDown() && this.isInBounds(input.point)){
			this.isPush = true;
		}else if(input.getMouseUp() && this.isPush == true){
			this.isPush = false;
			this.addMatterGameEvent(gameInfo.currentScene, input.point);
		}
	}

	addMatterGameEvent(scene, point = null){
		scene.dispatchEvent('addTarget', this.getMatterGameEvent(point));
		this.destroy();
	}

	addMatterGameEventTimeOut(scene, point = null){
		scene.dispatchEvent('addTargetTimeOut', this.getMatterGameEvent(point));
		this.destroy();
	}

	getMatterGameEvent(point){
		if(point == null){
			point = new Point(this.x, this.y);
		}
		return new MatterGameEvent(this, this.imgId, point, this.angle, this.imgWidth, this.imgHeight);
	}

	setRadAndColor(angleRemain){
		this.angleRemain = angleRemain;
		if(0 <= this.angleRemain*360 && this.angleRemain*360 < 90){
			this.indColor = 'rgba(255,0,0,'+((1 - angleRemain)*3/2).toString()+')';
		}else if(90 <= this.angleRemain*360 && this.angleRemain*360 < 180){
			this.indColor = 'rgba(255,255,0,'+((1 - angleRemain)*3/2).toString()+')';
		}else{
			this.indColor = 'rgba(0,0,255,'+((1 - angleRemain)*3/2).toString()+')';
		}
	}

	render(target) {
		const context = target.getContext('2d');

		context.beginPath();
		context.arc(this.x, this.y, 50 + this.angleRemain*360/5 , (270-this.angleRemain*360)*Math.PI/180, 270*Math.PI/180,  false);
		context.strokeStyle = this.indColor;
		context.lineWidth = 5;
		context.stroke();

		context.beginPath();
		const rect = this.sprite.rectangle;
		context.shadowOffsetX = 2;
		context.shadowOffsetY = 2;
		context.shadowBlur = 3;
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

class FirstGamePhase extends GamePhase{
	constructor(startFrame, parentScene) {
		super(startFrame,parentScene);
		this.phaseID = 0;
		//console.log("FirstGamePhase");

		this.startActor = this.parentScene._addFloatingSpriteActor(0.49, 0.5, 400, 'start');

		this.givenFrame = 120;
	}

	update(gameInfo,input){
		const minY = Math.ceil((this.renderingTarget.height + this.startActor.imgHeight) / this.givenFrame);
		if(this.currentFrame - this.startFrame > this.givenFrame / 2){
			this.startActor.originY -= minY;
		}

		this.currentFrame++;
		if(this.currentFrame - this.startFrame < this.givenFrame){
			return this;
		}

		//end
		this.destroy();
		return new PlayGamePhase(this.currentFrame, this.parentScene);
	}

	destroy(){
		this.startActor.destroy();
	}
}

class PlayGamePhase extends GamePhase{
	constructor(startFrame, parentScene) {
		super(startFrame,parentScene);
		this.phaseID = 1;
		//console.log("PlayGamePhase");

		this.givenFrame = 480;

		this.target = null;
		if(!parentScene.hasTagActor('target')){
			this.target = new BattleObjectSpriteActor(200, 200)
			parentScene.add(this.target);
		}

	}

	update(gameInfo,input){
		this.currentFrame++;

		this.target.setRadAndColor((this.givenFrame + this.startFrame - this.currentFrame) / this.givenFrame);

		if(this.currentFrame - this.startFrame < this.givenFrame){
			return this;
		}

		//end
		this.parentScene.searchTarget().addMatterGameEventTimeOut(this.parentScene);
		return new MatterGamePhase(this.currentFrame, this.parentScene);
	}

	destroy(){

	}
}

class MatterGamePhase extends GamePhase{
	constructor(startFrame, parentScene) {
		super(startFrame,parentScene);
		this.phaseID = 2;
		//console.log("MatterGamePhase");

		this.givenFrame = 180;
	}


	update(gameInfo,input){
		this.currentFrame++;
		if(this.currentFrame - this.startFrame < this.givenFrame){
			return this;
		}

		//end
		this.destroy();
		return new PlayGamePhase(this.currentFrame, this.parentScene);
	}

	destroy(){

	}
}

class OverGamePhase extends GamePhase{
	constructor(startFrame, parentScene) {
		super(startFrame,parentScene);
		this.phaseID = 3;
		//console.log("OverGamePhase");

		this.endActor = this.parentScene._addFloatingSpriteActor(0.49, -0.1, 390, 'end');

		this.givenFrame = 180;
	}


	update(gameInfo,input){
		this.currentFrame++;

		//const minY = Math.ceil((this.renderingTarget.height + this.endActor.imgHeight) / this.givenFrame);
		const minY = 1;
		this.endActor.originY = Math.min(this.renderingTarget.height * 0.5,
		this.endActor.originY + minY * (this.currentFrame - this.startFrame)**2 *0.02);

		if(this.currentFrame - this.startFrame == 120){
			this.button1 = this.parentScene._addButtonObjectActor(0.5, 0.73, 240, 60, "restart");
			this.button2 = this.parentScene._addButtonObjectActor(0.5, 0.85, 240, 60, "title");
		}
		return this;
	}

	destroy(){
		this.endActor.destroy();
	}
}

class TowerBattleMainScene extends Scene {
	constructor(renderingTarget) {
		super('メイン', 'aqua', renderingTarget);
		//盤面

		const width = renderingTarget.width, height = renderingTarget.height;

		const matterActor = new MatterActor(renderingTarget);
		this.add(matterActor);
		this.matterActor = matterActor;

		//あとに描画されるもの
		//sun x, y, img, width, floatSize, time
		//const sun = new FloatingSpriteActor(width*0.8, height*0.09, 'sun', 120, 5, 95);
		//this.add(sun);
		this.sun = this._addFloatingSpriteActor(0.8, 0.09, 120, 'sun');

		//const turnButton = new ButtonObjectActor(width*0.5, height*0.93, 240, 60 , "rotate");
		//this.add(turnButton);
		this.button = this._addButtonObjectActor(0.5, 0.93, 240, 60, "rotate");

		const debugText = new DebugTextActor(10, height-10, 'Main Frame:');
		this.add(debugText);

		this.phase = new FirstGamePhase(0, this);

		this.addEventListener('rotate', (e) => this._rotateTarget());
		this.addEventListener('addTarget', (e) => {
				const x = this.phase;
				this.phase = new MatterGamePhase(this.phase.currentFrame, this.phase.parentScene);
				x.destroy();
				matterActor.add(e);
			}
		);

		this.addEventListener('addTargetTimeOut', (e) => matterActor.add(e));
		this.addEventListener('gameover', (e) => {
				const x = this.phase;
				this.phase = new OverGamePhase(x.currentFrame, x.parentScene);
				x.destroy();
				this.gameover();
			}
		);
		this.addEventListener('title', (e) => {
			const scene = new TowerBattleTitleScene(this.renderingTarget);
            this.changeScene(scene);
		});

		this.addEventListener('restart', (e) => {
			const scene = new TowerBattleMainScene(this.renderingTarget);
            this.changeScene(scene);
		});
	}

	update(gameInfo, input) {
		this.phase = this.phase.update();

		if(!this.matterActor.isInBound() && !(this.phase instanceof OverGamePhase)){
			this.dispatchEvent('gameover', new GameEvent(this));
		}

		super.update(gameInfo, input);
	}

	_rotateTarget(){
		const targetObj = this.searchTarget();
		if(targetObj == null) return;
		targetObj.updateAngle();
	}

	searchTarget(){
		const length = this.actors.length;
		for(let i=0; i < length; i++) {
			const obj = this.actors[i];
			if(obj.hasTag('target')){
				return obj;
			}
		}
		return null;
	}

	_addFloatingSpriteActor(x, y, size, label){
		// kumo x, y, img, width, height, floatSize, time
		const width = this.renderingTarget.width, height = this.renderingTarget.height;
		const actor = new FloatingSpriteActor(width*x , height*y, label , size, 5, 95);
		this.add(actor);
		return actor;
	}

	_addButtonObjectActor(x, y, width, height, label){
		// kumo x, y, img, width, height, floatSize, time
		const tWidth = this.renderingTarget.width, tHeight = this.renderingTarget.height;
		const actor = new ButtonObjectActor(tWidth*x , tHeight*y, width, height, label);
		this.add(actor);
		return actor;
	}

	gameover(){
		const tar = this.searchTarget();
		if(tar != null) tar.destroy();
		this.matterActor.breakBodies();
		this.button.isEnabled = false;
		this.button.isGameover = true;
		this.sun.isGameover = true;
	}
}

class TowerBattleTitleScene extends Scene {
	constructor(renderingTarget) {
		super('タイトル', 'aqua', renderingTarget);

		const width = renderingTarget.width, height = renderingTarget.height;

		// logo x, y, img, width, height, floatSize, time
		const logo = new FloatingSpriteActor(width*0.49, height*0.5, 'logo', 360, 7, 60);
		this.add(logo);

		// sun x, y, img, width, height, floatSize, time
		const sun = new FloatingSpriteActor(width*0.8, height*0.09, 'sun', 120, 5, 95);
		this.add(sun);

		// kumo x, y, img, width, height, floatSize, time
		const kumo = new FloatingSpriteActor(width*0.35 , height*0.22, 'kumo', 300, 5, 95);
		this.add(kumo);

		const start = new StartTextActor(width*0.5, height*0.85, '>>  START  <<');
		this.add(start);

		const sceneFrame = new DebugTextActor(10, height-10, 'Title Frame:');
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
assets.addImage('rotate', 'assets/rotate.png');
assets.addImage('restart', 'assets/restart.png');
assets.addImage('title', 'assets/title.png');
assets.addImage('start', 'assets/start.png');
assets.addImage('end', 'assets/end.png');

assets.addImage('jk1', 'kirinuki/jk1.png');
assets.addImage('jk2', 'kirinuki/fjwr.png');
assets.addImage('kusa', 'kirinuki/kusa.png');

assets.loadAll().then((a) => {
	const game = new TowerBattleTitleGame();
	document.body.appendChild(game.screenCanvas);
	game.start();
});