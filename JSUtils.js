// Returns the first key with the given value
if (!Object.getKeyByValue) Object.getKeyByValue = (value) => { return Object.keys(this).find(key => this[key] === value); }