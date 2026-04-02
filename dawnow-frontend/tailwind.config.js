/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    green: '#16a34a',
                    'green-dark': '#15803d',
                    'green-light': '#dcfce7',
                },
                brand: {
                    blue: '#2563eb',
                    'blue-light': '#dbeafe',
                }
            },
            fontFamily: {
                heading: ['Poppins', 'sans-serif'],
                body: ['Nunito', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
