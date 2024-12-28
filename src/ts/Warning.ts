export default class Warning {
    readonly rowId: string;
    readonly duration: number;

    constructor(rowId: string, duration: number) {
        this.rowId = rowId;
        this.duration = duration;
    }

    createSwitchElement(): HTMLElement {
        const el = document.createElement('label');
        el.className = 'toggle-switch';
        el.appendChild(document.createElement('span')).className = 'slider';
        const checkbox = el.appendChild(document.createElement('input'));
        checkbox.type = 'checkbox';
        checkbox.addEventListener('input', () => checkbox.checked ? this.#onAllow() : this.#onDisallow());
        return el;
    }

    #onAllow() {
        //let d = this.duration;
        // identify the row
        // change the work time
    }

    #onDisallow() {
        //
    }
}