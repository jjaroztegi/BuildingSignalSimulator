document.addEventListener("DOMContentLoaded", () => {
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
    // configurationSummaryElement.classList.add("hidden"); // Removed for baseline
    simulationDetailsElement.innerHTML = `
        <div class="text-center p-6 border rounded-lg bg-gray-50">
            <svg class="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9zm3.75 11.625a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/></svg>
            <h3 class="text-lg font-semibold text-gray-700 mb-2">No Active Simulation</h3>
            <p class="text-gray-600 text-sm">Create a new configuration to start.</p>
        </div>`;
  }

  function renderSimulationDetails(floorData) {
    simulationDetailsElement.innerHTML = ""; // Clear loading/previous state

    if (!Array.isArray(floorData) || floorData.length === 0) {
      simulationDetailsElement.innerHTML =
        "<p class='text-center text-gray-600 p-4'>No floor data found for the latest configuration.</p>";
      return;
    }

    const tableContainer = document.createElement("div");
    tableContainer.className =
      "overflow-x-auto rounded-lg border border-gray-200 shadow-sm";
    let tableHTML = `
        <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Floor</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Initial Signal (dBm)</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status (Example)</th>
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">`;

    floorData.forEach((floor) => {
      const signalValue = parseFloat(floor.nivel_final);
      const displayValue = isNaN(signalValue) ? "N/A" : signalValue.toFixed(2);
      const valueClass = isNaN(signalValue) ? "text-gray-500" : "text-gray-800";

      let statusText = "N/A";
      let statusStyle = "bg-gray-100 text-gray-700";
      if (!isNaN(signalValue)) {
        if (signalValue >= 45.0 && signalValue <= 70.0) {
          // Example OK range
          statusText = "OK";
          statusStyle = "bg-green-100 text-green-800";
        } else {
          statusText = "Check";
          statusStyle = "bg-yellow-100 text-yellow-800";
        }
      }

      tableHTML += `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${floor.piso}</td>
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
