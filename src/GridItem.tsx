import * as React from 'react';
import "./selectable-grid.scss";
import {useImperativeHandle} from "react";

export type GridItemRef = {
    select: () => void;
    deselect: () => void;
    id: string | number;
    top: number;
    left: number;
    height: number;
    width: number;
}

interface IGridItemProps {
    selectedRef?: React.RefObject<GridItemRef>;
    render: ({isSelected}: {isSelected: boolean}) => JSX.Element;

    id: string | number;
}

export const GridItem: React.VFC<IGridItemProps> = ({render, selectedRef, id}) => {
    const [isSelected, setSelected] = React.useState(false);
    const ref = React.useRef<HTMLDivElement>(null);

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
    }))

    // @ts-ignore
    return <div className={'grid-item'} ref={ref}>
        {render({isSelected})}
    </div>
}