import React from "react";
import "./App.css";
import { SelectableGrid } from "./SelectableGrid";
import { range } from "./utils";
import { GridItem } from "./GridItem";

function App() {
  const cols = 20;
  const rows = 20;
  const [selectedBlocks, setSelectedBlocks] = React.useState(0);

  const handleSelect = React.useCallback((selected: Array<number | string>) => {
    setSelectedBlocks(selected.length);
  }, []);

  const memoizedBlocks = React.useMemo(
    // () => generateRandomGrid(rows, cols),
    () =>
      range(rows * cols).map((index) => {
        return (
          <GridItem
            key={index}
            id={index}
            render={({ isSelected, ref, className, styles }) => (
              <div
                ref={ref}
                style={styles}
                className={`${className} grid-item-block ${
                  isSelected ? "grid-item-block-selected" : ""
                }`}
              />
            )}
          />
        );
      }),
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
