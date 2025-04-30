# Signal Simulator API Documentation

## Overview

-   Base URL: `https://signal.aroztegi.com`
-   Content Type: `application/json`
-   Character Encoding: `UTF-8`

## Error Responses

All endpoints may return the following error responses:

```json
{
    "error": "Error message description"
}
```

Common HTTP Status Codes:

-   200: Success
-   400: Bad Request (missing parameters, invalid data)
-   404: Not Found (resource doesn't exist)
-   500: Internal Server Error (database errors, etc.)

## Endpoints

### Signal Types

#### GET /signal-types

Retrieves all available signal types and their quality margins.

**Response:**

```json
[
    {
        "type": "string",
        "min": number,
        "max": number
    }
]
```

### Components

#### GET /components

Retrieves component information.

**Query Parameters:**

-   `type` (required): Component type (`coaxial`, `derivador`, `distribuidor`, `toma`)
-   `model` (optional): Specific model name

**Response:**

```json
// When only type is provided
["model1", "model2", "model3"]

// When both type and model are provided
{
    "costo": number,
    // Component-specific properties
}
```

#### POST /components

Creates a new component.

**Query Parameters:**

-   `type` (required): Component type
-   `modelo` (required): Model name
-   `costo` (required): Cost value
-   `properties` (required): JSON string with component-specific properties

**Response:**

```json
{
    "success": "Component added successfully"
}
```

#### PUT /components

Updates an existing component.

**Query Parameters:**
Same as POST

**Response:**

```json
{
    "success": "Component updated successfully"
}
```

#### DELETE /components

Deletes a component.

**Query Parameters:**

-   `type` (required): Component type
-   `modelo` (required): Model name

**Response:**

```json
{
    "success": "Component deleted successfully"
}
```

### Configurations

#### GET /configurations

Retrieves all configurations.

**Response:**

```json
[
    {
        "id_configuraciones": number,
        "nombre": "string",
        "nivel_cabecera": number,
        "num_pisos": number,
        "costo_total": number,
        "fecha_creacion": "string"
    }
]
```

#### POST /configurations

Creates a new configuration.

**Query Parameters:**

-   `nombre` (required): Configuration name
-   `nivel_cabecera` (required): Head-end level
-   `num_pisos` (required): Number of floors

**Response:**

```json
{
    "success": "Configuration created successfully",
    "id": number
}
```

#### PUT /configurations

Updates a configuration.

**Query Parameters:**

-   `id_configuraciones` (required): Configuration ID
-   `nombre` (required): Configuration name
-   `nivel_cabecera` (required): Head-end level
-   `num_pisos` (required): Number of floors

**Response:**

```json
{
    "success": "Configuration updated successfully"
}
```

#### DELETE /configurations

Deletes a configuration.

**Query Parameters:**

-   `id_configuraciones` (required): Configuration ID

**Response:**

```json
{
    "success": "Configuration deleted successfully"
}
```

### Signal Calculation

#### POST /calculate

Calculates signal levels and validates against margins.

**Request Body:**

```json
{
    "num_pisos": number,
    "nivel_cabecera": number,
    "tipo_senal": "string",
    "frequency": number,
    "selected_cable_model": "string",
    "components": [
        {
            "type": "string",
            "model": "string",
            "floor": number
        }
    ]
}
```

**Response:**

```json
{
    "signal_levels": [
        {
            "floor": number,
            "level": number,
            "status": "string",
            "floor_cost": number,
            "components": [
                {
                    "type": "string",
                    "model": "string",
                    "attenuation": number,
                    "cost": number
                }
            ]
        }
    ],
    "margins": {
        "min": number,
        "max": number
    },
    "total_cost": number
}
```

### Schematic

#### GET /schematic

Retrieves schematic components.

**Query Parameters:**

-   `id_simulaciones` (required): Simulation ID

**Response:**

```json
[
    {
        "id_esquematicos": number,
        "id_simulaciones": number,
        "piso": number,
        "tipo_componente": "string",
        "modelo_componente": "string",
        "posicion_x": number,
        "posicion_y": number,
        "cable_tipo": "string"
    }
]
```

#### POST /schematic

Adds a schematic component.

**Query Parameters:**

-   `id_simulaciones` (required): Simulation ID
-   `tipo` (required): Component type
-   `modelo` (required): Model name
-   `piso` (required): Floor number
-   `posicion_x` (required): X position
-   `posicion_y` (required): Y position
-   `cable_tipo` (optional): Cable type

**Response:**

```json
{
    "success": "Componente guardado exitosamente",
    "id": number
}
```

#### PUT /schematic

Updates a schematic component.

**Query Parameters:**

-   `id_esquematicos` (required): Schematic component ID
-   `piso` (required): Floor number
-   `tipo_componente` (required): Component type
-   `modelo_componente` (required): Model name
-   `posicion_x` (required): X position
-   `posicion_y` (required): Y position
-   `cable_tipo` (required): Cable type

**Response:**

```json
{
    "success": "Componente actualizado exitosamente"
}
```

#### DELETE /schematic

Deletes a schematic component.

**Query Parameters:**

-   `id_esquematicos` (required): Schematic component ID

**Response:**

```json
{
    "success": "Componente eliminado exitosamente"
}
```

### Simulation History

#### GET /history

Retrieves simulation history.

**Query Parameters:**

-   `id_configuraciones` (required): Configuration ID

**Response:**

```json
[
    {
        "id_simulaciones": number,
        "id_configuraciones": number,
        "frecuencia": number,
        "tipo_senal": "string",
        "costo_total": number,
        "estado": "string",
        "fecha_simulacion": "string",
        "nombre_edificio": "string",
        "nivel_cabecera": number,
        "num_pisos": number
    }
]
```

#### POST /history

Adds a simulation to history.

**Request Body:**

```json
{
    "id_configuraciones": number,
    "frecuencia": number,
    "tipo_senal": "string",
    "costo_total": number,
    "estado": "string"
}
```

**Response:**

```json
{
    "success": "Simulacion guardada exitosamente",
    "id": number
}
```

#### DELETE /history

Deletes a simulation from history.

**Query Parameters:**

-   `id_simulaciones` (required): Simulation ID

**Response:**

```json
{
    "success": "Simulacion eliminada exitosamente"
}
```

### Simulation Results

#### GET /results

Retrieves simulation results.

**Query Parameters:**

-   `id_simulaciones` (required): Simulation ID

**Response:**

```json
[
    {
        "id_resultados_simulacion": number,
        "id_simulaciones": number,
        "piso": number,
        "nivel_senal": number,
        "costo_piso": number,
        "estado": "string"
    }
]
```

#### POST /results

Saves simulation results.

**Request Body:**

```json
{
    "id_simulaciones": number,
    "results": [
        {
            "floor": number,
            "level": number,
            "floor_cost": number,
            "status": "string"
        }
    ]
}
```

**Response:**

```json
{
    "success": "Resultados guardados exitosamente"
}
```

#### DELETE /results

Deletes simulation results.

**Query Parameters:**

-   `id_simulaciones` (required): Simulation ID

**Response:**

```json
{
    "success": "Resultados eliminados exitosamente"
}
```

## Notes

1. All endpoints return JSON responses
2. All string values in responses are properly escaped
3. All numeric values are returned as numbers (not strings)
4. Dates are returned in "yyyy-MM-dd HH:mm:ss" format
5. Error messages are in Spanish as per the implementation
