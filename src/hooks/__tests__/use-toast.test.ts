import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { reducer } from '../use-toast'

describe('useToast reducer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  it('adds a toast', () => {
    const state = { toasts: [] as any[] }
    const toast = { id: '1', title: 'Hello', open: true }
    const newState = reducer(state, { type: 'ADD_TOAST', toast })
    expect(newState.toasts.length).toBe(1)
    expect(newState.toasts[0]).toEqual(toast)
  })

  it('updates a toast', () => {
    const state = { toasts: [{ id: '1', description: 'old', open: true }] }
    const newState = reducer(state, { type: 'UPDATE_TOAST', toast: { id: '1', description: 'new' } })
    expect(newState.toasts[0].description).toBe('new')
  })

  it('dismisses a toast', () => {
    const state = { toasts: [{ id: '1', open: true }, { id: '2', open: true }] }
    const newState = reducer(state, { type: 'DISMISS_TOAST', toastId: '1' })
    expect(newState.toasts.find(t => t.id === '1')?.open).toBe(false)
    expect(newState.toasts.find(t => t.id === '2')?.open).toBe(true)
  })

  it('removes a toast', () => {
    const state = { toasts: [{ id: '1', open: true }, { id: '2', open: true }] }
    const newState = reducer(state, { type: 'REMOVE_TOAST', toastId: '1' })
    expect(newState.toasts).toHaveLength(1)
    expect(newState.toasts[0].id).toBe('2')
  })
})
