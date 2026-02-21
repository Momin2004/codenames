import type { SxProps, Theme } from '@mui/material';
import { DependencyList, useMemo } from 'react';

type VlcStyles<T extends string> = Record<T, SxProps<Theme>>;

export function createSxStyles<T extends string>(styles: VlcStyles<T>, dependencies: DependencyList = []) {
  return useMemo(() => styles, [styles, ...dependencies]);
}