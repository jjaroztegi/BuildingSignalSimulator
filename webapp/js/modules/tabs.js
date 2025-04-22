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
    // Hide all tab contents
    const tabContents = document.querySelectorAll(".tab-content");
    tabContents.forEach((content) => {
        content.classList.add("hidden");
    });

    // Remove active class from all tab buttons
    const tabButtons = document.querySelectorAll(".tab-button");
    tabButtons.forEach((button) => {
        button.classList.remove("active-tab", "border-blue-500", "text-blue-600", "dark:text-blue-400");
        button.classList.add(
            "border-transparent",
            "text-gray-500",
            "dark:text-gray-400",
            "hover:text-gray-700",
            "dark:hover:text-gray-300",
        );
    });

    // Show the selected tab content
    const selectedContent = document.getElementById(`${tabId}-content`);
    if (selectedContent) {
        selectedContent.classList.remove("hidden");
    }

    // Add active class to the selected tab button
    const selectedButton = document.getElementById(tabId);
    if (selectedButton) {
        selectedButton.classList.add("active-tab", "border-blue-500", "text-blue-600", "dark:text-blue-400");
        selectedButton.classList.remove(
            "border-transparent",
            "text-gray-500",
            "dark:text-gray-400",
            "hover:text-gray-700",
            "dark:hover:text-gray-300",
        );
    }

    // Trigger component list update
    if (tabId === "simulation-tab") {
        const simulationComponentListType = document.getElementById("simulation-component-list-type");
        if (simulationComponentListType) {
            simulationComponentListType.dispatchEvent(new Event("change"));
        }
    } else if (tabId === "components-tab") {
        const componentListType = document.getElementById("component-list-type");
        if (componentListType) {
            componentListType.dispatchEvent(new Event("change"));
        }
    }
}
