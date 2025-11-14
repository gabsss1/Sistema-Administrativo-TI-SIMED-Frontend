# Instrucciones para agregar el logo de SIMED

## ¿Dónde colocar el logo?

Coloca tu archivo de logo con el nombre `simed-logo.png` en la siguiente carpeta:
```
public/logos/simed-logo.png
```

## Especificaciones recomendadas del logo:

- **Formato:** PNG (recomendado) o JPG
- **Tamaño:** 40x40 píxeles (o mayor, se redimensionará automáticamente)
- **Fondo:** Preferiblemente transparente (PNG)
- **Calidad:** Alta resolución para mejor visualización

## Formatos soportados:
- `simed-logo.png` (recomendado)
- `simed-logo.jpg`
- `simed-logo.jpeg`
- `simed-logo.svg`

## Fallback:
Si no se encuentra el archivo de logo, se mostrará automáticamente un icono de fallback con el color principal de la aplicación (#015b9a).

## Cambios realizados:

✅ **Color principal actualizado a #015b9a**
- Aplicado en modo claro y oscuro
- Colores convertidos a formato OKLCH para mejor rendimiento
- Sidebar, botones y elementos primarios ahora usan el nuevo color

✅ **Logo agregado al sidebar**
- Reemplaza el texto "SIMED" con una imagen
- Incluye fallback automático si no se encuentra el logo
- Responsive y optimizado para diferentes tamaños de pantalla

## Estructura del sidebar actualizada:
```
[LOGO] SIMED
       Admin Panel
```

El logo aparece a la izquierda del texto "SIMED" en el sidebar.