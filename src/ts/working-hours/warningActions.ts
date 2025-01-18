import { acce, siteBaseUrl } from "../util.js";

export enum ActionId {
    Forbid = 'forbid',
    Cap = 'cap',
    Allow = 'allow',
}

export const actions = new Map<ActionId, {
    title: string,
    src: string,
    alt: string,
}>();
actions.set(ActionId.Forbid, { title: 'Forbid', src: siteBaseUrl + '/img/cross.svg', alt: 'Cross' });
actions.set(ActionId.Cap, { title: 'Cap at max time', src: siteBaseUrl + '/img/indeterminate.svg', alt: 'Indeterminate' });
actions.set(ActionId.Allow, { title: 'Allow', src: siteBaseUrl + '/img/check.svg', alt: 'Check' });

export function createSwitchWarningActionsElement(
    baseId: (actid: ActionId, rb: HTMLInputElement) => string,
    oninput: (actid: ActionId, rb: HTMLInputElement) => void,
    options: {
        initialState?: ActionId,
        titleSuffix?: string,
    } = {},
): HTMLElement {
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
        if (options.initialState === actid) rb.defaultChecked = true;
        rb.addEventListener('input', () => oninput(actid, rb));
    }

    return div;
}