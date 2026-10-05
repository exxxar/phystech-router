import { ref, onBeforeUnmount } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';

export function useUnsavedChanges() {
    const isDirty = ref(false);

    const markAsDirty = () => {
        isDirty.value = true;
    };

    const markAsClean = () => {
        isDirty.value = false;
    };

    onBeforeRouteLeave((to, from, next) => {
        if (isDirty.value) {
            const confirmed = window.confirm(
                'Есть несохранённые изменения. Вы действительно хотите покинуть страницу?'
            );
            next(confirmed);
        } else {
            next();
        }
    });

    const handleBeforeUnload = (e) => {
        if (isDirty.value) {
            e.preventDefault();
            e.returnValue = '';
        }
    };

    if (typeof window !== 'undefined') {
        window.addEventListener('beforeunload', handleBeforeUnload);
        onBeforeUnmount(() => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        });
    }

    return {
        isDirty,
        markAsDirty,
        markAsClean
    };
}