# Arquitectura — MCP & Base de Datos

## Visión General

Este proyecto implementa un **MCP (Model Context Protocol)** propio utilizando **Cloudflare Workers** como backend HTTP y **Cloudflare D1 (SQLite)** como base de datos.

El objetivo del MCP es permitir que un **agente de IA** pueda vender productos de forma conversacional, ejecutando acciones reales vía HTTP:

- Explorar productos
- Crear un carrito por conversación
- Agregar, modificar o eliminar productos del carrito
- Consultar el estado del carrito (ítems + total)

El agente se desarrolla en la plataforma de **Laburen** y consume estos endpoints como funciones MCP.

---

## Componentes Principales

### 1. Cloudflare Worker (MCP API)

- Worker desarrollado en **TypeScript**
- Expone endpoints HTTP REST
- Valida inputs, ejecuta queries y devuelve respuestas JSON
- Es el punto de entrada para el agente de IA

### 2. Cloudflare D1 (Base de Datos)

- Base de datos SQLite gestionada por Cloudflare
- Persiste productos, carritos e ítems
- Garantiza **un carrito por conversación**

### 3. Agente de IA (Laburen)

- Mantiene el contexto conversacional mediante `conversation_id`
- Decide qué endpoint MCP ejecutar según la intención del usuario
- Orquesta la experiencia de compra

### 4. Chatwoot (CRM)

- Canal de atención (WhatsApp)
- Permite derivar la conversación a un humano
- Se utilizarán etiquetas para marcar estado del carrito y contexto

---

## Flujo de Datos

Usuario (WhatsApp)
→ Chatwoot (CRM)
→ Agente de IA (Laburen)
→ MCP (Cloudflare Worker)
→ Base de Datos (Cloudflare D1)

---

## Esquema de Base de Datos (D1)

El esquema cumple con el mínimo requerido por el desafío.

### Tabla: products

- id (PK)
- name
- description
- price
- stock

### Tabla: carts

- id (PK)
- conversation_id (UNIQUE)
- created_at
- updated_at

> Se garantiza **un carrito por conversación**.

### Tabla: cart_items

- id (PK)
- cart_id (FK)
- product_id (FK)
- qty

El total del carrito se calcula dinámicamente:

> total = SUM(qty × price)

---

## Carga de Productos (Seed)

Los productos se cargan a partir de un archivo `products.xlsx`.

Flujo:
1. Creación del esquema SQL
2. Generación de datos de seed
3. Ejecución de scripts sobre D1

Esto permite que el MCP sea **100% reproducible**.

---

## Superficie MCP (Endpoints HTTP)

Estos endpoints están pensados para ser consumidos por el agente:

### GET /products

- Lista productos disponibles
- Permite búsqueda opcional por nombre o descripción

### POST /carts

- Crea (o devuelve) un carrito asociado a un `conversation_id`

### GET /carts/:conversation_id

- Devuelve la vista del carrito:
  - Datos del carrito
  - Ítems
  - Total calculado

### POST /carts/update

Permite modificar el carrito según la acción solicitada:

- add → suma cantidad
- set → define cantidad exacta
- remove → elimina el producto del carrito

---

## Desarrollo Local

- Ejecución del Worker en modo desarrollo
- Uso de D1 local mediante Wrangler
- Binding de base de datos configurado como `DB`

---

## Despliegue

- MCP desplegado en **Cloudflare Workers**
- Base de datos desplegada en **Cloudflare D1**
- Agente de IA conectado al MCP desde Laburen
- Chatwoot como interfaz conversacional (WhatsApp)

---

## Objetivo de la Arquitectura

Esta arquitectura permite:

- Mantener una conversación coherente
- Ejecutar acciones reales (no un bot por menús)
- Escalar fácilmente
- Separar claramente responsabilidades:
  - IA (decisión)
  - MCP (acciones)
  - Base de datos (estado)

