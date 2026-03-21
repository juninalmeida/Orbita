import { screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { UserAvatar } from '../user-avatar'
import { renderWithProviders } from '@/tests/helpers/render'

describe('UserAvatar', () => {
  it('shows image when avatar is provided', () => {
    renderWithProviders(
      <UserAvatar name="Junior" avatar="https://example.com/avatar.jpg" />,
    )

    const img = screen.getByAltText('Junior')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg')
  })

  it('shows initial when no avatar', () => {
    renderWithProviders(<UserAvatar name="Junior" />)
    expect(screen.getByText('J')).toBeInTheDocument()
  })

  it('capitalizes the initial', () => {
    renderWithProviders(<UserAvatar name="maria" />)
    expect(screen.getByText('M')).toBeInTheDocument()
  })

  it('applies correct size class for each size', () => {
    const { container, unmount } = renderWithProviders(
      <UserAvatar name="A" size="xs" />,
    )
    expect(container.querySelector('.w-5')).toBeInTheDocument()
    unmount()

    const { container: c2 } = renderWithProviders(
      <UserAvatar name="A" size="lg" />,
    )
    expect(c2.querySelector('.w-9')).toBeInTheDocument()
  })

  it('wraps in link when userId is provided', () => {
    renderWithProviders(
      <UserAvatar name="Junior" userId="abc-123" />,
    )

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/users/abc-123')
  })

  it('does not render link when userId is absent', () => {
    renderWithProviders(<UserAvatar name="Junior" />)
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })
})
