// Returns the first key with the given value
if (!Object.prototype.getKeyByValue) Object.prototype.getKeyByValue = function(value) { return Object.keys(this).find(k => this[k] === value ); };
