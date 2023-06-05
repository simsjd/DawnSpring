function pixitest() {
	console.log("in pixitest.js");
	let app = new PIXI.Application({ width:640, height: 360});
	document.body.appendChild(app.view);
	let sprite = PIXI.Sprite.from('sample.png');
	app.stage.addChild(sprite);
}
