# Prototipo: Visualización de Equipos y Componentes

Este documento detalla el plan técnico para construir el prototipo interactivo de la vista de "Visualización de equipos y componentes", cumpliendo con todos los requerimientos de experiencia de usuario y lógica de negocio solicitados.

## Proposed Changes

### 1. Configuración del Proyecto y Entorno
- **COMPLETADO**: Inicialización de Vite + React + TS, e instalación de Tailwind CSS y shadcn/ui.
- **PENDIENTE**: Instalar componentes específicos de shadcn/ui (table, select, input, button, etc.).

### 2. Estructura de la Aplicación (Layout)
- **Menú Lateral (Sidebar):** 
  - Se replicará el menú mostrado en la imagen.
  - **Ajuste solicitado:** Dentro de la sección "INVENTARIO", se dejará únicamente la opción **"Accesspoint activos"** (eliminando "Accesspoint mantención" y otros que no sean relevantes para este contexto).
- **Barra Superior (Encabezado de Tabla):**
  - Título: "Visualización de equipos y componentes" / "Listado de AccessPoint activos".
  - **Ajuste solicitado:** Junto al selector de "Mostrar [25]", se agregará un **Buscador (Input text)** que permitirá filtrar los equipos en la tabla según sus estados, componentes u otros criterios.

### 3. Componente Principal: Tabla Interactiva (DataGrid)
Se construirá una tabla compleja con las siguientes características:
- **Filas Expandibles:** Cada fila principal tendrá un ícono para expandir/colapsar una sub-tabla con los "Componentes del equipo" (como se ve en la imagen).
- **Columnas de la Fila Principal:**
  1. Observaciones generales (Input text o Select)
  2. Tipo de lata (Select)
  3. Estado (Select)
  4. ID lata (Input numérico)
  5. ID totem (Input numérico)
  6. **N/s dongle (Select - Detonador de autocompletado)**
  7. **Licencia (Solo lectura - Autocompletado)**
  8. **Término de licencia (Solo lectura - Autocompletado)**
  9. **ID cliente (Select - Detonador de autocompletado)**
  10. **Nombre cliente (Solo lectura - Autocompletado)**
  11. **Ubicación (Solo lectura - Autocompletado)**
  12. Versión APP (Input text)
  13. Inicio de operaciones (Input Date)

### 4. Lógica de Negocio y Mock Data
Se creará un estado en React (`useState`) con datos ficticios para simular una base de datos:
- **Catálogo de Dongles:** Al elegir un "N/s dongle", la aplicación buscará en el catálogo y autocompletará las celdas de "Licencia" y "Término de licencia", cambiándoles el fondo a gris para indicar que no son editables.
- **Catálogo de Clientes:** Al elegir un "ID cliente", se buscará el cliente y se autocompletarán "Nombre cliente" y "Ubicación", también en gris.

## Verification Plan

### Manual Verification
1. **Inicialización:** Verificar que el proyecto compila y corre localmente con `npm run dev`.
2. **Interfaz UI:** Revisar que el menú lateral ya no tenga "Accesspoint mantención" y que la barra superior tenga el nuevo buscador.
3. **Interacciones de la Tabla:**
   - Cambiar el "N/s dongle" en una fila y confirmar que "Licencia" y "Término de licencia" se actualizan automáticamente y están bloqueados.
   - Cambiar el "ID cliente" y verificar que "Nombre cliente" y "Ubicación" se actualizan y bloquean.
   - Expandir una fila y ver la sub-tabla de componentes.
   - Escribir en el buscador y ver cómo se filtran los resultados de la tabla.
