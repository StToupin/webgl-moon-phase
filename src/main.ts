import './style.css';

import { initUserLocation } from './location';
import { initDateSelector } from './date';
import { updateScene, initScene } from './scene';

async function init(): Promise<void> {
  const scene = await initScene();
  initUserLocation({ onUpdate: () => updateScene(scene) });
  initDateSelector({ onChange: () => updateScene(scene) });
}

init();
