import { ThreeSetup } from './modules/three-setup.js'
import { SceneManager } from './modules/scene-manager.js'
import { InteractionManager } from './modules/interaction-manager.js'

import { CustomCursor } from './effects/cursor.js'
import { Parallax } from './effects/parallax.js'

import { Compass } from './navigation/compass.js'
import { Minimap } from './navigation/minimap.js'
import { KeyboardNav } from './navigation/keyboard.js'

import { CinematicLoader } from './components/loader.js'

import { SceneVoid } from './scenes/scene-void.js'
import { SceneOrigin } from './scenes/scene-origin.js'
import { SceneForest } from './scenes/scene-forest.js'
import { SceneGalaxy } from './scenes/scene-galaxy.js'
import { SceneLaboratory } from './scenes/scene-laboratory.js'
import { SceneSkills } from './scenes/scene-skills.js'
import { SceneTimeline } from './scenes/scene-timeline.js'
import { SceneContact } from './scenes/scene-contact.js'

class App {
  constructor() {
    this.threeSetup = null
    this.sceneManager = null
    this.interactionManager = null
    this.cursor = null
    this.parallax = null
    this.compass = null
    this.minimap = null
    this.keyboardNav = null
    this.loader = null
    this.lenis = null
    this.scenes = {}
    this.currentSceneId = null
    this.rafId = null
    this.isRunning = false
  }

  async init() {
    try {
      await this._initLoader()
      await this._initSmoothScroll()
      this._initThreeJS()
      this._initSceneManager()
      this._initInteraction()
      this._initScenes()
      this._initNavigation()
      this._initEffects()
      this._initAnimations()
      this._initEventListeners()
      this._startRenderLoop()
      this.isRunning = true
      this._onResize()
    } catch (err) {
      console.error('App initialization error:', err)
      this._showFallback()
    }
  }

  async _initLoader() {
    this.loader = new CinematicLoader()
    const loaderPromise = this.loader.init()

    gsap.set('.scene__content', { opacity: 0 })

    await loaderPromise

    gsap.to('.scene__content', {
      opacity: 1,
      duration: 1,
      ease: 'power3.out',
      stagger: 0.15
    })
  }

  _initSmoothScroll() {
    return new Promise((resolve) => {
      this.lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1.5,
        infinite: false
      })

      this.lenis.on('scroll', (e) => {
        this._onScroll(e)
        if (this.sceneManager) {
          this.sceneManager.update(e.scroll)
        }
      })

      gsap.ticker.add((time) => {
        this.lenis.raf(time * 1000)
      })

      gsap.ticker.lagSmoothing(0)

      setTimeout(resolve, 300)
    })
  }

  _initThreeJS() {
    this.threeSetup = new ThreeSetup('three-canvas-container')
    this.threeSetup.init()
  }

  _initSceneManager() {
    this.sceneManager = new SceneManager()
    const sceneElements = document.querySelectorAll('.scene')
    sceneElements.forEach((el) => {
      this.sceneManager.register(el.id, el)
    })
    this.sceneManager.init()

    this.sceneManager.onSceneChange = (index) => {
      this._onSceneChange(index)
    }
  }

  _initInteraction() {
    this.interactionManager = new InteractionManager()
    this.interactionManager.init()
  }

  _initScenes() {
    this.scenes.void = new SceneVoid(this.threeSetup)
    this.scenes.void.init()

    this.scenes.origin = new SceneOrigin(this.threeSetup)
    this.scenes.origin.init()

    this.scenes.forest = new SceneForest(this.threeSetup)
    this.scenes.forest.init()

    this.scenes.galaxy = new SceneGalaxy(this.threeSetup)
    this.scenes.galaxy.init()

    this.scenes.laboratory = new SceneLaboratory(this.threeSetup)
    this.scenes.laboratory.init()

    this.scenes.skills = new SceneSkills(this.threeSetup)
    this.scenes.skills.init()

    this.scenes.timeline = new SceneTimeline(this.threeSetup)
    this.scenes.timeline.init()

    this.scenes.contact = new SceneContact(this.threeSetup)
    this.scenes.contact.init()

    this.currentSceneId = 'void'
    this.scenes.void.activate()
  }

  _initNavigation() {
    this.compass = new Compass()
    this.compass.init()

    this.minimap = new Minimap()
    this.minimap.init()

    this.keyboardNav = new KeyboardNav()
    this.keyboardNav.init()
  }

  _initEffects() {
    this.cursor = new CustomCursor()
    this.cursor.init()

    this.parallax = new Parallax()
    this.parallax.init()
  }

  _initAnimations() {
    const originLines = document.querySelectorAll('.origin__line')
    originLines.forEach((line, i) => {
      gsap.set(line, { opacity: 0, y: 40 })
    })

    gsap.set('.origin__info', { opacity: 0, y: 20 })
    gsap.set('.origin__info-card', { opacity: 0, y: 20 })

    document.querySelectorAll('.timeline__milestone').forEach((el) => {
      gsap.set(el, { opacity: 0, x: -30 })
    })

    document.querySelectorAll('.lab__ui').forEach((el) => {
      gsap.set(el, { opacity: 0, y: 30 })
    })

    gsap.set('.contact__link', { opacity: 0, y: 20, scale: 0.8 })

    ScrollTrigger.refresh()
  }

  _initEventListeners() {
    window.addEventListener('resize', () => this._onResize())

    window.addEventListener('navigate', (e) => {
      const { scene } = e.detail
      if (this.sceneManager) {
        this.sceneManager.navigateTo(scene)
      }
    })

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (this.rafId) {
          cancelAnimationFrame(this.rafId)
          this.rafId = null
        }
      } else if (this.isRunning) {
        this._startRenderLoop()
      }
    })
  }

  _startRenderLoop() {
    const loop = () => {
      this.rafId = requestAnimationFrame(loop)
      this._update()
    }
    this.rafId = requestAnimationFrame(loop)
  }

  _update() {
    const time = this.threeSetup.getElapsedTime()

    const sceneKeys = Object.keys(this.scenes)
    sceneKeys.forEach((key) => {
      if (this.scenes[key]) {
        this.scenes[key].update(time)
      }
    })

    this.threeSetup.render()

    if (this.compass) {
      this.compass.update(this.sceneManager?.currentIndex || 0)
    }

    if (this.keyboardNav) {
      this.keyboardNav.update(this.sceneManager?.currentIndex || 0)
    }

    this._updateProgress()
  }

  _updateProgress() {
    const progressBar = document.getElementById('progressBar')
    const progressLabel = document.getElementById('progressLabel')

    if (progressBar && this.lenis) {
      const scroll = this.lenis.targetScroll || this.lenis.scroll || 0
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      const progress = Math.min(1, scroll / maxScroll)
      progressBar.style.width = `${progress * 100}%`
      if (progressLabel) {
        progressLabel.textContent = `${Math.round(progress * 100)}%`
      }
    }
  }

  _onScroll(e) {
    if (this.sceneManager) {
      const index = this.sceneManager.update(e.scroll)
    }
  }

  _onSceneChange(index) {
    const sceneIds = ['void', 'origin', 'forest', 'galaxy', 'laboratory', 'skills', 'timeline', 'contact']
    const newId = sceneIds[index]

    if (newId && newId !== this.currentSceneId) {
      if (this.scenes[this.currentSceneId]) {
        this.scenes[this.currentSceneId].deactivate()
      }

      this.currentSceneId = newId

      if (this.scenes[this.currentSceneId]) {
        this.scenes[this.currentSceneId].activate()
      }

      if (this.minimap) this.minimap.update(index)
      if (this.compass) this.compass.update(index)
      if (this.keyboardNav) this.keyboardNav.update(index)
    }
  }

  _onResize() {
    if (this.sceneManager) {
      this.sceneManager._recalc()
    }
    ScrollTrigger.refresh()
  }

  _showFallback() {
    document.getElementById('loader')?.classList.add('is-hidden')
    document.querySelectorAll('.scene__content').forEach((el) => {
      el.style.opacity = '1'
    })
  }
}

if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual'
}
window.scrollTo(0, 0)

document.addEventListener('DOMContentLoaded', () => {
  const app = new App()
  app.init()
})
