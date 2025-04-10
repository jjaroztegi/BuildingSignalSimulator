document.addEventListener("DOMContentLoaded", () => {
  const updateCableLengthButtons = document.querySelectorAll(
    ".update-cable-length"
  );
  const errorMessageElement = document.getElementById("error-message"); // Element for displaying errors
  const simulationDetailsElement =
    document.getElementById("simulation-details");
  const configurationDetailsElement = document.getElementById(
    "configuration-details"
  ); // New element for configuration details

  updateCableLengthButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Clear previous errors
      if (errorMessageElement) errorMessageElement.textContent = "";

      const idDetalle = button.dataset.idDetalle;
      const inputField = document.querySelector(`#cable-length-${idDetalle}`);

      if (!inputField) {
        console.error(`Input field #cable-length-${idDetalle} not found.`);
        displayError(
          `Configuration error: Input field for detail ${idDetalle} is missing.`
        );
        return;
      }

      const newLength = inputField.value;

      // Validate input
      if (!newLength || isNaN(newLength) || newLength <= 0) {
        displayError("Please enter a valid positive cable length.");
        inputField.focus();
        return;
      }

      // Add loading state to button
      button.textContent = "Simulating...";
      button.disabled = true;

      fetch("/simulate", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `id_detalle=${encodeURIComponent(
          idDetalle
        )}&longitud_cable=${encodeURIComponent(newLength)}`,
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          button.textContent = "Update & Simulate";
          button.disabled = false;

          if (data.error) {
            displayError(`Simulation Error: ${data.error}`);
          } else {
            updateSignalLevels(data);
            renderSimulationDetails(data);
          }
        })
        .catch((error) => {
          console.error("Error updating cable length:", error);
          displayError(`An error occurred: ${error.message}`);
          button.textContent = "Update & Simulate";
          button.disabled = false;
        });
    });
  });

  // Replace previous fetch call with new initial state handling
  fetchInitialData();

  function fetchInitialData() {
    fetch("/simulation-details", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          if (response.status === 404) {
            // No active configuration - this is an expected state
            showInitialState();
            return null;
          }
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (data) {
          renderSimulationDetails(data);
        }
      })
      .catch((error) => {
        console.error("Error fetching simulation data:", error);
        displayError("Failed to load simulation data. Please try again later.");
      });
  }

  function showInitialState() {
    simulationDetailsElement.innerHTML = `
        <div class="text-center p-8">
            <div class="mb-4 text-gray-400">
                <svg class="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-700 mb-2">Welcome to the Signal Simulator</h3>
            <p class="text-gray-600">Create a new configuration to start simulating signal distribution in your building.</p>
        </div>`;
  }

  function updateSignalLevels(data) {
    data.forEach((floor) => {
      const signalLevelElement = document.querySelector(
        `#signal-level-${floor.piso}`
      );
      if (signalLevelElement) {
        const signalValue = parseFloat(floor.nivel_final);
        if (!isNaN(signalValue)) {
          signalLevelElement.textContent = `${signalValue.toFixed(2)} dBm`;

          // Update color based on signal level
          signalLevelElement.classList.remove(
            "text-green-600",
            "text-red-600",
            "text-gray-700"
          );
          if (signalValue >= 0) {
            signalLevelElement.classList.add("text-green-600");
          } else {
            signalLevelElement.classList.add("text-red-600");
          }
        } else {
          signalLevelElement.textContent = "Invalid Data";
          signalLevelElement.classList.remove("text-green-600", "text-red-600");
          signalLevelElement.classList.add("text-gray-700");
        }
      } else {
        console.warn(
          `Signal level element #signal-level-${floor.piso} not found.`
        );
      }
    });
  }

  function renderSimulationDetails(data) {
    simulationDetailsElement.innerHTML = ""; // Clear existing content

    if (data.length === 0) {
      simulationDetailsElement.innerHTML =
        "<p class='text-center text-gray-600'>No simulation data available.</p>";
      return;
    }

    data.forEach((floor) => {
      const floorElement = document.createElement("div");
      floorElement.className = "p-4 border rounded-lg bg-gray-50";

      floorElement.innerHTML = `
                <h2 class="text-lg font-semibold text-gray-800">Floor ${
                  floor.piso
                }</h2>
                <p class="text-gray-700">Signal Level: <span id="signal-level-${
                  floor.piso
                }" class="font-bold">${floor.nivel_final.toFixed(
        2
      )} dBm</span></p>
            `;

      simulationDetailsElement.appendChild(floorElement);
    });
  }

  function displayError(message) {
    if (errorMessageElement) {
      errorMessageElement.textContent = message;
      errorMessageElement.classList.remove("hidden");
      setTimeout(() => {
        errorMessageElement.classList.add("hidden");
        errorMessageElement.textContent = "";
      }, 5000);
    } else {
      alert(message);
    }
  }
});
