function intersects({
  minAx,
  minAy,
  maxAx,
  maxAy,
  minBx,
  minBy,
  maxBx,
  maxBy,
}) {
  const aLeftOfB = maxAx < minBx;
  const aRightOfB = minAx > maxBx;
  const aAboveB = minAy > maxBy;
  const aBelowB = maxAy < minBy;

  return !(aLeftOfB || aRightOfB || aAboveB || aBelowB);
}

onmessage = function (event) {
  let inSelectionIds = [];
  let indexesToRemoveFromCurrentlySelected = [];
  // console.log(event.data.currentlySelected);
  for (let index = 0; index < event.data.items.length; index++) {
    const item = event.data.items[index];
    if (!item) break;
    const { top, left, width, height, id } = item;
    //
    // if (isShiftKey && inSelectionIds.includes(id)) {
    //     continue;
    // }

    const isAlreadySelectedIndexOf = event.data.currentlySelected.indexOf(id);
    const isAlreadySelected = isAlreadySelectedIndexOf !== -1;
    const isIntersecting = intersects({
      minAx: left,
      minAy: top,
      maxAx: left + width,
      maxAy: top + height,
      minBx: event.data.SAleft,
      minBy: event.data.SAtop,
      maxBx: event.data.SAleft + event.data.SAwidth,
      maxBy: event.data.SAtop + event.data.SAheight,
    });
    if (isIntersecting && !isAlreadySelected) {
      inSelectionIds = [...inSelectionIds, { index, isSelected: true, id }];
    } else if (!isIntersecting && isAlreadySelected) {
      inSelectionIds = [...inSelectionIds, { index, isSelected: false, id }];
      indexesToRemoveFromCurrentlySelected = [
        ...indexesToRemoveFromCurrentlySelected,
        isAlreadySelectedIndexOf,
      ];
    }
  }

  postMessage({ inSelectionIds, indexesToRemoveFromCurrentlySelected });
};
