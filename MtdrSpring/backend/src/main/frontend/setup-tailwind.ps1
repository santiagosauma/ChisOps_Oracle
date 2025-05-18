# Script para instalar y configurar Tailwind CSS

Write-Host "Instalando Tailwind CSS y dependencias..."
npm install -D tailwindcss postcss autoprefixer

Write-Host "Creando archivos de configuración..."

# Crear tailwind.config.js si no existe
$tailwindConfig = @"
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {},
  },
  plugins: [],
}
"@

Set-Content -Path "tailwind.config.js" -Value $tailwindConfig

# Crear postcss.config.js si no existe
$postcssConfig = @"
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
"@

Set-Content -Path "postcss.config.js" -Value $postcssConfig

Write-Host "Configuración completada. Ahora ejecuta 'npm run start' para iniciar el servidor de desarrollo."
