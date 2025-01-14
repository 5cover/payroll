import { Warning } from "../domain.js";
import { DefaultPrimitiveMap } from "../Map.js";
import RowId from "../RowId.js";
import { acce } from "../util.js";

const actions = new Map<string, {
    title: string,
    src: string,
    alt: string,
}>();
actions.set('allow', { title: 'Allow', src: 'img/check.svg', alt: 'Check' });
actions.set('cap', { title: 'Cap at max time', src: 'img/indeterminate.svg', alt: 'Indeterminate' });
actions.set('forbid', { title: 'Forbid', src: 'img/cross.svg', alt: 'Cross' });
const defaultActionId = 'cap';

export default class WarningView {
    readonly rowId: RowId;
    readonly warning: Warning;
    readonly #radios = new DefaultPrimitiveMap<string, HTMLInputElement[]>(() => []);

    constructor(rowId: RowId, warning: Warning) {
        this.rowId = rowId;
        this.warning = warning;
    }

    createSwitchElement(): HTMLElement {
        const div = document.createElement('div');
        div.className = 'switch-warning-actions';
        for (const [actid, act] of actions) {

            const label = acce(div, 'label');
            label.title = act.title;
            label.htmlFor = this.rowId.toString() + actid;

            const img = acce(label, 'img');
            img.src = act.src;

            const rb = acce(label, 'input');
            this.#radios.get(actid).push(rb);
            rb.type = 'radio';
            rb.id = label.htmlFor;
            rb.name = this.rowId.toString();
            rb.value = actid;
            if (actid === defaultActionId) rb.defaultChecked = true;
            rb.addEventListener('input', () => {
                if (!rb.checked) return;
                this.#on(actid);
                for (const other_rb of this.#radios.get(actid)) {
                    other_rb.checked = rb.checked;
                }
            });
        }

        return div;
    }

    #on(actid: string) {
        //let d = this.duration;
        // identify the row
        // change the work time
        void (actid);
    }
}