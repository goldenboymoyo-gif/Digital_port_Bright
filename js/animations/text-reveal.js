export class TextReveal {
  constructor() {
    this.animations = []
    this.splitTexts = new Map()
  }

  init() {
    // Auto-reveal elements with .reveal class
    document.querySelectorAll('.reveal').forEach((el, i) => {
      this.animate(el, {
        delay: i * 0.1,
        trigger: el.dataset.trigger || undefined
      })
    })
  }

  animate(el, options = {}) {
    const config = {
      delay: options.delay || 0,
      duration: options.duration || 0.8,
      ease: options.ease || 'power3.out',
      y: options.y || 30,
      trigger: options.trigger || null,
      ...options
    }

    let trigger = config.trigger ? document.querySelector(config.trigger) : el

    const anim = gsap.fromTo(el,
      { opacity: 0, y: config.y },
      {
        opacity: 1,
        y: 0,
        duration: config.duration,
        delay: config.delay,
        ease: config.ease,
        scrollTrigger: trigger ? {
          trigger: trigger,
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        } : undefined
      }
    )

    this.animations.push(anim)
    return anim
  }

  splitText(selector, options = {}) {
    const elements = document.querySelectorAll(selector)
    const config = {
      type: options.type || 'chars',
      stagger: options.stagger || 0.02,
      duration: options.duration || 0.6,
      ease: options.ease || 'power2.out'
    }

    elements.forEach(el => {
      const text = el.textContent
      const chars = text.split('')
      el.innerHTML = ''
      el.style.opacity = '1'

      const spans = []
      chars.forEach((char, i) => {
        const span = document.createElement('span')
        span.textContent = char === ' ' ? '\u00A0' : char
        span.style.display = 'inline-block'
        span.style.opacity = '0'
        span.style.transform = 'translateY(20px)'
        el.appendChild(span)
        spans.push(span)
      })

      this.splitTexts.set(el, spans)

      gsap.to(spans, {
        opacity: 1,
        y: 0,
        duration: config.duration,
        stagger: config.stagger,
        ease: config.ease,
        scrollTrigger: {
          trigger: el,
          start: 'top 85%'
        }
      })
    })
  }

  typewrite(el, text, options = {}) {
    const speed = options.speed || 50
    const delay = options.delay || 0
    let index = 0
    el.textContent = ''

    setTimeout(() => {
      const interval = setInterval(() => {
        if (index < text.length) {
          el.textContent += text[index]
          index++
        } else {
          clearInterval(interval)
          if (options.onComplete) options.onComplete()
        }
      }, speed)
    }, delay)
  }

  refresh() {
    ScrollTrigger.refresh()
  }
}
