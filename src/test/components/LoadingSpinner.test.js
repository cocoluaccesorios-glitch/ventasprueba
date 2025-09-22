import { describe, it, expect } from 'vitest'
import { mountComponent } from '../utils/test-utils'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

describe('LoadingSpinner', () => {
  it('renders correctly with default props', () => {
    const wrapper = mountComponent(LoadingSpinner, {
      props: {
        message: 'Cargando...'
      }
    })

    expect(wrapper.find('.loading-container').exists()).toBe(true)
    expect(wrapper.find('.loading-spinner').exists()).toBe(true)
    expect(wrapper.find('.loading-message').text()).toBe('Cargando...')
  })

  it('applies correct size classes', () => {
    const sizes = ['small', 'medium', 'large']
    
    sizes.forEach(size => {
      const wrapper = mountComponent(LoadingSpinner, {
        props: { size, message: 'Test' }
      })
      
      expect(wrapper.find('.loading-container').classes()).toContain(`loading-${size}`)
    })
  })

  it('applies correct color classes', () => {
    const colors = ['primary', 'secondary', 'success', 'danger', 'warning', 'info']
    
    colors.forEach(color => {
      const wrapper = mountComponent(LoadingSpinner, {
        props: { color, message: 'Test' }
      })
      
      expect(wrapper.find('.loading-spinner').classes()).toContain(`spinner-${color}`)
    })
  })

  it('shows overlay when overlay prop is true', () => {
    const wrapper = mountComponent(LoadingSpinner, {
      props: { overlay: true, message: 'Test' }
    })
    
    expect(wrapper.find('.loading-container').classes()).toContain('loading-overlay')
  })

  it('shows fullscreen when fullscreen prop is true', () => {
    const wrapper = mountComponent(LoadingSpinner, {
      props: { fullscreen: true, message: 'Test' }
    })
    
    expect(wrapper.find('.loading-container').classes()).toContain('loading-fullscreen')
  })

  it('does not show message when message prop is empty', () => {
    const wrapper = mountComponent(LoadingSpinner, {
      props: { message: '' }
    })
    
    expect(wrapper.find('.loading-message').exists()).toBe(false)
  })

  it('has correct ARIA attributes', () => {
    const wrapper = mountComponent(LoadingSpinner, {
      props: { message: 'Test' }
    })
    
    const container = wrapper.find('.loading-container')
    expect(container.attributes('role')).toBe('alert')
    expect(container.attributes('aria-live')).toBe('polite')
  })

  it('has correct ARIA attributes for error type', () => {
    const wrapper = mountComponent(LoadingSpinner, {
      props: { type: 'error', message: 'Test' }
    })
    
    const container = wrapper.find('.loading-container')
    expect(container.attributes('aria-live')).toBe('assertive')
  })
})
