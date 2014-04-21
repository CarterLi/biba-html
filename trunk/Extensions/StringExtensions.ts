interface String {
    startsWith(str: string): boolean;
    startsWithIgnoreCase(str: string): boolean;

    endsWith(str: string): boolean;
    endsWithIgnoreCase(str: string): boolean;
}

if (typeof String.prototype.startsWith != 'function') {
    String.prototype.startsWith = function(str) {
        return this.slice(0, str.length) === str;
    };
}

if (typeof String.prototype.startsWithIgnoreCase != 'function') {
    String.prototype.startsWithIgnoreCase = function(str) {
        return this.slice(0, str.length).toUpperCase() === str.toUpperCase();
    };
}

if (typeof String.prototype.endsWith != 'function') {
    String.prototype.endsWith = function(str) {
        return this.slice(-str.length) === str;
    };
}

if (typeof String.prototype.endsWithIgnoreCase != 'function') {
    String.prototype.endsWithIgnoreCase = function(str) {
        return this.slice(-str.length).toUpperCase() === str.toUpperCase();
    };
}