export default class Warning {
    rowId;
    duration;
    constructor(rowId, duration) {
        this.rowId = rowId;
        this.duration = duration;
    }
    createSwitchElement() {
        const el = document.createElement('label');
        el.className = 'toggle-switch';
        el.appendChild(document.createElement('span')).className = 'slider';
        const checkbox = el.appendChild(document.createElement('input'));
        checkbox.type = 'checkbox';
        checkbox.addEventListener('input', () => checkbox.checked ? this.#onAllow() : this.#onDisallow());
        return el;
    }
    #onAllow() {
    }
    #onDisallow() {
    }
}
