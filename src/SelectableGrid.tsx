import * as React from "react";
import "./selectable-grid.scss";
import { range } from "./utils";
import { GridItemRef } from "./GridItem";
type ISelectableGridProps = {
  rows: number;
  cols: number;

  onSelect?: (ids: Array<GridItemRef["id"]>) => void;
};

type Position = { x: number; y: number };

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

function intersects({
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

export const SelectableGrid: React.FC<ISelectableGridProps> = React.memo(
  ({ children, rows, cols, onSelect }) => {
    const style = React.useMemo(
      () => ({
        gridTemplateRows: range(rows)
          .map(() => "1fr")
          .join(" "),
        gridTemplateColumns: range(cols)
          .map(() => "1fr")
          .join(" "),
      }),
      [rows, cols]
    );

    const items = React.useMemo(
      () => range(rows * cols).map(() => React.createRef<GridItemRef>()),
      [rows, cols]
    );
    const selectedItemsIds = React.useRef<Array<GridItemRef["id"]>>([]);
    const selectionArea = React.useRef<HTMLDivElement>(null);
    const mouseStart = React.useRef<Position | null>(null);
    const mouseCurrent = React.useRef<Position | null>(null);
    const isMouseDown = React.useRef(false);
    const shouldAnimate = React.useRef(true);

    const mouseDown: React.MouseEventHandler<HTMLDivElement> = (e) => {
      if (!e.shiftKey) {
        items.forEach((item) => {
          item.current!.deselect();
        });
      }
      mouseStart.current = { x: e.clientX, y: e.clientY };
      isMouseDown.current = true;
      selectionArea.current!.style.opacity = "50%";
    };

    function repaintSelectArea(isShiftKey: boolean) {
      shouldAnimate.current = true;

      const SAtop = Math.min(mouseStart.current!.y, mouseCurrent.current!.y);
      const SAleft = Math.min(mouseStart.current!.x, mouseCurrent.current!.x);
      const SAwidth = Math.abs(mouseCurrent.current!.x - mouseStart.current!.x);
      const SAheight = Math.abs(
        mouseCurrent.current!.y - mouseStart.current!.y
      );

      selectionArea.current!.style.top = `${SAtop}px`;
      selectionArea.current!.style.left = `${SAleft}px`;
      selectionArea.current!.style.width = `${SAwidth}px`;
      selectionArea.current!.style.height = `${SAheight}px`;

      if (!isShiftKey) {
        selectedItemsIds.current = [];
      }

      for (let i = 0; i < items.length; i++) {
        const { top, left, width, height, select, deselect, id } = items[
          i
        ].current!;

        if (SAtop > top + height) {
          i += cols - 1;
          continue;
        }

        if (SAtop + SAheight < top) {
          break;
        }

        if (isShiftKey && selectedItemsIds.current.includes(id)) {
          continue;
        }

        if (
          intersects({
            minAx: left,
            minAy: top,
            maxAx: left + width,
            maxAy: top + height,
            minBx: SAleft,
            minBy: SAtop,
            maxBx: SAleft + SAwidth,
            maxBy: SAtop + SAheight,
          })
        ) {
          select();
          selectedItemsIds.current = [...selectedItemsIds.current, id];
        } else {
          deselect();
        }
      }
    }

    const mouseMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
      if (!isMouseDown.current) return;

      mouseCurrent.current = { x: e.clientX, y: e.clientY };

      if (!mouseStart.current || !mouseCurrent.current) return;

      if (shouldAnimate.current) {
        shouldAnimate.current = false;
        requestAnimationFrame(() => repaintSelectArea(e.shiftKey));
      }
    };

    const mouseUp = () => {
      isMouseDown.current = false;
      selectionArea.current!.style.opacity = "0%";

      if (selectedItemsIds.current) {
        onSelect?.(selectedItemsIds.current);
      }
    };

    return (
      <div
        className={"selectable-grid-container"}
        onMouseDown={mouseDown}
        onMouseMove={mouseMove}
        onMouseUp={mouseUp}
      >
        <div ref={selectionArea} className={"select-area"} />
        <div className={"selectable-grid"} style={style}>
          {React.Children.map(children, (child, i) => {
            if (React.isValidElement(child)) {
              return React.cloneElement(child, { selectedRef: items[i] });
            }
            throw Error("Child must be GridItem");
          })}
        </div>
      </div>
    );
  }
);
