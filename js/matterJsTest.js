var Engine = Matter.Engine,
Render = Matter.Render,
Runner = Matter.Runner,
World = Matter.World,
Bodies = Matter.Bodies;

//create engine
var engine = Engine.create(),  //物理演算エンジンを生成？
world = engine.world;  //重力の存在する仮想世界の生成…？

//create renderer
var render = Render.create({  //レンダリングの設定？
element: document.body,
engine: engine,
options: {
  width: 1000,  //ステージの横幅
  height: 1000,  //ステージの高さ
  background: '#FFFFFF',  //ステージの背景色
  wireframes: false  //ワイヤーフレームモードをオフ
}
});

Render.run(render);  //ステージを配置させる記述？

//create runner
var runner = Runner.create();
Runner.run(runner, engine);

var shikaku = Bodies.rectangle(500, 0, 100, 80);
var maru = Bodies.circle(200, 0, 50);
var yuka = Bodies.rectangle(400, 900, 800, 30, {isStatic: true});

World.add(world, [  //作成した図形をステージに追加して描画する？
    shikaku,
    maru,
    yuka
]);


function bodybody(){
	World.add(world, [Bodies.rectangle(500, 0, 100, 80), Bodies.circle(200, 0, 50)]);
	//Render.world(render);
	console.log(world);
}

function bodybodybody(){
	Matter.Runner.tick(runner, engine, 1000);
}

setInterval(bodybody, 150);

