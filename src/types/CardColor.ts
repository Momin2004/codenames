export enum CardColor {
  Default = 0,
  Red = 1,
  Blue = 2,
}

export const cardBackGroundColor: Record<CardColor, string> = {
  [CardColor.Default]: "rgba(255,255,255,0.06)",
  [CardColor.Red]: "rgba(244, 143, 177, 0.12)",
  [CardColor.Blue]: "rgba(121, 134, 203, 0.12)",
};