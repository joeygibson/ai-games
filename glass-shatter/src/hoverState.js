// Shared hover state for bridge preview (not React state to avoid re-renders)
let _hoveredBlock = null // { col, row, type } or null

export function getHoveredBlock() {
  return _hoveredBlock
}

export function setHoveredBlock(block) {
  _hoveredBlock = block
}