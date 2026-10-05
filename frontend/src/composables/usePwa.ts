import { ref, onMounted } from 'vue';

export function usePwa() {
    const deferredPrompt = ref<any>(null);
    const isInstallable = ref(false);

    onMounted(() => {
        window.addEventListener('beforeinstallprompt', (e: any) => {
            e.preventDefault();
            deferredPrompt.value = e;
            isInstallable.value = true;
        });
    });

    async function install() {
        if (!deferredPrompt.value) return;
        deferredPrompt.value.prompt();
        await deferredPrompt.value.userChoice;
        deferredPrompt.value = null;
        isInstallable.value = false;
    }

    return { isInstallable, install };
}