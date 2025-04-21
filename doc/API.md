# API Documentation

## Signal Types

### Get Signal Types

Get all available signal types and their quality margins.

**Endpoint:** `GET /signal-types`

**Response:**

```json
[
  {
    "type": "Signal Type Name",
    "min": minimum_level_value,
    "max": maximum_level_value
  }
]
```

## Components

### List Components by Type

Get a list of component models for a specific type.

**Endpoint:** `GET /components?type={type}`

**Parameters:**

-   `type` (required): One of `coaxial`, `derivador`, `distribuidor`, or `toma`

**Response:**

```json
["model1", "model2", "model3"]
```

### Get Component Details

Get detailed information about a specific component.

**Endpoint:** `GET /components?type={type}&model={model}`

**Parameters:**

-   `type` (required): One of `coaxial`, `derivador`, `distribuidor`, or `toma`
-   `model` (required): The model name of the component

**Response by Type:**

#### Coaxial Cable

```json
{
    "costo": 0.0,
    "atenuacion_470mhz": 0.0,
    "atenuacion_694mhz": 0.0
}
```

#### Derivador (Tap)

```json
{
    "costo": 0.0,
    "atenuacion_derivacion": 0.0,
    "atenuacion_paso": 0.0,
    "directividad": 0.0,
    "desacoplo": 0.0,
    "perdidas_retorno": 0.0
}
```

#### Distribuidor (Splitter)

```json
{
    "costo": 0.0,
    "numero_salidas": 0,
    "atenuacion_distribucion": 0.0,
    "desacoplo": 0.0,
    "perdidas_retorno": 0.0
}
```

#### Toma (Outlet)

```json
{
    "costo": 0.0,
    "atenuacion": 0.0,
    "desacoplo": 0.0
}
```

### Add New Component

Add a new component to the system.

**Endpoint:** `POST /components`

**Parameters:**

-   `type` (required): One of `coaxial`, `derivador`, `distribuidor`, or `toma`
-   `modelo` (required): Model name/identifier
-   `costo` (required): Cost of the component
-   `properties` (required): JSON object containing component-specific properties

**Component-Specific Properties:**

#### Coaxial Cable

```json
{
    "atenuacion_470mhz": "12.30",
    "atenuacion_694mhz": "15.57"
}
```

#### Derivador (Tap)

```json
{
    "atenuacion_derivacion": "14.0",
    "atenuacion_paso": "4.5",
    "directividad": "13.0",
    "desacoplo": "16.0",
    "perdidas_retorno": "12.0"
}
```

#### Distribuidor (Splitter)

```json
{
    "numero_salidas": "2",
    "atenuacion_distribucion": "4.0",
    "desacoplo": "19.0",
    "perdidas_retorno": "16.0"
}
```

#### Toma (Outlet)

```json
{
    "atenuacion": "1.0",
    "desacoplo": "14.0"
}
```

**Response:**

```json
{
    "success": "Component added successfully"
}
```

## Configurations

### List Configurations

Get all available configurations.

**Endpoint:** `GET /configurations`

**Response:**

```json
[
    {
        "id_configuraciones": "config_id",
        "nombre": "Configuration Name",
        "nivel_cabecera": 95.0,
        "num_pisos": 5,
        "costo_total": 0.0,
        "fecha_creacion": "2024-03-20 12:00:00",
        "usuario_creacion": "admin",
        "fecha_modificacion": "2024-03-20 12:00:00",
        "usuario_modificacion": "admin"
    }
]
```

### Add New Configuration

Create a new configuration.

**Endpoint:** `POST /configurations`

**Parameters:**

-   `nombre` (required): Name of the configuration
-   `nivel_cabecera` (required): Head-end level in dBm
-   `num_pisos` (required): Number of floors

**Response:**

```json
{
  "success": "Configuration added successfully",
  "id": configuration_id
}
```

### Update Configuration

Update an existing configuration.

**Endpoint:** `PUT /configurations`

**Parameters:**

-   `id_configuraciones` (required): Configuration ID
-   `nombre` (required): Name of the configuration
-   `nivel_cabecera` (required): Head-end level in dBm
-   `num_pisos` (required): Number of floors

**Response:**

```json
{
    "success": "Configuration updated successfully"
}
```

### Delete Configuration

Delete an existing configuration.

**Endpoint:** `DELETE /configurations`

**Parameters:**

-   `id_configuraciones` (required): Configuration ID to delete

**Response:**

```json
{
    "success": "Configuration deleted successfully"
}
```

## Signal Calculation

### Calculate Signal Levels

Calculate and validate signal levels for each floor based on components and configuration, including cost calculations.

**Endpoint:** `POST /calculate`

**Request Body:**

```json
{
    "num_pisos": 5,
    "nivel_cabecera": 95.0,
    "tipo_senal": "signal_type",
    "components": [
        {
            "type": "derivador",
            "model": "DER-2",
            "floor": 1
        },
        {
            "type": "coaxial",
            "model": "RG-6",
            "floor": 1
        },
        {
            "type": "toma",
            "model": "TOMA-1",
            "floor": 1
        }
    ]
}
```

**Parameters:**

-   `num_pisos` (required): Number of floors in the building
-   `nivel_cabecera` (required): Initial signal level at the head-end (dBm)
-   `tipo_senal` (required): Type of signal to validate against quality margins
-   `components` (required): Array of components with their placement
    -   `type`: Component type (`coaxial`, `derivador`, `distribuidor`, or `toma`)
    -   `model`: Model name of the component
    -   `floor`: Floor number where the component is installed

**Component Processing Order:**

1. Derivador/Distribuidor (signal splitting components)
2. Coaxial cables
3. Tomas (outlets)

**Component Placement Rules:**

-   Each floor can have multiple components
-   Components are processed in the order specified above
-   Restrictions per floor:
    -   Maximum one derivador
    -   Maximum one distribuidor
    -   Cannot have both derivador and distribuidor on the same floor
    -   Can have multiple coaxial cables and tomas

**Response:**

```json
{
    "signal_levels": [
        {
            "floor": 1,
            "level": 85.5,
            "status": "ok",
            "floor_cost": 125.5,
            "components": [
                {
                    "type": "derivador",
                    "model": "DER-2",
                    "attenuation": 3.5,
                    "cost": 45.0
                },
                {
                    "type": "coaxial",
                    "model": "RG-6",
                    "attenuation": 2.8,
                    "cost": 35.5
                },
                {
                    "type": "toma",
                    "model": "TOMA-1",
                    "attenuation": 1.2,
                    "cost": 45.0
                }
            ]
        }
    ],
    "margins": {
        "min": 47.0,
        "max": 77.0
    },
    "total_cost": 125.5
}
```

**Response Fields:**

-   `signal_levels`: Array of signal levels for each floor
    -   `floor`: Floor number
    -   `level`: Final signal level in dBm after all component attenuations
    -   `status`: "ok" if within margins, "error" if outside margins
    -   `floor_cost`: Total cost of all components on this floor
    -   `components`: Array of components on this floor and their individual effects
        -   `type`: Component type
        -   `model`: Component model
        -   `attenuation`: Individual attenuation contribution in dB
        -   `cost`: Individual component cost
-   `margins`: Quality margins for the specified signal type
    -   `min`: Minimum acceptable signal level
    -   `max`: Maximum acceptable signal level
-   `total_cost`: Total cost of all components in the configuration

**Error Response:**

```json
{
    "error": "Error description"
}
```

Common error cases:

-   Missing or invalid parameters
-   Component not found
-   Invalid component type
-   Invalid signal type
-   Multiple derivadores on same floor
-   Multiple distribuidores on same floor
-   Both derivador and distribuidor on same floor
