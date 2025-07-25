import DialogService from 'primevue/dialogservice';
import ConfirmationService from 'primevue/confirmationservice';

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.use(DialogService);
    nuxtApp.vueApp.use(ConfirmationService);
})
