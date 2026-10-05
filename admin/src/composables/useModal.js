import { ref } from 'vue';

export function useModal() {
    const isVisible = ref(false);
    const modalData = ref(null);

    const openModal = (data = null) => {
        modalData.value = data;
        isVisible.value = true;
    };

    const closeModal = () => {
        isVisible.value = false;
        modalData.value = null;
    };

    return {
        isVisible,
        modalData,
        openModal,
        closeModal
    };
}