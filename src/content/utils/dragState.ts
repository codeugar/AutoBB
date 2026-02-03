let activeDragFile: File | null = null;

export const setActiveDragFile = (file: File | null) => {
    activeDragFile = file;
};

export const getActiveDragFile = (): File | null => activeDragFile;
