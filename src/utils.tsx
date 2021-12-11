import { GridItem } from "./GridItem";
import React from "react";

export function range(size: number): ReadonlyArray<number> {
  return Array.from({ length: size }, (x, i) => i);
}

interface IntersectsParams {
  minAx: number;
  minAy: number;
  maxAx: number;
  maxAy: number;
  minBx: number;
  minBy: number;
  maxBx: number;
  maxBy: number;
}

export function intersects({
  minAx,
  minAy,
  maxAx,
  maxAy,
  minBx,
  minBy,
  maxBx,
  maxBy,
}: IntersectsParams) {
  const aLeftOfB = maxAx < minBx;
  const aRightOfB = minAx > maxBx;
  const aAboveB = minAy > maxBy;
  const aBelowB = maxAy < minBy;

  return !(aLeftOfB || aRightOfB || aAboveB || aBelowB);
}

export function generateRandomGrid(rows: number, cols: number) {
  let total = 0;

  return range(rows * cols)
    .map((index) => {
      if (total === rows * cols) return null;
      let span = Math.random() < 0.2 ? Math.floor(Math.random() * 5) : 1;
      if (total + span <= rows * cols) {
        total += span;
      } else {
        span = rows * cols - total;
        total = rows * cols;
      }
      return (
        <GridItem
          key={index}
          id={index}
          span={span}
          render={({ isSelected }) => (
            <div
              className={`grid-item-block ${
                isSelected ? "grid-item-block-selected" : ""
              }`}
            >
              {isSelected ? "1" : ""}
            </div>
          )}
        />
      );
    })
    .filter(Boolean);
}
