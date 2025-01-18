import { requireElementById } from "../util.js";
import { ActionId, createSwitchWarningActionsElement } from "../warningActions.js";
const globalPrefix = 'rb-global-';
export default class GlobalWarningActionsSwitch {
    #warningViews = [];
    element = createSwitchWarningActionsElement(() => globalPrefix, actid => {
        for (const wb of this.#warningViews) {
            wb.state = actid;
        }
    }, { titleSuffix: ' all' });
    register(warningView) {
        this.#warningViews.push(warningView);
        this.#updateGlobalState(warningView.state);
        warningView.stateChanged.push(() => this.#updateGlobalState(warningView.state));
    }
    #updateGlobalState(toState) {
        if (this.#warningViews.every(wv => wv.state === toState)) {
            requireElementById(globalPrefix + toState).checked = true;
        }
        else {
            const anyRb = requireElementById(globalPrefix + ActionId.Cap);
            anyRb.checked = true;
            anyRb.checked = false;
        }
    }
}
