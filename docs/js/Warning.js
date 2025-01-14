import { acce } from "./util.js";
const actions = new Map();
actions.set('allow', { title: 'Allow', src: 'img/check.svg', alt: 'Check', radios: [] });
actions.set('cap', { title: 'Cap at max time', src: 'img/indeterminate.svg', alt: 'Indeterminate', radios: [] });
actions.set('forbid', { title: 'Forbid', src: 'img/cross.svg', alt: 'Cross', radios: [] });
export default class Warning {
    rowId;
    duration;
    constructor(rowId, duration) {
        this.rowId = rowId;
        this.duration = duration;
    }
    createSwitchElement() {
        const div = document.createElement('div');
        div.className = 'switch-warning-actions';
        for (const [actid, act] of actions) {
            const label = acce(div, 'label');
            label.title = act.title;
            label.htmlFor = this.rowId.toString() + actid;
            const img = acce(label, 'img');
            img.src = act.src;
            const rb = acce(label, 'input');
            act.radios.push(rb);
            rb.type = 'radio';
            rb.id = label.htmlFor;
            rb.name = this.rowId.toString();
            rb.value = actid;
            rb.addEventListener('input', () => {
                if (rb.checked)
                    this.#onAllow();
                else
                    this.#onDisallow();
                for (const other_rb of act.radios) {
                    other_rb.checked = rb.checked;
                }
            });
        }
        return div;
    }
    #onAllow() {
    }
    #onDisallow() {
    }
}
