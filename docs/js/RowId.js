export default class RowId {
    iWorker;
    iWorkTime;
    constructor(iWorker, iWorkTime) {
        this.iWorker = iWorker;
        this.iWorkTime = iWorkTime;
    }
    toString() {
        return `${this.iWorker}.${this.iWorkTime}`;
    }
}
