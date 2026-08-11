import { describe, it, expect, vi, beforeEach } from 'vitest'
import { loginUser, registerUser, signOutUser } from './index'

const mockSignInWithPassword = vi.fn()
const mockSignUp = vi.fn()
const mockSignOut = vi.fn()

vi.mock('../supabase/client', () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signUp: mockSignUp,
      signOut: mockSignOut,
    },
  }),
}))

describe('Auth Helpers (lib/auth)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Setup window.location.origin for registerUser
    Object.defineProperty(window, 'location', {
      value: { origin: 'http://localhost:3000' },
      writable: true,
    })
  })

  it('should call signInWithPassword with correct credentials on loginUser', async () => {
    mockSignInWithPassword.mockResolvedValue({ data: { user: { id: '123' } }, error: null })

    const result = await loginUser({ email: 'test@example.com', password: 'password123' })

    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    })
    expect(result).toEqual({ data: { user: { id: '123' } }, error: null })
  })

  it('should call signUp with username metadata on registerUser', async () => {
    mockSignUp.mockResolvedValue({ data: { user: { id: '123' } }, error: null })

    const result = await registerUser({
      email: 'newuser@example.com',
      password: 'password123',
      username: 'testuser',
    })

    expect(mockSignUp).toHaveBeenCalledWith({
      email: 'newuser@example.com',
      password: 'password123',
      options: {
        data: { username: 'testuser' },
        emailRedirectTo: 'http://localhost:3000/auth/callback',
      },
    })
    expect(result).toEqual({ data: { user: { id: '123' } }, error: null })
  })

  it('should call signOut on signOutUser', async () => {
    mockSignOut.mockResolvedValue({ error: null })

    await signOutUser()

    expect(mockSignOut).toHaveBeenCalledTimes(1)
  })
})
