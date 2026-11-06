import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
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

  it('supports 20-step undo and redo history for tile painting, continuous strokes, and Ctrl+Z / Ctrl+Y hotkeys', () => {
    function InteractiveMap() {
      const [currentMap, setCurrentMap] = React.useState(() => createInitialMap(4, 4))
      return <MapCanvas map={currentMap} worldName="Eldoria" onChange={setCurrentMap} />
    }

    render(<InteractiveMap />)

    const undoBtn = screen.getByRole('button', { name: /Undo Map Action/i })
    const redoBtn = screen.getByRole('button', { name: /Redo Map Action/i })

    // Initially, both Undo and Redo are disabled
    expect(undoBtn).toBeDisabled()
    expect(redoBtn).toBeDisabled()

    // 1. Single click brush paint on (0, 0)
    const tile00 = screen.getByTestId('map-tile-0-0')
    fireEvent.mouseDown(tile00)
    fireEvent.mouseUp(window)

    expect(undoBtn).not.toBeDisabled()
    expect(redoBtn).toBeDisabled()
    expect(within(undoBtn).getByText('1')).toBeInTheDocument()

    // 2. Click Undo button -> reverts tile
    fireEvent.click(undoBtn)
    expect(undoBtn).toBeDisabled()
    expect(redoBtn).not.toBeDisabled()
    expect(within(redoBtn).getByText('1')).toBeInTheDocument()

    // 3. Click Redo button -> restores painted tile
    fireEvent.click(redoBtn)
    expect(undoBtn).not.toBeDisabled()
    expect(redoBtn).toBeDisabled()
    expect(within(undoBtn).getByText('1')).toBeInTheDocument()

    // 4. Test Ctrl+Z and Ctrl+Y keyboard shortcuts
    fireEvent.keyDown(window, { key: 'z', ctrlKey: true })
    expect(undoBtn).toBeDisabled()
    expect(redoBtn).not.toBeDisabled()
    expect(within(redoBtn).getByText('1')).toBeInTheDocument()

    fireEvent.keyDown(window, { key: 'y', ctrlKey: true })
    expect(undoBtn).not.toBeDisabled()
    expect(redoBtn).toBeDisabled()
    expect(within(undoBtn).getByText('1')).toBeInTheDocument()

    // 5. Test continuous drag stroke grouping (3 tiles in 1 stroke)
    const tile01 = screen.getByTestId('map-tile-0-1')
    const tile02 = screen.getByTestId('map-tile-0-2')
    const tile03 = screen.getByTestId('map-tile-0-3')

    fireEvent.mouseDown(tile01)
    fireEvent.mouseEnter(tile02)
    fireEvent.mouseEnter(tile03)
    fireEvent.mouseUp(window)

    // Undo stack now has 2 steps: [Step 1: (0,0), Step 2: stroke (0,1 -> 0,3)]
    expect(within(undoBtn).getByText('2')).toBeInTheDocument()

    // Undo once reverts the entire 3-tile stroke
    fireEvent.click(undoBtn)
    expect(within(undoBtn).getByText('1')).toBeInTheDocument()
    expect(within(redoBtn).getByText('1')).toBeInTheDocument()

    // Redo restores all 3 tiles at once
    fireEvent.click(redoBtn)
    expect(within(undoBtn).getByText('2')).toBeInTheDocument()
  })
})

