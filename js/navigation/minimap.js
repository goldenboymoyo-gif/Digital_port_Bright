export class Minimap {
  constructor() {
    this.dots = document.querySelectorAll('.nav__minimap-dot')
    this.indicators = document.querySelectorAll('.scene-indicators__item')
    this.currentScene = 0
  }

  init() {
    this.dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        window.dispatchEvent(new CustomEvent('navigate', { detail: { scene: i } }))
      })
    })

    this.indicators.forEach((indicator, i) => {
      indicator.addEventListener('click', () => {
        window.dispatchEvent(new CustomEvent('navigate', { detail: { scene: i } }))
      })
    })
  }

  update(sceneIndex) {
    this.currentScene = sceneIndex

    this.dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === sceneIndex)
    })

    this.indicators.forEach((indicator, i) => {
      indicator.classList.toggle('active', i === sceneIndex)
    })
  }
}
