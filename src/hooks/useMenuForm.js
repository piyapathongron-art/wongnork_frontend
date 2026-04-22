import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { createMenuSchema } from '../validations/schema'
import uploadCloudinary from "../utils/cloudinary";
import { apiCreateMenu } from "../api/menuApi";
import { toast } from "react-toastify";


export const useMenuForm = (restaurantId, onSuccess, onClose) => {
    const [isUploading, setIsUploading] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm({
        resolver: zodResolver(createMenuSchema),
        defaultValues: { name: '', description: '', price: '', category: 'others', imageUrl: '' }
    })

    const handleUpload = async (file) => {
        if (!file) return;
        setIsUploading(true)
        try {
            const url = await uploadCloudinary(file)
            form.setValue('imageUrl', url, { shouldValidate: true })
        } catch (err) {
            console.error(err)
        } finally {
            setIsUploading(false)
        }
    }

    const onSubmit = async (data) => {
        setIsSubmitting(true)
        try {
            await apiCreateMenu(restaurantId, data)
            toast.success("New Menu Added")
            form.reset()
            if (onSuccess) {
                await onSuccess()
            }
            onClose()
        } catch (err) {
            toast.error("Added fail")
        } finally {
            setIsSubmitting(false)
        }
    }
    return { form, handleUpload, onSubmit, isUploading, isSubmitting }
}