"use client";

import { useMemo } from "react";
import { generateSriYantra, type RenderOptions } from "../svg/renderer.js";
import {
  generateAnimatedSriYantra,
  type AnimationPreset,
} from "../svg/animated.js";

export interface SriYantraProps extends RenderOptions {
  className?: string;
  style?: React.CSSProperties;
  animated?: boolean;
  animationPreset?: AnimationPreset;
}

/**
 * React component that renders Sri Yantra as inline SVG.
 */
export function SriYantra({
  className,
  style,
  animated = false,
  animationPreset = "draw",
  ...options
}: SriYantraProps) {
  const svgString = useMemo(() => {
    if (animated) {
      return generateAnimatedSriYantra({
        ...options,
        animation: animationPreset,
      });
    }
    return generateSriYantra(options);
  }, [animated, animationPreset, JSON.stringify(options)]);

  return (
    <div
      className={className}
      style={style}
      dangerouslySetInnerHTML={{ __html: svgString }}
    />
  );
}
