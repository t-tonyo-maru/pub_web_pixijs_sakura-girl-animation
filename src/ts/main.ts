import 'pixi-spine'

import * as PIXI from 'pixi.js'
import { Spine } from 'pixi-spine'
import { GodrayFilter } from '@pixi/filter-godray'
import GUI from 'lil-gui'

// types
type Sakura = {
  sprite: PIXI.Sprite
  speed: number
  positionPhase: number
  scalePhase: number
  rotationSpeed: number
}

// consts
const MAX_PARTICLE_COUNT = 100
// coefficient
const SCALE_PHASE_COEFFICIENT = 0.16
const POSITOIN_PHASE_COEFFICIENT = 3
// assets url
const assetsUrl =
  process.env.NODE_ENV === 'production'
    ? '/pub_web_pixijs_sakura-girl-animation/assets'
    : '/assets'
// sort children flag
let isSakuraFront = true
let spineAnimationHeight = 0

// Links
// - https://pixijs.com/examples/basic/particle-container?_highlight=parti
// - https://ja.esotericsoftware.com/forum/d/17094-unity%E3%81%AE%E3%83%9E%E3%83%86%E3%83%AA%E3%82%A2%E3%83%AB%E3%81%AB%E3%82%88%E3%81%A3%E3%81%A6%E3%83%91%E3%83%BC%E3%83%84%E3%81%AE%E8%BC%AA%E9%83%AD%E7%B7%9A%E3%81%8C%E6%B5%AE%E3%81%8D%E4%B8%8A%E3%81%8C%E3%81%A3%E3%81%A6%E3%81%97%E3%81%BE%E3%81%86/3

window.onload = async () => {
  const pixelRatio = window.devicePixelRatio || 1
  const app = new PIXI.Application({
    antialias: true,
    autoDensity: true,
    background: '#000',
    resizeTo: window,
    resolution: pixelRatio / 1
  })
  const pixiWrapper = document.querySelector('.pixi') as HTMLElement
  pixiWrapper.appendChild(app.view as HTMLCanvasElement)

  // background
  const aspectRatio = app.screen.width / app.screen.height
  const background = PIXI.Sprite.from(`${assetsUrl}/images/background.jpg`)
  background.anchor.set(0.5)
  background.position.set(app.screen.width / 2, app.screen.height / 2)
  background.scale.set(aspectRatio >= 1 ? aspectRatio : 1 / aspectRatio)

  // sakura particle
  const particleContainer = new PIXI.ParticleContainer(MAX_PARTICLE_COUNT, {
    scale: true,
    position: true,
    rotation: true,
    uvs: true,
    alpha: true
  })
  const partilces: Sakura[] = []
  const sakuraTexture = PIXI.Texture.from(
    `${assetsUrl}/images/sakura_hanabira.png`
  )
  for (let i = 0; i < MAX_PARTICLE_COUNT; i++) {
    const scalePhase = Math.random() * Math.PI * 2

    const sakuraSprite = PIXI.Sprite.from(sakuraTexture)
    sakuraSprite.anchor.set(0.5)
    sakuraSprite.scale.set(
      Math.cos(Date.now() / 1000 + scalePhase) * SCALE_PHASE_COEFFICIENT,
      Math.sin(Date.now() / 1000 + scalePhase) * SCALE_PHASE_COEFFICIENT
    )
    sakuraSprite.position.set(
      Math.random() * app.screen.width,
      Math.random() * app.screen.height
    )
    sakuraSprite.rotation = Math.random() * Math.PI * 2

    partilces.push({
      sprite: sakuraSprite,
      speed: Math.random() * 2 + randRange(0.1, 1), // random speed
      rotationSpeed: Math.random() * 0.01, // random rotation speed
      positionPhase: Math.random() * Math.PI * 2, // random position phase
      scalePhase // random scale
    })
    particleContainer.addChild(partilces[i].sprite)
  }

  // spineAnimation
  const spineAnimation = await PIXI.Assets.load(
    `${assetsUrl}/spine-data/model.json`
  )
    .then((res) => {
      const animation = new Spine(res.spineData)

      // position.set
      animation.x = app.screen.width / 2
      animation.y = app.screen.height + 2 // TIPS: +2 is to hide mistake in Spine Animation

      // animation set
      animation.state.setAnimation(0, 'idle', true)
      animation.state.setAnimation(1, 'bright', true)
      animation.state.setAnimation(2, 'blink', true)

      // initial height
      spineAnimationHeight = animation.height

      // fix scale
      const scaleRatio = 1 / (spineAnimationHeight / (app.screen.height * 0.8))
      animation.scale.set(scaleRatio >= 1 ? 1 : scaleRatio)

      return animation
    })
    .catch((err) => {
      console.log(err)
    })

  // godray filter
  const godrayParameter = {
    gain: 0.6,
    lacunarity: 2.75,
    alpha: 1,
    parallel: true,
    angle: 30,
    center: new PIXI.Point(100, -100)
  }
  const godrayFilter = new GodrayFilter(godrayParameter)

  // container
  const container = new PIXI.Container()
  container.sortableChildren = true
  container.filters = [godrayFilter]

  container.addChild(background as PIXI.DisplayObject)
  container.addChild(particleContainer as PIXI.DisplayObject)
  container.addChild(spineAnimation as PIXI.DisplayObject)
  app.stage.addChild(container as PIXI.DisplayObject)

  // zIndex sort
  if (spineAnimation) spineAnimation.zIndex = 1
  particleContainer.zIndex = 2

  // lil-gui
  // - https://lil-gui.georgealways.com/
  const gui = new GUI()
  const guiObject = {
    godrayParameter: {
      show: true,
      gain: godrayParameter.gain,
      lacunarity: godrayParameter.lacunarity,
      alpha: godrayParameter.alpha,
      parallel: godrayParameter.parallel,
      angle: godrayParameter.angle,
      center: {
        x: godrayParameter.center.x,
        y: godrayParameter.center.y
      }
    },
    sakuraParameters: {
      show: true
    },
    spineParameters: {
      action: true
    },
    sortParameters: {
      isSakuraFront: isSakuraFront
    }
  }
  // paramter
  const godrayFilterFolder = gui.addFolder('godray filter')
  godrayFilterFolder.add(guiObject.godrayParameter, 'show')
  godrayFilterFolder.add(guiObject.godrayParameter, 'gain', 0, 1, 0.001)
  godrayFilterFolder.add(guiObject.godrayParameter, 'lacunarity', 0, 5, 0.001)
  godrayFilterFolder.add(guiObject.godrayParameter, 'alpha', 0, 1, 0.001)
  godrayFilterFolder.add(guiObject.godrayParameter, 'parallel')
  godrayFilterFolder.add(guiObject.godrayParameter, 'angle', -60, 60, 0.01)
  godrayFilterFolder.add(
    guiObject.godrayParameter.center,
    'x',
    -100,
    1060,
    0.01
  )
  godrayFilterFolder.add(
    guiObject.godrayParameter.center,
    'y',
    -1000,
    -100,
    0.01
  )
  const sakuraFolder = gui.addFolder('sakura')
  sakuraFolder.add(guiObject.sakuraParameters, 'show')
  const spineFolder = gui.addFolder('spine')
  spineFolder.add(guiObject.spineParameters, 'action')
  const sortParametersFolder = gui.addFolder('sort')
  sortParametersFolder.add(guiObject.sortParameters, 'isSakuraFront')

  // animation
  app.ticker.add((delta) => {
    // gui
    // gui: godray filter
    if (guiObject.godrayParameter.show) {
      godrayFilter.alpha = 1
      godrayFilter.time += 0.01

      godrayFilter.gain = guiObject.godrayParameter.gain
      godrayFilter.lacunarity = guiObject.godrayParameter.lacunarity
      godrayFilter.alpha = guiObject.godrayParameter.alpha
      godrayFilter.parallel = guiObject.godrayParameter.parallel
      godrayFilter.angle = guiObject.godrayParameter.angle
      godrayFilter.center = new PIXI.Point(
        guiObject.godrayParameter.center.x,
        guiObject.godrayParameter.center.y
      )
    } else {
      godrayFilter.alpha = 0
    }

    // gui: sakura filter
    particleContainer.alpha = guiObject.sakuraParameters.show ? 1 : 0

    // update sakura particle
    for (let i = particleContainer.children.length - 1; i >= 0; i--) {
      const sakura = particleContainer.children[i] as PIXI.Sprite
      // x
      sakura.position.x +=
        Math.sin(Date.now() / 1000 + partilces[i].positionPhase) *
        POSITOIN_PHASE_COEFFICIENT // calc phase
      // y
      sakura.position.y += partilces[i].speed
      // rotation
      sakura.rotation += partilces[i].rotationSpeed
      // scale
      sakura.scale.set(
        Math.cos(Date.now() / 1000 + partilces[i].scalePhase) *
          SCALE_PHASE_COEFFICIENT,
        Math.sin(Date.now() / 1000 + partilces[i].scalePhase) *
          SCALE_PHASE_COEFFICIENT
      )

      // if sakura exceed the screen width
      if (sakura.position.x < 0) {
        sakura.position.x = app.screen.width
      } else if (sakura.position.x > app.screen.width) {
        sakura.position.x = 0
      }

      // if sakura exceed the screen bottom line
      if (sakura.position.y - sakura.height > app.screen.height) {
        sakura.position.y = sakura.height * -1
      }
    }

    // gui: spine animation
    if (spineAnimation) {
      if (guiObject.spineParameters.action) {
        if (spineAnimation.state.timeScale !== 1) {
          spineAnimation.state.timeScale = 1
        }
      } else {
        spineAnimation.state.timeScale = 0
      }
    }

    // gui: zIndex sort
    if (guiObject.sortParameters.isSakuraFront !== isSakuraFront) {
      isSakuraFront = guiObject.sortParameters.isSakuraFront

      if (isSakuraFront) {
        if (spineAnimation) spineAnimation.zIndex = 1
        particleContainer.zIndex = 2
      } else {
        if (spineAnimation) spineAnimation.zIndex = 2
        particleContainer.zIndex = 1
      }
    }
  })

  // resize
  let timer = 0
  window.addEventListener('resize', () => {
    if (timer > 0) {
      clearTimeout(timer)
    }
    timer = window.setTimeout(() => {
      const aspectRatio = app.screen.width / app.screen.height

      // background
      background.position.set(app.screen.width / 2, app.screen.height / 2)
      background.scale.set(aspectRatio >= 1 ? aspectRatio : 1 / aspectRatio)

      // spine animation
      if (spineAnimation) {
        spineAnimation.x = app.screen.width / 2
        spineAnimation.y = app.screen.height + 2

        // fix scale
        const scaleRatio =
          1 / (spineAnimationHeight / (app.screen.height * 0.8))
        spineAnimation.scale.set(scaleRatio >= 1 ? 1 : scaleRatio)
      }
    }, 0.5 * 1000)
  })
}

/****
 * get random number between arg's min and arg's max
 * @param {number} - min: min number
 * @param {number} - max: max number
 */
const randRange = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1) + min)
}
