import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Minimal mocks
class ResizeObserverMock {
  observe() { }
  unobserve() { }
  disconnect() { }
}
global.ResizeObserver = ResizeObserverMock

if (!global.PointerEvent) {
  // @ts-ignore
  global.PointerEvent = class PointerEvent extends Event { }
}

window.HTMLElement.prototype.scrollIntoView = vi.fn()
window.HTMLElement.prototype.hasPointerCapture = vi.fn()
window.HTMLElement.prototype.releasePointerCapture = vi.fn()

