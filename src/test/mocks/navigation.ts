import { vi } from "vitest";

export const mockPush = vi.fn();
export const mockReplace = vi.fn();
export const mockPrefetch = vi.fn();
export const mockBack = vi.fn();
export const mockPathname = vi.fn(() => "/");
export const mockSearchParams = vi.fn(() => new URLSearchParams());

export const useRouter = vi.fn(() => ({
  push: mockPush,
  replace: mockReplace,
  prefetch: mockPrefetch,
  back: mockBack,
}));

export const usePathname = () => mockPathname();
export const useSearchParams = () => mockSearchParams();
