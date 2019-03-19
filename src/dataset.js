export default class Dataset {
    constructor({data, color, name}) {
        this.allData = data;
        this.color = color;
        this.name = name;

        this.start = 0;
        this.end = data.length;
    }

    getMax() {
        return Math.max(...this.data);
    }

    setRanges(start, end) {
        this.start = start;
        this.end = end;
    }

    get data() {
        return this.allData.slice(this.start, this.end + 1);
    }
}