import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Navbar } from './navbar'

describe('Navbar Component', () => {
  it('renders brand title and nav links correctly', () => {
    render(<Navbar />)

    // Check brand title
    expect(screen.getByText('Review')).toBeInTheDocument()
    expect(screen.getByText('Trail')).toBeInTheDocument()

    // Check Navigation Links
    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /exam templates/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /tracker builder/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /about/i })).toBeInTheDocument()
  })

  it('renders login and register CTA buttons', () => {
    render(<Navbar />)

    const loginButtons = screen.getAllByRole('button', { name: /log in/i })
    const registerButtons = screen.getAllByRole('button', { name: /register/i })

    expect(loginButtons.length).toBeGreaterThan(0)
    expect(registerButtons.length).toBeGreaterThan(0)
  })
})
