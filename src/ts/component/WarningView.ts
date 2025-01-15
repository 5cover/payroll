import { Employee, maxWorkTime, Warning } from "../domain.js";
import { DefaultPrimitiveMap } from "../Map.js";
import RowId from "../RowId.js";
import { acce } from "../util.js";
import Result from "../model/Result.js";

enum ActionId {
    Forbid = 'forbid',
    Cap = 'cap',
    Allow = 'allow',
}

const actions = new Map<ActionId, {
    title: string,
    src: string,
    alt: string,
}>();
actions.set(ActionId.Forbid, { title: 'Forbid', src: 'img/cross.svg', alt: 'Cross' });
actions.set(ActionId.Cap, { title: 'Cap at max time', src: 'img/indeterminate.svg', alt: 'Indeterminate' });
actions.set(ActionId.Allow, { title: 'Allow', src: 'img/check.svg', alt: 'Check' });

export default class WarningView {
    readonly warning: Warning;
    readonly #radios = new DefaultPrimitiveMap<string, HTMLInputElement[]>(() => []);
    readonly #result: Result;
    readonly #employee: Employee;
    readonly #day: Date;
    #state: ActionId = ActionId.Cap;

    constructor(result: Result, employee: Employee, day: Date, warning: Warning) {
        this.#employee = employee;
        this.#day = day;
        this.warning = warning;
        this.#result = result;
    }

    createSwitchElement(rowId: RowId): HTMLElement {
        const div = document.createElement('div');
        div.className = 'switch-warning-actions';
        for (const [actid, act] of actions) {
            const label = acce(div, 'label');
            label.title = act.title;
            
            const img = acce(label, 'img');
            img.src = act.src;
            
            const rb = acce(label, 'input');
            const idBase = `${rowId.toString()}.${this.#radios.get(actid).push(rb)}`;
            label.htmlFor = idBase + actid;
            rb.type = 'radio';
            rb.id = label.htmlFor;
            rb.name = idBase;
            rb.value = actid;
            if (this.#state === actid) rb.defaultChecked = true;
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

    #on(actid: ActionId) {
        if (this.#state === actid) return;
        // the worktime from the result view is combined (it may be from multiple warnings)
        // we cannot trust its value.
        const shift = this.#result.employeeShifts.get(this.#employee)!.get(this.#day);
        let wt = shift.workTime;
        const realWorkTime = this.warning.hourEnd - this.warning.hourStart;

        switch (this.#state) {
            case ActionId.Allow:
                wt -= realWorkTime;
                if (actid === ActionId.Cap) {
                    wt += maxWorkTime;
                }
                break;
            case ActionId.Cap:
                wt -= maxWorkTime;
                if (actid === ActionId.Allow) {
                    wt += realWorkTime;
                }

                break;
            case ActionId.Forbid:
                if (actid === ActionId.Allow) {
                    wt += realWorkTime;
                } else {
                    wt += maxWorkTime;
                }
                break;
        }

        shift.workTime = wt;

        this.#state = actid;
    }
}