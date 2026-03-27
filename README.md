# Cargo Dispatch Protocol

Aplicación web para optimizar la carga de un montacargas automatizado.

## ¿Qué hace?

Dado un límite de peso y una cinta con paquetes de pesos aleatorios, encuentra automáticamente qué secuencia contigua de paquetes maximiza la ocupación del montacargas sin superar el límite de seguridad.

## Algoritmo

Sliding Window (ventana deslizante) con dos punteros.
- Complejidad de tiempo: O(n)
- Complejidad de espacio: O(1)

## Tecnologías

- HTML
- CSS
- JavaScript Vanilla
- Tailwind CSS (CDN)

## Cómo usarlo

1. Ingresá la capacidad máxima del montacargas en kg
2. Configurá la cantidad de paquetes y el rango de pesos
3. Presioná **Generar Cinta Aleatoria**
4. Los paquetes óptimos se resaltan automáticamente en amarillo
5. Presioná **Despachar Viaje** para enviarlos
6. El contador de viajes se resetea automáticamente al generar una nueva cinta

## Estructura del proyecto

cargo-dispatch-v2/
├── index.html    → estructura de la interfaz
├── styles.css    → estilos y animaciones
└── script.js     → lógica del algoritmo y renderizado
