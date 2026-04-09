export const getResponsiveColumns = (width: number): number => {
  if (width >= 1200) {
    return 4;
  }

  if (width >= 768) {
    return 3;
  }

  if (width <= 360) {
    return 1;
  }

  return 2;
};

export const getResponsiveMaxWidth = (width: number, mobileMax: number, tabletMax: number): number => {
  if (width >= 1200) {
    return tabletMax;
  }

  if (width >= 768) {
    return Math.min(tabletMax, width - 64);
  }

  return Math.min(mobileMax, width - 24);
};

export const getResponsiveCoverHeight = (width: number): number => {
  if (width >= 1200) {
    return 380;
  }

  if (width >= 768) {
    return 320;
  }

  if (width <= 360) {
    return 220;
  }

  return 260;
};
