export default class RowId {
    iWorker: number;
    iShift: number;
    constructor(iWorker: number, iShift: number) {
        this.iWorker = iWorker;
        this.iShift = iShift;
    }
    toString() {
        return `${this.iWorker + 1}.${this.iShift + 1}`
    }
}