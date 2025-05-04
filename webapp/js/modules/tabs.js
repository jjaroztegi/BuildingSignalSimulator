// Tab management for switching between UI sections
export function initTabs() {
  const tabButtons = document.querySelectorAll('.tab-button');
  tabButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const tabId = button.id;
      switchTab(tabId);
    });
  });
  // Activate the first tab by default
  const firstTab = tabButtons[0];
  if (firstTab) {
    switchTab(firstTab.id);
  }
}

export function switchTab(tabId) {
  // Map mobile tab IDs to their desktop counterparts
  const mobileToDesktopMap = {
    'config-tab-mobile': 'config-tab',
    'components-tab-mobile': 'components-tab',
    'simulation-tab-mobile': 'simulation-tab',
    'results-tab-mobile': 'results-tab',
    'history-tab-mobile': 'history-tab',
  };
  const desktopTabId = mobileToDesktopMap[tabId] || tabId;

  // Hide all tab contents
  document.querySelectorAll('.tab-content').forEach((content) => {
    content.classList.add('hidden');
  });

  // Update tab button styles
  document.querySelectorAll('.tab-button').forEach((button) => {
    button.classList.remove('active-tab');
    button.classList.add('inactive-tab');
  });

  // Show selected tab content
  const selectedContent = document.getElementById(`${desktopTabId}-content`);
  if (selectedContent) {
    selectedContent.classList.remove('hidden');
  }

  // Highlight selected tab button
  const selectedButton = document.getElementById(tabId);
  if (selectedButton) {
    selectedButton.classList.add('active-tab');
    selectedButton.classList.remove('inactive-tab');
  }

  // Also update the corresponding desktop/mobile button
  const counterpartId = tabId.includes('-mobile')
    ? tabId.replace('-mobile', '')
    : tabId + '-mobile';
  const counterpartButton = document.getElementById(counterpartId);
  if (counterpartButton) {
    counterpartButton.classList.add('active-tab');
    counterpartButton.classList.remove('inactive-tab');
  }

  // Refresh component lists when switching to relevant tabs
  if (desktopTabId === 'simulation-tab') {
    const simulationComponentListType = document.getElementById('simulation-component-list-type');
    if (simulationComponentListType) {
      simulationComponentListType.dispatchEvent(new Event('change'));
    }
  } else if (desktopTabId === 'components-tab') {
    const componentListType = document.getElementById('component-list-type');
    if (componentListType) {
      componentListType.dispatchEvent(new Event('change'));
    }
  }
}
