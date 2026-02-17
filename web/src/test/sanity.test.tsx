import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

describe('Setup Test', () => {
    it('renders correctly', () => {
        render(<div data-testid="test-div">Hello World</div>)
        expect(screen.getByTestId('test-div')).toHaveTextContent('Hello World')
    })
})
