export const TileType = {
  Neutral: 0n,
  Red: 1n,
  Blue: 2n,
  Black: 3n,
  d: null
} as const;

export type TileType = (typeof TileType)[keyof typeof TileType];

export type PublicServerTile = {
  position: bigint;
  word: string;
  isGuessed: boolean;
  type: bigint | null;
};

export type Tile = {
  position: bigint;
  word: string;
  isGuessed: boolean;
  type: TileType;
};

function toTileType(t: bigint): TileType {
  switch (Number(t)) {
    case 0: return TileType.Neutral;
    case 1: return TileType.Red;
    case 2: return TileType.Blue;
    case 3: return TileType.Black;
    default: return TileType.Neutral;
  }
}

export function toTileFromPublic(t: PublicServerTile): Tile {
  return {
    position: t.position,
    word: t.word,
    isGuessed: t.isGuessed,
    type: t.type === null ? TileType.Neutral : toTileType(t.type),
  };
}