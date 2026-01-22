# Diseño del Agente de IA — Flujo Conversacional

## Objetivo

El objetivo del agente de IA es asistir a un usuario en la compra de productos de forma **conversacional**, manteniendo coherencia de contexto y ejecutando acciones reales mediante un **MCP (Model Context Protocol)** propio.

El agente **no funciona como un bot de menús**, sino que interpreta la intención del usuario y decide qué función MCP ejecutar en cada momento.

---

## Capacidades del Agente

El agente es capaz de:

- Explorar productos disponibles
- Mostrar información de productos
- Crear un carrito por conversación
- Agregar productos al carrito
- Modificar cantidades
- Eliminar productos del carrito
- Consultar el estado del carrito
- Derivar la conversación a un humano cuando corresponde

---

## Flujo Conversacional General

```text
Inicio de conversación
        ↓
Usuario explora productos
        ↓
Agente ejecuta MCP: list_products
        ↓
Usuario expresa intención de compra
        ↓
Agente ejecuta MCP: create_cart
        ↓
Agente ejecuta MCP: update_cart (add)
        ↓
Usuario edita carrito (opcional)
        ↓
Agente ejecuta MCP: update_cart (set / remove)
        ↓
Usuario solicita ayuda humana (opcional)
        ↓
Agente deriva conversación a humano (Chatwoot)
```

---

## Flujo Detallado por Intención

### 1. Exploración de Productos

**Ejemplo de intención:**
- "Quiero ver productos"
- "¿Qué camisetas tenés?"

**Acción del agente:**
- Llama a la función MCP `list_products`
- Presenta los resultados al usuario

---

### 2. Creación de Carrito

**Ejemplo de intención:**
- "Quiero comprar este producto"
- "Agregá la camiseta al carrito"

**Acción del agente:**
- Llama a `create_cart` usando el `conversation_id`
- Llama a `update_cart` con acción `add`

---

### 3. Edición de Carrito (Extra)

**Ejemplo de intención:**
- "Agregá otra más"
- "Dejame 3"
- "Sacá ese producto"

**Acción del agente:**
- Llama a `update_cart` con la acción correspondiente:
  - `add`
  - `set`
  - `remove`

---

### 4. Consulta de Carrito

**Ejemplo de intención:**
- "¿Qué tengo en el carrito?"
- "Mostrame el total"

**Acción del agente:**
- Llama a `get_cart`
- Devuelve ítems y total al usuario

---

### 5. Derivación a Humano

**Ejemplo de intención:**
- "Quiero hablar con una persona"
- "Necesito ayuda"

**Acción del agente:**
- Abre conversación en Chatwoot
- Agrega etiquetas indicando:
  - Estado del carrito
  - Motivo de la derivación

---

## Relación Agente ↔ MCP

| Intención del Usuario | Función MCP Ejecutada |
|----------------------|-----------------------|
| Explorar productos | list_products |
| Comprar producto | create_cart + update_cart (add) |
| Editar carrito | update_cart (set / remove) |
| Ver carrito | get_cart |
| Pedir humano | Derivación Chatwoot |

---

## Principios de Diseño

- El agente mantiene **contexto por conversación**
- No se utilizan menús rígidos
- Cada acción del usuario puede disparar una llamada MCP
- El estado del carrito siempre se obtiene desde la base de datos
- El agente prioriza claridad y continuidad conversacional

---

## Alcance del Documento

Este documento describe el **diseño conceptual y el flujo de interacción del agente**, cumpliendo con la fase conceptual del desafío.

La implementación técnica del MCP y la base de datos se documenta en `architecture.md`.
