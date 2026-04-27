import { createApp, h } from 'vue';
import Home from './main.vue';

import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

// Minor UI tweaks (font, buttons, selects)
import './pos-tweaks.css';

// Company color palettes
const companyThemes = {
    // Demo 1 — Royal purple & gold
    'Demo 1': {
        dark: false,
        colors: {
            background: '#F7F5FF',
            surface: '#FFFFFF',
            primary: '#5A189A',
            secondary: '#F9C74F',
            accent: '#9D4EDD',
            success: '#43AA8B',
            info: '#277DA1',
            warning: '#F8961E',
            error: '#D00000',
            'on-primary': '#FFFFFF',
            'on-secondary': '#1A1A1A',
            'on-surface': '#222222',
            'on-background': '#222222',
        },
    },

    // Demo 2 — Sunset orange & navy
    'Demo 2': {
        dark: false,
        colors: {
            background: '#FFF4EF',
            surface: '#FFFFFF',
            primary: '#0B3C5D',
            secondary: '#FF7F50',
            accent: '#FFB703',
            success: '#2A9D8F',
            info: '#3A86FF',
            warning: '#FB8500',
            error: '#D90429',
            'on-primary': '#FFFFFF',
            'on-secondary': '#FFFFFF',
            'on-surface': '#1C1C1C',
            'on-background': '#1C1C1C',
        },
    },

    // Demo 3 — Dark slate & neon mint
    'Demo 3': {
        dark: false,
        colors: {
            background: '#F4FAF8',
            surface: '#FFFFFF',
            primary: '#264653',
            secondary: '#06D6A0',
            accent: '#118AB2',
            success: '#2EC4B6',
            info: '#3A86FF',
            warning: '#FFBE0B',
            error: '#E63946',
            'on-primary': '#FFFFFF',
            'on-secondary': '#003B2F',
            'on-surface': '#202020',
            'on-background': '#202020',
        },
    },
};

// Map company names to theme keys
function getThemeForCompany(companyName) {
    if (companyThemes[companyName]) return companyName;
    return 'Demo 1'; // fallback default
}

frappe.provide('frappe.PosApp');

frappe.PosApp.posapp = class {
    constructor({ parent }) {
        this.$parent = $(document);
        this.page = parent.page;
        this.make_body();
    }
    
    make_body () {
        this.$el = this.$parent.find('.main-section');

        // Build themes object for Vuetify
        const themes = {};
        for (const [name, theme] of Object.entries(companyThemes)) {
            themes[name] = theme;
        }

        const vuetify = createVuetify({
            components,
            directives,
            theme: {
                defaultTheme: 'Demo 1',
                themes,
            },
        });

        // Expose for theme switching
        window.__posVuetify = vuetify;
        window.__posGetTheme = getThemeForCompany;

        // Create Vue 3 app
        const app = createApp({
            render: () => h(Home),
        });

        app.use(vuetify);
        app.mount(this.$el[0]);
    }

    setup_header () {
        // Optional setup logic
    }
};
