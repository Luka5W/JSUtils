module.exports = {
    object: {
        // Returns the first key with the given value
        getKeyByValue: (object, value) => Object.keys(object).find(k => this[k] === value )
    }
}
