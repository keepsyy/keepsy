// images.js - Cloudinary Upload

const Images = {
    upload: async function (file) {
        if (!file) return null;

        const url = `https://api.cloudinary.com/v1_1/${CONFIG.CLOUDINARY_CLOUD_NAME}/image/upload`;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CONFIG.CLOUDINARY_UPLOAD_PRESET);

        try {
            const res = await fetch(url, {
                method: 'POST',
                body: formData
            });
            const data = await res.json();

            if (data.secure_url) {
                return data.secure_url;
            } else {
                throw new Error(data.error?.message || 'Upload Failed');
            }
        } catch (e) {
            console.error("Cloudinary Upload Error:", e);
            throw e;
        }
    }
};
