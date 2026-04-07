# Blender Hardware Checker

Un consultor de hardware dedicado a usuarios de Blender 4.x de gama baja y media, diseñado para analizar tu equipo, detectar cuellos de botella y crear un plan de priorización para futuras mejoras de hardware, ajustado a tu presupuesto. Otorga resultados transparentes y no necesita instalación.

## ¿Cómo ayuda a los usuarios?

Si tienes problemas al usar Blender, pero no sabes si tu equipo falla más por falta de RAM, un salto tecnológico necesario en gráficos o un procesador muy antiguo, esta app se encarga de:

- **Escanear y diagnosticar tu equipo** utilizando lógica cruzada de requerimientos de Blender.
- Mostrarte visualmente tu **Cuello de Botella más crítico**, de forma que no gastes en RAM cuando en realidad requerías memoria de video (VRAM).
- **Proponer exactamente los componentes con mejor rendimiento coste/beneficio** e incluirte un link directo con las mejores tiendas (Amazon, Google Shopping) de manera transparente para que te informes rápido de la inversión.

*Nota: Todos los diagnósticos de rendimiento y la base de datos de comparación parten de **Blender Open Data Benchmark**.*

## Despliegue con Vercel

Este proyecto ha sido optimizado con una estructura móvil ('mobile-first') y separado de manera modular (`index.html`, `style.css` y `script.js`) para garantizar ligereza y hacer mucho más fluido su despliegue a una URL estática mediante plataformas como Vercel o Github Pages.
