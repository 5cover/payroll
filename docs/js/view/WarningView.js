import { maxWorkTime } from "../domain.js";
import { DefaultPrimitiveMap } from "../Map.js";
import { ActionId, createSwitchWarningActionsElement } from "../warningActions.js";
export default class WarningView {
    warning;
    #radios = new DefaultPrimitiveMap(() => []);
    #result;
    #employee;
    #day;
    stateChanged = [];
    #state = ActionId.Cap;
    constructor(result, employee, day, warning) {
        this.#employee = employee;
        this.#day = day;
        this.warning = warning;
        this.#result = result;
    }
    get state() {
        return this.#state;
    }
    set state(value) {
        this.#on(value);
        for (const rb of this.#radios.get(value)) {
            rb.checked = true;
        }
    }
    createSwitchElement(rowId) {
        return createSwitchWarningActionsElement((actid, rb) => `${rowId.toString()}.${this.#radios.get(actid).push(rb)}`, (actid, rb) => {
            if (!rb.checked)
                return;
            this.#on(actid);
            for (const other_rb of this.#radios.get(actid)) {
                other_rb.checked = rb.checked;
            }
        }, { initialState: this.#state });
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
        const oldstate = this.#state;
        this.#state = actid;
        this.stateChanged.forEach(f => f.call(this, oldstate));
    }
}
