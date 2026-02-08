# 🎯 Analizador Pro Loterías RD

Sistema inteligente de análisis de loterías dominicanas con predicciones basadas en frecuencia, volteos, confluencia y probabilidad matemática.

![Version](https://img.shields.io/badge/version-2.0-gold)
![License](https://img.shields.io/badge/license-MIT-blue)

## 🚀 Demo en Vivo

Despliega gratis en:
- **GitHub Pages**: `Settings → Pages → Source: main → Save`
- **Netlify**: Arrastra la carpeta a [netlify.com/drop](https://app.netlify.com/drop)
- **Vercel**: `npx vercel` desde la terminal

## ✨ Funcionalidades

### 📋 Entrada de Datos
- **Copiar/Pegar automático**: Pega resultados de quinielasrd.com y se organizan solos
- **Todas las loterías RD**: Anguila, King Lottery, La Suerte, Primera, LoteDom, Real, Florida, New York, Gana Más, Loteka, Nacional, Leidsa
- **Datos de Hoy y Ayer**: Pestañas separadas para mayor análisis
- **Entrada manual**: Casillas individuales para cada sorteo

### 🔬 Motor de Análisis
- **Frecuencia global**: Qué números se repiten más
- **Análisis por posición**: Frecuencia en 1ra, 2da y 3ra posición
- **Volteos**: Números invertidos (78 → 87)
- **Pares frecuentes**: Números que aparecen juntos
- **Cooking analysis**: Números de ayer listos para repetir
- **Balanceo y confluencia**: Combinación de múltiples indicadores

### 🎯 Predicciones
- Quiniela Perfecta + Alternativa
- Pale Perfecto + Alternativo
- Tripleta Perfecta + Alternativa
- Barra de confianza con porcentaje
- Métodos usados para cada predicción
- **Sección especial para Gana Más y Lotería Nacional**

## 📁 Estructura

```
analizador-loterias-rd/
├── index.html          # Página principal
├── manifest.json       # PWA manifest
├── css/
│   └── styles.css      # Estilos completos
├── js/
│   ├── lotteries.js    # Base de datos de loterías
│   ├── parser.js       # Parser automático de resultados
│   ├── analyzer.js     # Motor de análisis matemático
│   ├── ui.js           # Rendering de interfaz
│   └── app.js          # Lógica principal
└── img/
    └── favicon.svg     # Ícono
```

## 🛠️ Despliegue

### GitHub Pages (Gratis)
1. Sube este repositorio a GitHub
2. Ve a `Settings → Pages`
3. En Source selecciona `main` branch
4. Tu app estará en `https://tuusuario.github.io/analizador-loterias-rd`

### Netlify (Gratis)
1. Ve a [netlify.com/drop](https://app.netlify.com/drop)
2. Arrastra la carpeta completa
3. ¡Listo! Te da un URL público

### Vercel (Gratis)
```bash
npx vercel
```

## 📱 PWA (App Instalable)
La app incluye manifest.json para instalarse como app en el teléfono:
1. Abre la URL en Chrome/Safari
2. Menú → "Agregar a pantalla de inicio"
3. Se instala como app nativa

## ⚠️ Disclaimer

Las loterías son 100% azar. Este sistema analiza patrones estadísticos para entretenimiento y planificación. No garantiza resultados. **Juega responsable.**

## 📄 Licencia

MIT License — Uso libre.
