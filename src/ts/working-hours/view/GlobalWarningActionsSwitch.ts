import { requireElementById } from "../../util.js";
import { ActionId, createSwitchWarningActionsElement } from "../warningActions.js";
import WarningView from "./WarningView.js";

const globalPrefix = 'rb-global-';

export default class GlobalWarningActionsSwitch {
    #warningViews: WarningView[] = [];

    readonly element = createSwitchWarningActionsElement(
        () => globalPrefix,
        actid => {
            for (const wb of this.#warningViews) {
                wb.state = actid;
            }
        },
        { titleSuffix: ' all' }
    );


    register(warningView: WarningView) {
        this.#warningViews.push(warningView);
        this.#updateGlobalState(warningView.state);
        warningView.stateChanged.push(() => this.#updateGlobalState(warningView.state));
    }

    #updateGlobalState(toState: ActionId) {
        if (this.#warningViews.every(wv => wv.state === toState)) {
            (requireElementById(globalPrefix + toState) as HTMLInputElement).checked = true;
        } else {
            // Clear the radio button selection by checking one and unchecking it
            const anyRb = requireElementById(globalPrefix + ActionId.Cap) as HTMLInputElement;
            anyRb.checked = true;
            anyRb.checked = false;
        }
    }
}