// Touch controller that provides a virtual joystick for mobile play
// Reads touch input and stores it in a global for the game loop to access

let touchState = { dx: 0, dy: 0, active: false }

export function getTouchInput() {
  return touchState
}

export function initTouchControls() {
  if (typeof window === 'undefined') return () => {}

  const joystick = document.getElementById('touch-joystick')
  if (!joystick) return () => {}

  let touchId = null
  let startX = 0
  let startY = 0
  let currentDx = 0
  let currentDy = 0

  const joystickKnob = document.getElementById('touch-joystick-knob')
  const joystickBase = document.getElementById('touch-joystick-base')

  const JOYSTICK_MAX = 40

  function updateJoystickVisual(dx, dy) {
    if (!joystickKnob) return
    const length = Math.sqrt(dx * dx + dy * dy)
    const clampedLength = Math.min(length, 1)
    const angle = Math.atan2(dy, dx)
    const knobX = Math.cos(angle) * clampedLength * JOYSTICK_MAX
    const knobY = Math.sin(angle) * clampedLength * JOYSTICK_MAX
    joystickKnob.style.transform = `translate(${knobX}px, ${knobY}px)`
  }

  function handleTouchStart(e) {
    if (touchId !== null) return
    const touch = e.changedTouches[0]
    touchId = touch.identifier
    startX = touch.clientX
    startY = touch.clientY
    if (joystickBase) joystickBase.style.opacity = '1'
    e.preventDefault()
  }

  function handleTouchMove(e) {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i]
      if (touch.identifier !== touchId) continue

      const dx = touch.clientX - startX
      const dy = touch.clientY - startY

      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
        currentDx = dx / 80
        currentDy = dy / 80

        const mag = Math.sqrt(currentDx * currentDx + currentDy * currentDy)
        if (mag > 1) {
          currentDx /= mag
          currentDy /= mag
        }

        updateJoystickVisual(currentDx, currentDy)
      }
      e.preventDefault()
    }
  }

  function handleTouchEnd(e) {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i]
      if (touch.identifier !== touchId) continue
      touchId = null
      currentDx = 0
      currentDy = 0
      updateJoystickVisual(0, 0)
      if (joystickBase) joystickBase.style.opacity = '0.5'
    }
  }

  // Update global touch state every frame
  function updateState() {
    touchState = { dx: currentDx, dy: currentDy, active: touchId !== null }
    rafId = requestAnimationFrame(updateState)
  }

  let rafId = requestAnimationFrame(updateState)

  joystick.addEventListener('touchstart', handleTouchStart, { passive: false })
  joystick.addEventListener('touchmove', handleTouchMove, { passive: false })
  joystick.addEventListener('touchend', handleTouchEnd, { passive: false })
  joystick.addEventListener('touchcancel', handleTouchEnd, { passive: false })

  return () => {
    cancelAnimationFrame(rafId)
    joystick.removeEventListener('touchstart', handleTouchStart)
    joystick.removeEventListener('touchmove', handleTouchMove)
    joystick.removeEventListener('touchend', handleTouchEnd)
    joystick.removeEventListener('touchcancel', handleTouchEnd)
    touchState = { dx: 0, dy: 0, active: false }
  }
}