export class GsapSetup {
  constructor() {
    this.defaults = {
      ease: 'power3.out',
      duration: 1
    }
    this.timelines = new Map()
  }

  init() {
    gsap.defaults(this.defaults)

    // Register ScrollTrigger
    gsap.registerPlugin(ScrollTrigger)

    // Configure ScrollTrigger
    ScrollTrigger.defaults({
      scroller: window,
      toggleActions: 'play none none reverse'
    })
  }

  createTimeline(id, vars = {}) {
    const tl = gsap.timeline(vars)
    this.timelines.set(id, tl)
    return tl
  }

  getTimeline(id) {
    return this.timelines.get(id)
  }

  killTimeline(id) {
    const tl = this.timelines.get(id)
    if (tl) {
      tl.kill()
      this.timelines.delete(id)
    }
  }

  fromTo(el, fromVars, toVars, position) {
    return gsap.fromTo(el, fromVars, toVars, position)
  }

  to(el, vars, position) {
    return gsap.to(el, vars, position)
  }

  stagger(el, vars, staggerAmount = 0.1) {
    return gsap.fromTo(el,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, stagger: staggerAmount, ...vars }
    )
  }

  refresh() {
    ScrollTrigger.refresh()
  }
}
