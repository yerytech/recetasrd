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

type ResponsiveValues = {
  compact: number;
  regular: number;
  tablet: number;
  desktop: number;
};

export const getResponsiveValue = (width: number, values: ResponsiveValues): number => {
  if (width >= 1200) {
    return values.desktop;
  }

  if (width >= 768) {
    return values.tablet;
  }

  if (width <= 360) {
    return values.compact;
  }

  return values.regular;
};

export const getResponsiveFontSize = (width: number, baseSize: number): number =>
  getResponsiveValue(width, {
    compact: Math.max(12, Math.round(baseSize * 0.92)),
    regular: baseSize,
    tablet: Math.round(baseSize * 1.08),
    desktop: Math.round(baseSize * 1.14),
  });

export const getResponsiveControlHeight = (width: number): number =>
  getResponsiveValue(width, {
    compact: 48,
    regular: 52,
    tablet: 56,
    desktop: 58,
  });

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
