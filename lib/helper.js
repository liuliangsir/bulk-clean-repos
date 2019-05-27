const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const flip = func => (first, ...rest) => func(...rest, first);

exports.wait = wait;
exports.flip = flip;
