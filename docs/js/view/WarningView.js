import { maxWorkTime } from "../domain.js";
import { DefaultPrimitiveMap } from "../Map.js";
import { acce } from "../util.js";
var ActionId;
(function (ActionId) {
    ActionId["Forbid"] = "forbid";
    ActionId["Cap"] = "cap";
    ActionId["Allow"] = "allow";
})(ActionId || (ActionId = {}));
const actions = new Map();
actions.set(ActionId.Forbid, { title: 'Forbid', src: 'img/cross.svg', alt: 'Cross' });
actions.set(ActionId.Cap, { title: 'Cap at max time', src: 'img/indeterminate.svg', alt: 'Indeterminate' });
actions.set(ActionId.Allow, { title: 'Allow', src: 'img/check.svg', alt: 'Check' });
export default class WarningView {
    warning;
    #radios = new DefaultPrimitiveMap(() => []);
    #result;
    #employee;
    #day;
    #state = ActionId.Cap;
    constructor(result, employee, day, warning) {
        this.#employee = employee;
        this.#day = day;
        this.warning = warning;
        this.#result = result;
    }
    createSwitchElement(rowId) {
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
            if (this.#state === actid)
                rb.defaultChecked = true;
            rb.addEventListener('input', () => {
                if (!rb.checked)
                    return;
                this.#on(actid);
                for (const other_rb of this.#radios.get(actid)) {
                    other_rb.checked = rb.checked;
                }
            });
        }
        return div;
    }
    #on(actid) {
        if (this.#state === actid)
            return;
        const shift = this.#result.employeeShifts.get(this.#employee).get(this.#day);
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
                }
                else {
                    wt += maxWorkTime;
                }
                break;
        }
        shift.workTime = wt;
        this.#state = actid;
    }
}
