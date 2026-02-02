/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#4f54e3',
                surface: '#ffffff',
                background: '#f7f7f8',
                'text-primary': '#191b1d',
                'text-secondary': '#5f646a',
            },
            fontFamily: {
                sans: ['"Plus Jakarta Sans"', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
