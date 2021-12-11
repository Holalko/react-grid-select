import * as React from "react";
import "./selectable-grid.scss";
import { intersects, range } from "./utils";
import { GridItemRef } from "./GridItem";

type ISelectableGridProps = {
  rows: number;
  cols: number;

  onSelect?: (ids: Array<GridItemRef["id"]>) => void;
};

type Position = { x: number; y: number };

export const SelectableGrid: React.FC<ISelectableGridProps> = React.memo(
  ({ children, rows, cols, onSelect }) => {
    const currRow = React.useRef(1);
    const nextStart = React.useRef(1);
    const calculating = React.useRef(false);

    const style = React.useMemo(
      () => ({
        gridTemplateRows: `repeat(${rows}, 1fr)`,
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
      }),
      [rows, cols]
    );

    React.useEffect(() => {
      currRow.current = 1;
      nextStart.current = 1;
    }, []);

    const items = React.useMemo(
      () => range(rows * cols).map(() => React.createRef<GridItemRef>()),
      [rows, cols]
    );

    const itemsForWorker = React.useRef<
      Array<{
        top: number;
        left: number;
        width: number;
        height: number;
        id: GridItemRef["id"];
      }>
    >([]);
    const selectedItemsIds = React.useRef<Array<GridItemRef["id"]>>([]);
    const selectionArea = React.useRef<HTMLDivElement>(null);
    const mouseStart = React.useRef<Position | null>(null);
    const mouseCurrent = React.useRef<Position | null>(null);
    const isMouseDown = React.useRef(false);
    const shouldAnimate = React.useRef(true);

    const worker = React.useMemo(() => {
      const w = new Worker(`${process.env.PUBLIC_URL}/calculator-worker.js`);
      w.onmessage = (event) => {
        calculating.current = true;
        let newSelectedIds = [...selectedItemsIds.current];
        if (event.data.length === 0) {
          calculating.current = false;

          return;
        }

        event.data.indexesToRemoveFromCurrentlySelected.forEach(
          (index: number) => {
            newSelectedIds[index] = null as any; // :)
          }
        );

        event.data.inSelectionIds.forEach(
          ({
            index,
            isSelected,
            id,
          }: {
            index: number;
            isSelected: boolean;
            id: GridItemRef["id"];
          }) => {
            if (isSelected) {
              items[index].current!.select();
              newSelectedIds = [...newSelectedIds, id];
            } else {
              items[index].current!.deselect();
            }
          }
        );

        selectedItemsIds.current = newSelectedIds.filter(Boolean);
        calculating.current = false;
      };
      return w;
    }, [items]);

    const mouseDown: React.MouseEventHandler<HTMLDivElement> = (e) => {
      if (!e.shiftKey) {
        items.forEach((item) => {
          item.current?.deselect();
        });
        selectedItemsIds.current = [];
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

      if (itemsForWorker.current.length === 0) {
        itemsForWorker.current = items.map((item) => ({
          top: item.current!.top,
          left: item.current!.left,
          width: item.current!.width,
          height: item.current!.height,
          id: item.current!.id,
        }));
      }

      if (!calculating.current) {
        worker.postMessage({
          items: itemsForWorker.current,
          currentlySelected: selectedItemsIds.current,
          SAtop,
          SAleft,
          SAwidth,
          SAheight,
        });
      }

      // if (!isShiftKey) {
      //   selectedItemsIds.current = [];
      // }

      // for (let item of items) {
      //   if (!item.current) break;
      //   const {
      //     top,
      //     left,
      //     width,
      //     height,
      //     select,
      //     deselect,
      //     id,
      //   } = item.current!;
      //
      //   if (isShiftKey && selectedItemsIds.current.includes(id)) {
      //     continue;
      //   }
      //
      //   if (
      //     intersects({
      //       minAx: left,
      //       minAy: top,
      //       maxAx: left + width,
      //       maxAy: top + height,
      //       minBx: SAleft,
      //       minBy: SAtop,
      //       maxBx: SAleft + SAwidth,
      //       maxBy: SAtop + SAheight,
      //     })
      //   ) {
      //     select();
      //     selectedItemsIds.current = [...selectedItemsIds.current, id];
      //   } else {
      //     deselect();
      //   }
      // }
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
              const row = currRow.current;
              const cellStart = Number(nextStart.current);
              const cellEnd = Math.min(
                cellStart + (child.props.span || 1),
                cols + 1
              );
              if (cellEnd > cols) {
                nextStart.current = 1;
                currRow.current++;
              } else {
                nextStart.current = cellEnd;
              }
              return React.cloneElement(child, {
                selectedRef: items[i],
                position: i,
                cellStart,
                cellEnd,
                row,
              });
            }
            throw Error("Child must be GridItem");
          })}
        </div>
      </div>
    );
  }
);
