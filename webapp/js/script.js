document.addEventListener("DOMContentLoaded", () => {
    // --- Dark Mode Management ---
    const isDarkMode =
        localStorage.theme === "dark" ||
        (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches);

    // Apply the initial theme
    document.documentElement.classList.toggle("dark", isDarkMode);

    // Add theme toggle button to header
    const header = document.querySelector("header");
    const themeToggle = document.createElement("button");
    themeToggle.className =
        "absolute top-4 right-4 p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors";
    themeToggle.innerHTML = `
    <span class="sr-only">Toggle theme</span>
    <svg class="w-6 h-6 text-gray-800 dark:text-gray-200 block dark:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
    <svg class="w-6 h-6 text-gray-800 dark:text-gray-200 hidden dark:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  `;

    themeToggle.addEventListener("click", () => {
        document.documentElement.classList.toggle("dark");
        localStorage.theme = document.documentElement.classList.contains("dark") ? "dark" : "light";
    });

    header.style.position = "relative";
    header.appendChild(themeToggle);

    // --- DOM Element References ---
    const initialConfigForm = document.getElementById("initial-config-form");
    const errorMessageElement = document.getElementById("error-message");
    const successMessageElement = document.getElementById("success-message");
    const simulationDetailsElement = document.getElementById("simulation-details");
    const configurationSummaryElement = document.getElementById("configuration-summary");
    const optimizeButton = document.getElementById("optimize-button");
    const componentForm = document.getElementById("component-form");
    const qualityForm = document.getElementById("quality-form");
    const configSelect = document.getElementById("id_configuracion");

    // --- Form Submission Logic ---
    if (initialConfigForm) {
        initialConfigForm.addEventListener("submit", handleFormSubmit);
    }

    if (optimizeButton) {
        optimizeButton.addEventListener("click", handleOptimization);
    }

    if (componentForm) {
        componentForm.addEventListener("submit", handleComponentSubmit);
    }

    if (qualityForm) {
        qualityForm.addEventListener("submit", handleQualitySubmit);
    }

    if (configSelect) {
        configSelect.addEventListener("change", handleConfigChange);
    }

    // --- Initial Data Load ---
    fetchInitialData();
    fetchComponents();

    // --- Event Handlers ---
    async function handleFormSubmit(event) {
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

        const submitButton = initialConfigForm.querySelector('button[type="submit"]');
        setLoadingState(submitButton, true);

        try {
            const response = await fetch("configurations", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams(formData).toString(),
            });
            const data = await response.json();

            if (response.ok && data.success) {
                displaySuccess(data.success);
                initialConfigForm.reset();
                fetchInitialData();
            } else {
                const errorMsg = data?.error || `Request failed with status ${response.status}`;
                displayError(`Configuration Error: ${errorMsg}`);
            }
        } catch (error) {
            console.error("Error submitting configuration:", error);
            displayError(`A network or unexpected error occurred: ${error.message}`);
        } finally {
            setLoadingState(submitButton, false);
        }
    }

    async function handleOptimization() {
        const idConfiguracion = configSelect.value;

        if (!idConfiguracion) {
            displayError("Please select a configuration.");
            return;
        }

        setLoadingState(optimizeButton, true);

        try {
            const response = await fetch("optimize", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({
                    id_configuracion: idConfiguracion,
                    id_frecuencia: "1", // Default frequency ID
                }).toString(),
            });
            const data = await response.json();

            if (response.ok && data.success) {
                displaySuccess(data.success);
                fetchInitialData(); // Refresh the configuration list
            } else {
                const errorMsg = data?.error || "Unknown error occurred";
                displayError(`Optimization Error: ${errorMsg}`);
            }
        } catch (error) {
            console.error("Error during optimization:", error);
            displayError(`Failed to optimize configuration: ${error.message}`);
        } finally {
            setLoadingState(optimizeButton, false);
        }
    }

    async function fetchComponentsByType(type) {
        const listElement = document.getElementById(`${type}-list`);
        if (!listElement) return;

        try {
            listElement.innerHTML = '<div class="text-gray-500 dark:text-gray-400">Loading...</div>';

            const response = await fetch(`components?type=${type}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (!Array.isArray(data)) {
                throw new Error("Invalid response format: expected array");
            }

            updateComponentList(type, data);
        } catch (error) {
            console.error(`Error fetching ${type}:`, error);
            listElement.innerHTML = `<div class="text-red-500 dark:text-red-400">Error loading ${type}: ${error.message}</div>`;
        }
    }

    async function fetchComponents() {
        const types = ["cables", "derivadores", "distribuidores", "amplificadores", "tomas"];
        try {
            await Promise.all(types.map((type) => fetchComponentsByType(type)));
        } catch (error) {
            console.error("Error in fetchComponents:", error);
            displayError("Failed to load some components. Please try refreshing the page.");
        }
    }

    function updateComponentList(type, componentModelos) {
        const listElement = document.getElementById(`${type}-list`);
        if (!listElement) return;

        // Clear existing content
        listElement.innerHTML = "";

        if (!Array.isArray(componentModelos)) {
            listElement.innerHTML = '<div class="text-red-500 dark:text-red-400">Invalid data format</div>';
            return;
        }

        if (componentModelos.length === 0) {
            listElement.innerHTML = '<div class="text-gray-500 dark:text-gray-400">No components available</div>';
            return;
        }

        // Add each component as a card
        componentModelos.forEach((modelo) => {
            const card = document.createElement("div");
            card.className =
                "bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600";

            card.innerHTML = `
                <div class="font-medium text-gray-900 dark:text-gray-100">${modelo}</div>
                <!-- Radio button commented out as per requirements
                <div class="mt-2">
                    <input type="radio" name="${type}_id" value="${modelo}" class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700">
                    <label class="ml-2 text-sm text-gray-700 dark:text-gray-300">Select</label>
                </div>
                -->
            `;
            listElement.appendChild(card);
        });
    }

    async function handleComponentSubmit(event) {
        event.preventDefault();
        clearMessages();

        const formData = new FormData(componentForm);
        const type = formData.get("type");
        const modelo = formData.get("modelo");
        const costo = formData.get("costo");

        if (!type || !modelo || !costo || isNaN(costo)) {
            displayError("Please fill in all fields with valid values.");
            return;
        }

        const submitButton = componentForm.querySelector('button[type="submit"]');
        setLoadingState(submitButton, true);

        try {
            const response = await fetch("components", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams(formData).toString(),
            });
            const data = await response.json();

            if (response.ok && data.success) {
                displaySuccess(data.success);
                componentForm.reset();
                // Refresh only the relevant component list
                await fetchComponentsByType(type);
            } else {
                const errorMsg = data?.error || `Request failed with status ${response.status}`;
                displayError(`Component Error: ${errorMsg}`);
            }
        } catch (error) {
            console.error("Error adding component:", error);
            displayError(`A network or unexpected error occurred: ${error.message}`);
        } finally {
            setLoadingState(submitButton, false);
        }
    }

    async function handleQualitySubmit(event) {
        event.preventDefault();
        clearMessages();

        const formData = new FormData(qualityForm);
        const tipoSenal = formData.get("tipo_senal");
        const nivelMinimo = formData.get("nivel_minimo");
        const nivelMaximo = formData.get("nivel_maximo");

        if (!tipoSenal || !nivelMinimo || !nivelMaximo || isNaN(nivelMinimo) || isNaN(nivelMaximo)) {
            displayError("Please fill in all fields with valid values.");
            return;
        }

        const submitButton = qualityForm.querySelector('button[type="submit"]');
        setLoadingState(submitButton, true);

        try {
            const response = await fetch("validate-quality", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams(formData).toString(),
            });
            const data = await response.json();

            if (response.ok && data.success) {
                displaySuccess(data.success);
                qualityForm.reset();
                fetchQualityMargins();
            } else {
                const errorMsg = data?.error || `Request failed with status ${response.status}`;
                displayError(`Quality Error: ${errorMsg}`);
            }
        } catch (error) {
            console.error("Error adding quality margins:", error);
            displayError(`A network or unexpected error occurred: ${error.message}`);
        } finally {
            setLoadingState(submitButton, false);
        }
    }

    function handleConfigChange() {
        const idConfiguracion = this.value;
        if (idConfiguracion) {
            const selectedConfig = Array.from(configSelect.options).find((option) => option.value === idConfiguracion);
            if (selectedConfig) {
                renderSimulationDetails(JSON.parse(selectedConfig.dataset.config));
            }
            const tipoSenal = qualityForm?.querySelector('select[name="tipo_senal"]')?.value;
            if (tipoSenal) {
                fetchQualityMargins();
            }
        }
    }

    async function fetchInitialData() {
        try {
            const response = await fetch("configurations");
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            if (Array.isArray(data)) {
                updateConfigSelect(data);
                if (data.length > 0) {
                    const selectedConfig = configSelect.value || data[0].id;
                    renderSimulationDetails(data[0]);
                }
            } else {
                throw new Error("Invalid response format: expected array of configurations");
            }
        } catch (error) {
            console.error("Error fetching initial data:", error);
            displayError(`Failed to load configurations: ${error.message}`);
        }
    }

    async function fetchQualityMargins() {
        const idConfiguracion = configSelect?.value;
        const tipoSenal = qualityForm?.querySelector('select[name="tipo_senal"]')?.value;

        if (!idConfiguracion || !tipoSenal) {
            console.warn("Missing required parameters for quality margins");
            return;
        }

        try {
            const response = await fetch(
                `validate-quality?id_configuracion=${idConfiguracion}&tipo_senal=${tipoSenal}`
            );
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            updateQualityDisplay(data);
        } catch (error) {
            console.error("Error fetching quality margins:", error);
            displayError(`Failed to load quality margins: ${error.message}`);
        }
    }

    function updateConfigSelect(configurations) {
        if (!configSelect) return;

        configSelect.innerHTML = configurations
            .map((config) => {
                const option = document.createElement("option");
                option.value = config.id;
                option.textContent = config.nombre;
                option.dataset.config = JSON.stringify(config);
                return option.outerHTML;
            })
            .join("");

        if (configurations.length > 0 && !configSelect.value) {
            configSelect.value = configurations[0].id;
        }
    }

    function updateQualityDisplay(data) {
        if (!simulationDetailsElement) return;

        const table = document.createElement("table");
        table.className = "min-w-full divide-y divide-gray-200 dark:divide-gray-700";

        const thead = document.createElement("thead");
        thead.innerHTML = `
            <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Floor</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Signal Level</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
            </tr>
        `;

        const tbody = document.createElement("tbody");
        data.forEach((item) => {
            const tr = document.createElement("tr");
            tr.className = item.is_valid ? "bg-green-50 dark:bg-green-900" : "bg-red-50 dark:bg-red-900";
            tr.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">${item.piso}</td>
                <td class="px-6 py-4 whitespace-nowrap">${item.nivel_senal.toFixed(2)} dB</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${
                            item.is_valid
                                ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                                : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                        }">
                        ${item.is_valid ? "Valid" : "Invalid"}
                    </span>
                </td>
            `;
            tbody.appendChild(tr);
        });

        table.appendChild(thead);
        table.appendChild(tbody);
        simulationDetailsElement.innerHTML = "";
        simulationDetailsElement.appendChild(table);
    }

    function renderSimulationDetails(data) {
        if (!simulationDetailsElement) return;

        const detailsHtml = `
            <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <h3 class="text-lg font-semibold mb-4">Simulation Details</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p class="text-sm text-gray-600 dark:text-gray-400">Configuration</p>
                        <p class="font-medium">${data.nombre}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-600 dark:text-gray-400">Headend Level</p>
                        <p class="font-medium">${data.nivel_cabecera} dB</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-600 dark:text-gray-400">Number of Floors</p>
                        <p class="font-medium">${data.num_pisos}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-600 dark:text-gray-400">Created</p>
                        <p class="font-medium">${new Date(data.fecha_creacion).toLocaleString()}</p>
                    </div>
                </div>
            </div>
        `;

        simulationDetailsElement.innerHTML = detailsHtml;
    }

    function setLoadingState(button, isLoading) {
        if (!button) return;
        button.disabled = isLoading;
        button.innerHTML = isLoading
            ? '<span class="inline-block animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></span>'
            : button.getAttribute("data-original-text") || button.textContent;
    }

    function displayError(message) {
        if (!errorMessageElement) return;
        errorMessageElement.textContent = message;
        errorMessageElement.classList.remove("hidden");
        successMessageElement?.classList.add("hidden");
    }

    function displaySuccess(message) {
        if (!successMessageElement) return;
        successMessageElement.textContent = message;
        successMessageElement.classList.remove("hidden");
        errorMessageElement?.classList.add("hidden");
    }

    function clearMessages() {
        errorMessageElement?.classList.add("hidden");
        successMessageElement?.classList.add("hidden");
    }
});
