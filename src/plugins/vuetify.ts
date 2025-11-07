import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    components,
    directives,
    icons: { 
      defaultSet: 'mdi', 
      aliases, 
      sets: { mdi } 
    },
    theme: {
      defaultTheme: 'light',
      themes: {
        light: {
          dark: false,
          colors: { 
            primary: '#4CAF50', 
            secondary: '#FFC107', 
            surface: '#FFFFFF' 
          }
        }
      }
    }
  })
  nuxtApp.vueApp.use(vuetify)
})