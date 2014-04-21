interface Array<T> {
    first(callbackfn?: (value: T, index: number, array: T[]) => boolean): T;

    findFirstIndex(callbackfn: (value: T, index: number, array: T[]) => boolean): number;
}

if (typeof Array.prototype.first != "function") {
    Array.prototype.first = function(callbackfn) {
        if (callbackfn) {
            for (var i = 0; i < this.length; ++i) {
                var value = this[i];
                if (callbackfn(value, i, this)) {
                    return value;
                }
            }

            return undefined;
        } else {
            return this[0];
        }
    };
}

if (typeof Array.prototype.findFirstIndex != "function") {
    Array.prototype.findFirstIndex = function(callbackfn) {
        for (var i = 0; i < this.length; ++i) {
            if (callbackfn(this[i], i, this)) {
                return i;
            }
        }
        return -1;
    };
}