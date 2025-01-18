import { acce } from "./util.js";
export var ActionId;
(function (ActionId) {
    ActionId["Forbid"] = "forbid";
    ActionId["Cap"] = "cap";
    ActionId["Allow"] = "allow";
})(ActionId || (ActionId = {}));
export const actions = new Map();
actions.set(ActionId.Forbid, { title: 'Forbid', src: 'img/cross.svg', alt: 'Cross' });
actions.set(ActionId.Cap, { title: 'Cap at max time', src: 'img/indeterminate.svg', alt: 'Indeterminate' });
actions.set(ActionId.Allow, { title: 'Allow', src: 'img/check.svg', alt: 'Check' });
export function createSwitchWarningActionsElement(baseId, oninput, options = {}) {
    const div = document.createElement('div');
    div.className = 'switch-warning-actions';
    for (const [actid, act] of actions) {
        const label = acce(div, 'label');
        label.title = act.title + (options.titleSuffix ?? '');
        const img = acce(label, 'img');
        img.src = act.src;
        const rb = acce(label, 'input');
        const idBase = baseId(actid, rb);
        rb.id = label.htmlFor = idBase + actid;
        rb.type = 'radio';
        rb.name = idBase;
        rb.value = actid;
        if (options.initialState === actid)
            rb.defaultChecked = true;
        rb.addEventListener('input', () => oninput(actid, rb));
    }
    return div;
}
