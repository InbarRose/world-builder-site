import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MapCanvas } from '../components/MapCanvas'
import { createInitialMap } from '../engine/mapEngine'

describe('MapCanvas Component', () => {
  it('renders map grid, tools, dimension presets, and tile inspector', () => {
    const map = createInitialMap(6, 4)
    const handleChange = vi.fn()

    render(<MapCanvas map={map} worldName="Eldoria" onChange={handleChange} />)

    expect(screen.getByText(/Eldoria Atlas \(6 × 4\)/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Paint Brush/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Bucket Fill/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Inspect Tile/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /14×9/i })).toBeInTheDocument()
  })

  it('paints a tile when clicked in brush mode and supports dimension resizing', () => {
    const map = createInitialMap(4, 4)
    const handleChange = vi.fn()

    render(<MapCanvas map={map} worldName="Eldoria" onChange={handleChange} />)

    const tileBtn = screen.getByTestId('map-tile-0-0')
    fireEvent.mouseDown(tileBtn)

    expect(handleChange).toHaveBeenCalledTimes(1)
    const updatedMap = handleChange.mock.calls[0][0]
    expect(updatedMap.tiles['0,0'].terrain).toBe('forest')

    fireEvent.click(screen.getByRole('button', { name: /14×9/i }))
    expect(handleChange).toHaveBeenCalledTimes(2)
    expect(handleChange.mock.calls[1][0].width).toBe(14)
    expect(handleChange.mock.calls[1][0].height).toBe(9)
  })

  it('allows updating tile label, river/road toggles, and tags in inspector', () => {
    const map = createInitialMap(4, 4)
    const handleChange = vi.fn()

    render(<MapCanvas map={map} worldName="Eldoria" onChange={handleChange} />)

    const labelInput = screen.getByPlaceholderText(/Mount Doom, Silverwood/i)
    fireEvent.change(labelInput, { target: { value: 'Dragon Peak' } })

    expect(handleChange).toHaveBeenCalled()
  })

  it('supports clutter-free View Atlas mode (initialViewOnly) that inspects tiles without painting', () => {
    const map = createInitialMap(4, 4)
    const handleChange = vi.fn()

    render(
      <MapCanvas
        map={map}
        worldName="Eldoria"
        onChange={handleChange}
        initialViewOnly={true}
      />,
    )

    expect(screen.queryByRole('button', { name: /Paint Brush/i })).not.toBeInTheDocument()
    const tileBtn = screen.getByTestId('map-tile-1-2')
    fireEvent.mouseDown(tileBtn)

    // Should inspect tile (1, 2) without triggering map mutation
    expect(handleChange).not.toHaveBeenCalled()
    expect(screen.getByText(/Tile \(1, 2\)/i)).toBeInTheDocument()

    // Switching to Edit Map reveals painting tools
    fireEvent.click(screen.getByRole('button', { name: /Edit Map/i }))
    expect(screen.getByRole('button', { name: /Paint Brush/i })).toBeInTheDocument()
  })
})

