import React from 'react';
export interface ImagePreviewModalProps {
    visible: boolean;
    imageUri: string;
    onClose: () => void;
    onSend: (imageUri: string, context: string) => void;
}
declare const ImagePreviewModal: React.FC<ImagePreviewModalProps>;
export default ImagePreviewModal;
//# sourceMappingURL=ImagePreviewModal.d.ts.map