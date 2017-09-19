function isInteger(thing) {
  return (typeof thing === 'number' && (thing % 1) === 0);
}

function isNullOrUndefined(thing) {
  return (thing == null || thing === undefined);
}

export {isInteger, isNullOrUndefined};