// this code is for devices with touch input for simulated hover effect.
const email = document.querySelector('#email')
const hoverToggle = document.querySelector('.hover-toggle')

hoverToggle?.addEventListener('click', () => {
  const isPressed = hoverToggle.getAttribute('aria-pressed') === 'true'
  hoverToggle.setAttribute('aria-pressed', String(!isPressed))
  email?.dispatchEvent(new MouseEvent(isPressed ? 'mouseleave' : 'mouseenter'))
})
