// Tailwind v4 : la configuration du thème se fait dans src/index.css via @theme.
// Ce fichier est conservé pour la compatibilité des outils (IDE, etc.).
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
}

export default config
