import { useState } from "react";
import { toast } from "sonner";
import { apiUpdateProfile } from "../api/mainApi";
import uploadCloudinary from "../utils/cloudinary";

function useEditProfile({ userData, setUserData, editForm, setEditForm }) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSaveProfile = async () => {
        setIsSaving(true);
        try {
            let finalAvatarUrl = editForm.avatarUrl;

            if (selectedFile) {
                finalAvatarUrl = await uploadCloudinary(selectedFile, "toast-container");
            }

            const updateData = {
                name: editForm.name,
                avatarUrl: finalAvatarUrl,
                promptPayNumber: editForm.promptPayNumber,
                promptPayName: editForm.promptPayName
            };

            await apiUpdateProfile(updateData);

            setUserData(prev => ({
                ...prev,
                ...updateData
            }));

            setIsEditModalOpen(false);
            setSelectedFile(null);
            setPreviewUrl('');
            toast.success("อัปเดตโปรไฟล์เรียบร้อย!");
        } catch (err) {
            console.error("Error saving profile:", err);
            toast.error("เกิดข้อผิดพลาดในการบันทึก");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancelEdit = () => {
        setEditForm({
            name: userData.name,
            avatarUrl: userData.avatarUrl || '',
            promptPayNumber: userData.promptPayNumber || '',
            promptPayName: userData.promptPayName || ''
        });
        setPreviewUrl('');
        setSelectedFile(null);
        setIsEditModalOpen(false);
    };

    return {
        isEditModalOpen,
        setIsEditModalOpen,
        isSaving,
        selectedFile,
        previewUrl,
        handleFileChange,
        handleSaveProfile,
        handleCancelEdit
    };
}

export default useEditProfile;