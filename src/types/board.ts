export interface Board {
  tiles: Tile[]
}

export interface Tile {
  type: TileType
  flipped: boolean
}

export enum TileType {
  None,
  blue,
  red,
  white,
  black
}