import type { SxProps, Theme } from '@mui/material';
import { DependencyList, useMemo } from 'react';

type Styles<T extends string> = Record<T, SxProps<Theme>>;

export function createSxStyles<T extends string>(styles: Styles<T>, dependencies: DependencyList = []) {
  return useMemo(() => styles, [styles, ...dependencies]);
}