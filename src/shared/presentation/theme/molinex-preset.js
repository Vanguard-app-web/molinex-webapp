import Material from "@primeuix/themes/material";
import {definePreset, palette} from "@primeuix/themes";

/**
 * PrimeVue Material preset adapted to the Molinex identity. Colors live here and in the CSS
 * custom properties of style.css only; components never hard-code them.
 * - primary: Molinex blue (#0B4F8A) and its tints/shades.
 * - surface: neutral blue-grey scale whose key steps are the Molinex text (#102A43),
 *   secondary text (#486581), border (#D9E2EC) and background (#F5F7FA) colors.
 */
export const MolinexPreset = definePreset(Material, {
    semantic: {
        primary: {
            ...palette('#0B4F8A'),
            hoverColor: '{primary.600}',
            activeColor: '{primary.700}',
        },
        surface: {
            0: '#FFFFFF',
            50: '#F5F7FA',
            100: '#EEF2F6',
            200: '#D9E2EC',
            300: '#BCCCDC',
            400: '#9FB3C8',
            500: '#829AB1',
            600: '#486581',
            700: '#334E68',
            800: '#243B53',
            900: '#102A43',
            950: '#0A1C2E',
        },
    },
});
