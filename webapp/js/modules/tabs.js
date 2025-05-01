// Tab management module
export function initTabs() {
    const tabButtons = document.querySelectorAll(".tab-button");

    // Add click event listeners to tab buttons
    tabButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const tabId = button.id;
            switchTab(tabId);
        });
    });

    // Initialize with the first tab active
    const firstTab = tabButtons[0];
    if (firstTab) {
        switchTab(firstTab.id);
    }
}

export function switchTab(tabId) {
    // Map mobile tab IDs to desktop tab IDs
    const mobileToDesktopMap = {
        "config-tab-mobile": "config-tab",
        "components-tab-mobile": "components-tab",
        "simulation-tab-mobile": "simulation-tab",
        "results-tab-mobile": "results-tab",
        "history-tab-mobile": "history-tab",
    };

    // Get the corresponding desktop tab ID if this is a mobile tab
    const desktopTabId = mobileToDesktopMap[tabId] || tabId;

    // Hide all tab contents
    const tabContents = document.querySelectorAll(".tab-content");
    tabContents.forEach((content) => {
        content.classList.add("hidden");
    });

    // Remove active class and add inactive class to all tab buttons
    const tabButtons = document.querySelectorAll(".tab-button");
    tabButtons.forEach((button) => {
        button.classList.remove("active-tab");
        button.classList.add("inactive-tab");
    });

    // Show the selected tab content
    const selectedContent = document.getElementById(`${desktopTabId}-content`);
    if (selectedContent) {
        selectedContent.classList.remove("hidden");
    }

    // Add active class and remove inactive class from the selected tab button
    const selectedButton = document.getElementById(tabId);
    if (selectedButton) {
        selectedButton.classList.add("active-tab");
        selectedButton.classList.remove("inactive-tab");
    }

    // Also update the corresponding desktop/mobile button
    const counterpartId = tabId.includes("-mobile") ? tabId.replace("-mobile", "") : tabId + "-mobile";
    const counterpartButton = document.getElementById(counterpartId);
    if (counterpartButton) {
        counterpartButton.classList.add("active-tab");
        counterpartButton.classList.remove("inactive-tab");
    }

    // Trigger component list update
    if (desktopTabId === "simulation-tab") {
        const simulationComponentListType = document.getElementById("simulation-component-list-type");
        if (simulationComponentListType) {
            simulationComponentListType.dispatchEvent(new Event("change"));
        }
    } else if (desktopTabId === "components-tab") {
        const componentListType = document.getElementById("component-list-type");
        if (componentListType) {
            componentListType.dispatchEvent(new Event("change"));
        }
    }
}
