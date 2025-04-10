document.addEventListener("DOMContentLoaded", () => {
  // --- Dark Mode Management ---
  const isDarkMode = localStorage.theme === 'dark' || 
    (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  
  // Apply the initial theme
  document.documentElement.classList.toggle('dark', isDarkMode);

  // Add theme toggle button to header
  const header = document.querySelector('header');
  const themeToggle = document.createElement('button');
  themeToggle.className = 'absolute top-4 right-4 p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors';
  themeToggle.innerHTML = `
    <span class="sr-only">Toggle theme</span>
    <svg class="w-6 h-6 text-gray-800 dark:text-gray-200 block dark:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 9.003 0 0012 21a9.003 9.003 9.003 9.003 0 008.354-5.646z" />
    </svg>
    <svg class="w-6 h-6 text-gray-800 dark:text-gray-200 hidden dark:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  `;
  
  themeToggle.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    localStorage.theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  });
  
  header.style.position = 'relative';
  header.appendChild(themeToggle);

  // --- DOM Element References ---
  const initialConfigForm = document.getElementById("initial-config-form");
  const errorMessageElement = document.getElementById("error-message");
  const successMessageElement = document.getElementById("success-message");
  const simulationDetailsElement =
    document.getElementById("simulation-details");

  // --- Form Submission Logic ---
  if (initialConfigForm) {
    initialConfigForm.addEventListener("submit", handleFormSubmit);
  }

  // --- Initial Data Load ---
  fetchInitialData();

  // --- Event Handlers ---
  function handleFormSubmit(event) {
    event.preventDefault();
    clearMessages();

    const formData = new FormData(initialConfigForm);
    const configName = formData.get("nombre");
    const nivelCabecera = formData.get("nivel_cabecera");
    const numPisos = formData.get("num_pisos");

    // Basic client-side validation
    if (
      !configName ||
      !nivelCabecera ||
      !numPisos ||
      isNaN(nivelCabecera) ||
      isNaN(numPisos) ||
      parseInt(numPisos) <= 0
    ) {
      displayError("Please fill in all fields with valid values (Floors > 0).");
      return;
    }

    const submitButton = initialConfigForm.querySelector(
      'button[type="submit"]'
    );
    setLoadingState(submitButton, true);

    // Send data using relative path
    fetch("configurations", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(formData).toString(),
    })
      .then(handleFetchResponse) // Consolidate response handling
      .then(({ ok, status, data }) => {
        if (ok && data.success) {
          displaySuccess(data.success);
          initialConfigForm.reset();
          fetchInitialData(); // Refresh display
        } else {
          const errorMsg =
            data?.error || `Request failed with status ${status}`;
          displayError(`Configuration Error: ${errorMsg}`);
          console.error("Configuration Error Response:", status, data);
        }
      })
      .catch((error) => {
        console.error("Error submitting configuration (Fetch Catch):", error);
        displayError(
          `A network or unexpected error occurred: ${error.message}`
        );
      })
      .finally(() => {
        setLoadingState(submitButton, false); // Always restore button state
      });
  }

  // --- Data Fetching ---
  function fetchInitialData() {
    clearMessages();
    simulationDetailsElement.innerHTML =
      '<p class="text-center text-gray-500 italic p-4">Loading simulation data...</p>';

    fetch("simulation-details", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
      .then(handleFetchResponse)
      .then((data) => {
        // data here is already parsed { ok, status, data }
        if (data.ok) {
          renderSimulationDetails(data.data); // Render floor details table
        } else if (data.status === 404) {
          showInitialState(); // Handle expected "No configuration"
        } else {
          // Handle other errors already parsed in handleFetchResponse
          throw new Error(
            data.data?.error || `HTTP error! Status: ${data.status}`
          );
        }
      })
      .catch((error) => {
        console.error("Error fetching simulation data (Catch):", error);
        displayError(`Failed to load simulation data: ${error.message}`);
        simulationDetailsElement.innerHTML = `<div class="p-4 border rounded-lg bg-red-50 text-red-700 text-center"><strong>Error Loading Data</strong><br>${error.message}</div>`;
      });
  }

  // --- UI Rendering ---
  function showInitialState() {
    simulationDetailsElement.innerHTML = `
        <div class="text-center p-6 border rounded-lg bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <svg class="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9zm3.75 11.625a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/></svg>
            <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">Hi there! No Active Simulation</h3>
            <p class="text-gray-600 dark:text-gray-400 text-sm">Create a new configuration to start.</p>
        </div>`;
  }

  function renderSimulationDetails(floorData) {
    simulationDetailsElement.innerHTML = ""; // Clear loading/previous state

    if (!Array.isArray(floorData) || floorData.length === 0) {
      simulationDetailsElement.innerHTML =
        "<p class='text-center text-gray-600 dark:text-gray-400 p-4'>No floor data found for the latest configuration.</p>";
      return;
    }

    const tableContainer = document.createElement("div");
    tableContainer.className =
      "overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm";
    let tableHTML = `
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-800">
                <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Floor</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Initial Signal (dBm)</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status (Example)</th>
                </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">`;

    floorData.forEach((floor) => {
      const signalValue = parseFloat(floor.nivel_final);
      const displayValue = isNaN(signalValue) ? "N/A" : signalValue.toFixed(2);
      const valueClass = isNaN(signalValue) ? "text-gray-500 dark:text-gray-400" : "text-gray-800 dark:text-gray-200";

      let statusText = "N/A";
      let statusStyle = "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
      if (!isNaN(signalValue)) {
        if (signalValue >= 45.0 && signalValue <= 70.0) {
          // Example OK range
          statusText = "OK";
          statusStyle = "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
        } else {
          statusText = "Check";
          statusStyle = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
        }
      }

      tableHTML += `
            <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">${floor.piso}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm ${valueClass} font-mono">${displayValue}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                    <span class="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyle}">
                        ${statusText}
                    </span>
                </td>
            </tr>`;
    });

    tableHTML += `</tbody></table>`;
    tableContainer.innerHTML = tableHTML;
    simulationDetailsElement.appendChild(tableContainer);
  }

  // --- Helper Functions ---
  async function handleFetchResponse(response) {
    // Centralized function to handle response parsing and potential errors
    let data = {};
    try {
      data = await response.json();
    } catch (e) {
      console.error("Failed to parse JSON response:", e);
      data = {
        error: `Invalid response from server (Status: ${response.status}). Expected JSON.`,
      };
    }
    return { ok: response.ok, status: response.status, data };
  }

  function setLoadingState(button, isLoading) {
    if (!button) return;
    if (isLoading) {
      button.originalText = button.textContent; // Store original text
      button.textContent = "Processing...";
      button.disabled = true;
    } else {
      button.textContent = button.originalText || "Submit"; // Restore text
      button.disabled = false;
    }
  }

  function displayError(message) {
    if (!errorMessageElement) return;
    errorMessageElement.textContent = message;
    errorMessageElement.classList.remove("hidden");
    if (successMessageElement) successMessageElement.classList.add("hidden"); // Hide success
  }

  function displaySuccess(message) {
    if (!successMessageElement) return;
    successMessageElement.textContent = message;
    successMessageElement.classList.remove("hidden");
    if (errorMessageElement) errorMessageElement.classList.add("hidden"); // Hide error
    setTimeout(clearMessages, 4000); // Auto-hide
  }

  function clearMessages() {
    if (errorMessageElement) errorMessageElement.classList.add("hidden");
    if (successMessageElement) successMessageElement.classList.add("hidden");
  }
});
