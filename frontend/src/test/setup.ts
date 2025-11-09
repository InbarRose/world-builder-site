// src/test/setup.ts
import '@testing-library/jest-dom'
import { expect, beforeEach, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

// Add custom jest-dom matchers
expect.extend(matchers)

// Clean up after each test
beforeEach(() => {
    // Reset any runtime handlers
    vi.restoreAllMocks()
})

afterEach(() => {
    cleanup()
})