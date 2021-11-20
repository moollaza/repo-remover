const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
	// add this section
	purge: ["./src/**/*.html", "./src/**/*.svelte"],

	// or 'media' or 'class'
	darkMode: false,

	theme: {
		extend: {
			fontFamily: {
				sans: ["Inter var", ...defaultTheme.fontFamily.sans],
			},
			container: {
				center: true,
				padding: {
					DEFAULT: "1rem",
					sm: "2rem",
					lg: "4rem",
					xl: "5rem",
					"2xl": "6rem",
				},
			},
		},
	},

	variants: {
		extend: {
			opacity: ["disabled"],
		},
	},

	plugins: [require("@tailwindcss/forms")],
	mode: "jit",
};
