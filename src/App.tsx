import React from 'react';
import './App.css';
import {SelectableGrid} from "./SelectableGrid";
import {range} from "./utils";
import {GridItem} from "./GridItem";

function App() {
    const cols = 31;
    const rows = 24;
    return (
    <div className="App">
      <SelectableGrid rows={rows } cols={cols}>
          {range(rows * cols).map(i => <GridItem key={i} render={({isSelected}) =>
              <div className={`grid-item-block ${isSelected ? 'grid-item-block-selected' : ''}`} />
          } />)}
      </SelectableGrid>
    </div>
  );
}

export default App;
