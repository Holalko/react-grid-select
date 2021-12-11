import React from "react";
import "./App.css";
import { SelectableGrid } from "./SelectableGrid";
import { range } from "./utils";
import { GridItem } from "./GridItem";

function App() {
  const cols = 30;
  const rows = 30;

  const [selectedBlocks, setSelectedBlocks] = React.useState(0);

  const handleSelect = React.useCallback((selected: Array<number | string>) => {
    setSelectedBlocks(selected.length);
  }, []);

  const memoizedBlocks = React.useMemo(
    () =>
      range(rows * cols).map((i) => (
        <GridItem
          key={i}
          id={i}
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
      )),
    []
  );

  return (
    <div className="App">
      {selectedBlocks}
      <SelectableGrid rows={rows} cols={cols} onSelect={handleSelect}>
        {memoizedBlocks}
      </SelectableGrid>
    </div>
  );
}

export default App;
