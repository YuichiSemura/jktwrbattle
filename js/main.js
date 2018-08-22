'use strict';

class TowerBattleMainScene extends Scene {
    constructor(renderingTarget) {
        super('メイン', 'aqua', renderingTarget);

　　　　//sun x, y, img, width, height, floatSize, time
        const sun = new FloatingSpriteActor(300, 100, 'sun', 120, 120, 5, 95);
        this.add(sun);

        const sceneFrame = new SceneFrameTextActor(10, 710, 'Main Frame:');
        this.add(sceneFrame);
    }

    update(gameInfo, input) {
        super.update(gameInfo, input);
    }
}
