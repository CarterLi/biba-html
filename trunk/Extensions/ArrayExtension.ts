interface Array<T> {
    first(): T;
    first(callbackfn: (value: T, index: number, array: T[]) => boolean): T;

    findFirstIndex(callbackfn: (value: T, index: number, array: T[]) => boolean): number;
}

Array.prototype.first = (): any=> this[0];

(<any>Array.prototype).first = (callbackfn: (value: any, index: number, array: any[]) => boolean): any=> {
    for (var i = 0; i < this.length; ++i) {
        var value = this[i];
        if (callbackfn(value, i, this)) {
            return value;
        }
    }
    return undefined;
};

(<any>Array.prototype).findFirstIndex = (callbackfn: (value: any, index: number, array: any[]) => boolean): any=> {
    for (var i = 0; i < this.length; ++i) {
        if (callbackfn(this[i], i, this)) {
            return i;
        }
    }
    return -1;
};