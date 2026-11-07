import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { MapCanvas } from '../components/MapCanvas'
import { createInitialMap } from '../engine/mapEngine'
import { MapState } from '../engine/types'

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

  it('toggles Fog of War unexplored shroud with the fog tool', () => {
    const map = createInitialMap(4, 4)
    const handleChange = vi.fn()

    render(<MapCanvas map={map} worldName="Eldoria" onChange={handleChange} />)

    const fogBtn = screen.getByRole('button', { name: /Fog of War Tool/i })
    fireEvent.click(fogBtn)

    const tileBtn = screen.getByTestId('map-tile-0-0')
    fireEvent.mouseDown(tileBtn)

    expect(handleChange).toHaveBeenCalledTimes(1)
    const updatedMap = handleChange.mock.calls[0][0]
    expect(updatedMap.tiles['0,0'].isUnexplored).toBe(true)
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

  it('supports 60fps Smooth Pan/Zoom Cartography Camera, Zoom In/Out, Reset, and Fit buttons', () => {
    const map = createInitialMap(6, 4)
    const handleChange = vi.fn()

    render(<MapCanvas map={map} worldName="Eldoria" onChange={handleChange} />)

    const zoomInBtn = screen.getByRole('button', { name: /Zoom In Map/i })
    const zoomOutBtn = screen.getByRole('button', { name: /Zoom Out Map/i })
    const resetBtn = screen.getByRole('button', { name: /Reset Camera \(100%\)/i })
    const fitBtn = screen.getByRole('button', { name: /Fit Map to Viewport/i })

    expect(resetBtn).toHaveTextContent('100%')

    // Click Zoom In -> increases scale to 125%
    fireEvent.click(zoomInBtn)
    expect(resetBtn).toHaveTextContent('125%')

    // Click Zoom Out twice -> decreases to 80%
    fireEvent.click(zoomOutBtn)
    expect(resetBtn).toHaveTextContent('100%')
    fireEvent.click(zoomOutBtn)
    expect(resetBtn).toHaveTextContent('80%')

    // Click Reset -> returns to 100%
    fireEvent.click(resetBtn)
    expect(resetBtn).toHaveTextContent('100%')

    // Click Fit Viewport
    fireEvent.click(fitBtn)
    expect(resetBtn).toBeInTheDocument()
  })

  it('supports Pan Map tool, Spacebar drag pan mode, Compass Rose, and Minimap Radar', () => {
    const map = createInitialMap(6, 4)
    const handleChange = vi.fn()

    render(<MapCanvas map={map} worldName="Eldoria" onChange={handleChange} />)

    // Verify Compass Rose and Scale Bar
    expect(screen.getByText(/~50 Leagues/i)).toBeInTheDocument()
    expect(screen.getByText('N')).toBeInTheDocument()
    expect(screen.getByText(/Space \+ Drag to Pan/i)).toBeInTheDocument()

    // Verify Minimap Radar
    expect(screen.getByText(/Minimap Radar/i)).toBeInTheDocument()

    // Test Minimap toggle hide / show
    const hideMinimapBtn = screen.getByRole('button', { name: /Hide Minimap/i })
    fireEvent.click(hideMinimapBtn)
    expect(screen.queryByText(/Minimap Radar/i)).not.toBeInTheDocument()

    const showMinimapBtn = screen.getByRole('button', { name: /Show Minimap/i })
    fireEvent.click(showMinimapBtn)
    expect(screen.getByText(/Minimap Radar/i)).toBeInTheDocument()

    // Activate Pan Tool
    const panToolBtn = screen.getByRole('button', { name: /Pan Map/i })
    fireEvent.click(panToolBtn)

    // In Pan mode, clicking on a tile does NOT trigger paint
    const tile00 = screen.getByTestId('map-tile-0-0')
    fireEvent.mouseDown(tile00)
    expect(handleChange).not.toHaveBeenCalled()
  })

  it('supports Organic Shading & Biome Blending toggle and renders coastline rims and hillshading', () => {
    const map = createInitialMap(6, 4)
    map.tiles['1,1'] = {
      ...map.tiles['1,1'],
      terrain: 'mountain',
      relief: 'mountain',
      domain: 'land',
    }
    map.tiles['1,2'] = {
      ...map.tiles['1,2'],
      terrain: 'plains',
      domain: 'land',
    }
    const handleChange = vi.fn()

    render(<MapCanvas map={map} worldName="Eldoria" onChange={handleChange} />)

    const organicBtn = screen.getByRole('button', { name: /Organic Shading 🌄/i })
    const crispBtn = screen.getByRole('button', { name: /Crisp Grid 📐/i })

    expect(organicBtn).toBeInTheDocument()
    expect(crispBtn).toBeInTheDocument()

    // Switch to Crisp Grid
    fireEvent.click(crispBtn)
    expect(crispBtn).toHaveClass('bg-primary')

    // Switch back to Organic Shading
    fireEvent.click(organicBtn)
    expect(organicBtn).toHaveClass('bg-amber-600')
  })

  it('supports seamless switching between Square, Pointy Hex, and Flat Hex topologies', () => {
    const map = createInitialMap(6, 4)
    const handleChange = vi.fn()

    render(<MapCanvas map={map} worldName="Eldoria" onChange={handleChange} />)

    const pointyBtn = screen.getByRole('button', { name: /Pointy Hex Mode/i })
    const flatBtn = screen.getByRole('button', { name: /Flat Hex Mode/i })
    const squareBtn = screen.getByRole('button', { name: /Square Grid Mode/i })

    expect(pointyBtn).toBeInTheDocument()
    expect(flatBtn).toBeInTheDocument()
    expect(squareBtn).toBeInTheDocument()

    // Switch to Pointy Hex
    fireEvent.click(pointyBtn)
    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({ gridTopology: 'hex-pointy' })
    )

    // Switch to Flat Hex
    fireEvent.click(flatBtn)
    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({ gridTopology: 'hex-flat' })
    )

    // Switch back to Square
    fireEvent.click(squareBtn)
    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({ gridTopology: 'square' })
    )
  })

  it('supports the Distance Ruler tool to measure hex distance, leagues, miles, and march days', () => {
    function RulerMap() {
      const [currentMap, setCurrentMap] = React.useState<MapState>(() => ({
        ...createInitialMap(8, 8),
        gridTopology: 'hex-pointy',
      }))
      return <MapCanvas map={currentMap} worldName="Eldoria" onChange={setCurrentMap} />
    }

    render(<RulerMap />)

    const rulerBtn = screen.getByRole('button', { name: /Distance Ruler Tool/i })
    fireEvent.click(rulerBtn)

    // Click tile (1, 1) as ruler origin
    const tile11 = screen.getByTestId('map-tile-1-1')
    fireEvent.mouseDown(tile11)

    // Hover over tile (4, 1)
    const tile41 = screen.getByTestId('map-tile-4-1')
    fireEvent.mouseEnter(tile41)

    // Measurement HUD overlay should appear with distance readouts
    const overlay = screen.getByTestId('hex-ruler-overlay')
    expect(overlay).toBeInTheDocument()
    expect(overlay).toHaveTextContent(/3 hexes/i)
    expect(overlay).toHaveTextContent(/15 leagues/i)
    expect(overlay).toHaveTextContent(/45 miles/i)
    expect(overlay).toHaveTextContent(/march/i)

    // Click Clear Ruler to dismiss
    const clearBtn = within(overlay).getByRole('button', { name: /Clear Ruler/i })
    fireEvent.click(clearBtn)
    expect(screen.queryByTestId('hex-ruler-overlay')).not.toBeInTheDocument()
  })

  it('supports multi-radius brush painting across adjacent tiles', () => {
    function MultiRadiusMap() {
      const [currentMap, setCurrentMap] = React.useState(() => createInitialMap(8, 8))
      return <MapCanvas map={currentMap} worldName="Eldoria" onChange={setCurrentMap} />
    }

    render(<MultiRadiusMap />)

    // Open palette drawer
    const paletteBtn = screen.getByRole('button', { name: /Palette & Overlays/i })
    fireEvent.click(paletteBtn)

    // Select 3x3 radius
    const radius3x3Btn = screen.getByRole('button', { name: /3×3/i })
    fireEvent.click(radius3x3Btn)

    // Paint center tile (3, 3)
    const tile33 = screen.getByTestId('map-tile-3-3')
    fireEvent.mouseDown(tile33)

    // Tile (3, 3) and adjacent neighbor (3, 4) should both have been mutated
    expect(tile33).toHaveAttribute('title', expect.stringContaining('Forest'))
    const tile34 = screen.getByTestId('map-tile-3-4')
    expect(tile34).toHaveAttribute('title', expect.stringContaining('Forest'))
  })
})

