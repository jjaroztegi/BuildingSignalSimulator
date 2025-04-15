// Tab management module
// Module-level constants for tab elements
const tabButtons = document.querySelectorAll(".tab-button");
const tabContents = document.querySelectorAll(".tab-content");

export function initTabs() {
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

// Function to switch tabs
export function switchTab(tabId) {
    // Hide all tab contents
    tabContents.forEach((content) => {
        content.classList.add("hidden");
    });

    // Remove active class from all tab buttons
    tabButtons.forEach((button) => {
        button.classList.remove("active-tab", "border-blue-500", "text-blue-600", "dark:text-blue-400");
        button.classList.add(
            "border-transparent",
            "text-gray-500",
            "dark:text-gray-400",
            "hover:text-gray-700",
            "dark:hover:text-gray-300"
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
            "dark:hover:text-gray-300"
        );
    }
}
