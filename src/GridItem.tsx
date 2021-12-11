import * as React from "react";
import "./selectable-grid.scss";
import { useImperativeHandle } from "react";

export type GridItemRef = {
  select: () => void;
  deselect: () => void;
  id: string | number;
  top: number;
  left: number;
  height: number;
  width: number;
};

interface IGridItemProps {
  selectedRef?: React.RefObject<GridItemRef>;
  cellStart?: number;
  cellEnd?: number;

  render: ({
    isSelected,
    className,
    ref,
    styles,
  }: {
    isSelected: boolean;
    className: string;
    ref: React.RefObject<HTMLDivElement>;
    styles: Record<string, string>;
  }) => JSX.Element;
  id: string | number;
  span?: number;
  row?: number;
}

export const GridItem: React.VFC<IGridItemProps> = ({
  render,
  selectedRef,
  id,
  cellStart,
  cellEnd,
  row,
}) => {
  const [isSelected, setSelected] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  const styles = React.useMemo(
    () => ({
      gridColumn: `${cellStart} / ${cellEnd}`,
      gridRow: `${row} / ${row}`,
    }),
    [cellEnd, cellStart, row]
  );

  useImperativeHandle(selectedRef, () => ({
    select: () => {
      setSelected(true);
    },
    deselect: () => {
      setSelected(false);
    },
    id,
    top: ref.current!.offsetTop,
    left: ref.current!.offsetLeft,
    height: ref.current!.clientHeight,
    width: ref.current!.clientWidth,
  }));

  return <>{render({ isSelected, className: "grid-item", ref, styles })}</>;
};
