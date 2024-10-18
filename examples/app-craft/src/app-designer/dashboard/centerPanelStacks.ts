const centerPanelStacks: string[] = [];

export function addCenterPanel(panelId: string) {
    const currentIndex = centerPanelStacks.indexOf(panelId);
    if (currentIndex >= 0) {
        centerPanelStacks.splice(currentIndex, 1);
    }
    centerPanelStacks.push(panelId);
}

export function removeCenterPanel(panelId: string) {
    const currentIndex = centerPanelStacks.indexOf(panelId);
    centerPanelStacks.splice(currentIndex, 1);
    return centerPanelStacks[centerPanelStacks.length - 1];
}