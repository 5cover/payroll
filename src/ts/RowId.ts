export default class RowId {
    iWorker: number;
    iWorkTime: number;
    constructor(iWorker: number, iWorkTime: number) {
        this.iWorker = iWorker;
        this.iWorkTime = iWorkTime;
    }
    toString() {
        return `${this.iWorker}.${this.iWorkTime}`
    }
}