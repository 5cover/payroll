export default class RowId {
    iWorker;
    iShift;
    constructor(iWorker, iShift) {
        this.iWorker = iWorker;
        this.iShift = iShift;
    }
    toString() {
        return `${this.iWorker + 1}.${this.iShift + 1}`;
    }
}
