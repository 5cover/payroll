import { Employee, maxWorkTime, Warning } from "../domain.js";
import { DefaultPrimitiveMap } from "../Map.js";
import RowId from "../model/RowId.js";
import Result from "../model/Result.js";
import { ActionId, createSwitchWarningActionsElement} from "../warningActions.js";

export default class WarningView {
    readonly warning: Warning;
    readonly #radios = new DefaultPrimitiveMap<string, HTMLInputElement[]>(() => []);
    readonly #result: Result;
    readonly #employee: Employee;
    readonly #day: Date;

    stateChanged: ((this: this, oldValue: ActionId) => void)[] = [];

    #state: ActionId = ActionId.Cap;

    constructor(result: Result, employee: Employee, day: Date, warning: Warning) {
        this.#employee = employee;
        this.#day = day;
        this.warning = warning;
        this.#result = result;
    }

    get state() {
        return this.#state;
    }

    set state(value: ActionId) {
        this.#on(value);
        for (const rb of this.#radios.get(value)) {
            rb.checked = true;
        }
    }

    createSwitchElement(rowId: RowId): HTMLElement {
        return createSwitchWarningActionsElement(
            (actid, rb) => `${rowId.toString()}.${this.#radios.get(actid).push(rb)}`,
            (actid, rb) => {
                if (!rb.checked) return;
                this.#on(actid);
                for (const other_rb of this.#radios.get(actid)) {
                    other_rb.checked = rb.checked;
                }
            },
            { initialState: this.#state },
        );
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

        const oldstate = this.#state;
        this.#state = actid;
        this.stateChanged.forEach(f => f.call(this, oldstate));
    }
}
