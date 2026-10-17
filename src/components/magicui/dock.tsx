"use client";

import { cva, type VariantProps } from "class-variance-authority";
import type React from "react";
import { useRef } from "react";
import { cn } from "@/lib/utils";

export interface DockProps extends VariantProps<typeof dockVariants> {
  className?: string;
  magnification?: number;
  distance?: number;
  children: React.ReactNode;
}

const DEFAULT_MAGNIFICATION = 60;
const DEFAULT_DISTANCE = 140;
const BASE_SIZE = 40;

const dockVariants = cva(
  "mx-auto flex h-full w-max items-end rounded-full border p-2",
);

/**
 * macOS-style dock. Icon widths are written straight to the DOM on mousemove
 * and eased by a CSS transition, so hovering never re-renders React.
 */
const Dock = ({
  className,
  children,
  magnification = DEFAULT_MAGNIFICATION,
  distance = DEFAULT_DISTANCE,
}: DockProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const icons = () =>
    ref.current?.querySelectorAll<HTMLElement>("[data-dock-icon]") ?? [];

  const onMouseMove = (e: React.MouseEvent) => {
    for (const icon of icons()) {
      const bounds = icon.getBoundingClientRect();
      const offset = Math.abs(e.clientX - bounds.x - bounds.width / 2);
      const t = Math.max(0, 1 - offset / distance);
      icon.style.width = `${BASE_SIZE + (magnification - BASE_SIZE) * t}px`;
    }
  };

  const onMouseLeave = () => {
    for (const icon of icons()) icon.style.width = "";
  };

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: hover magnification is purely visual
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className={cn(dockVariants({ className }))}
    >
      {children}
    </div>
  );
};

export interface DockIconProps {
  className?: string;
  children?: React.ReactNode;
}

const DockIcon = ({ className, children }: DockIconProps) => (
  <div
    data-dock-icon
    className={cn(
      "flex aspect-square w-10 cursor-pointer items-center justify-center rounded-full transition-[width] duration-150 ease-out",
      className,
    )}
  >
    {children}
  </div>
);

export { Dock, DockIcon };
