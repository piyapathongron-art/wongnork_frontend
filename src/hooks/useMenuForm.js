import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { createMenuSchema } from '../validations/schema'
import uploadCloudinary from "../utils/cloudinary";
import { apiCreateMenu, apiUpdateMenu } from "../api/menuApi";
import { toast } from "sonner";


export const useMenuForm = (restaurantId, onSuccess, onClose, editData) => {
    const [isUploading, setIsUploading] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm({
        resolver: zodResolver(createMenuSchema),
        defaultValues: { name: '', description: '', price: '', category: 'others', imageUrl: '' }
    })

    useEffect(() => {
        if(editData) {
            form.reset({
                name: editData.name,
                description: editData.description,
                price: editData.price,
                category: editData.category,
                imageUrl: editData.imageUrl || ""
            })
        } else {
            form.reset({
                name:'', description:'',price:'',category:'others',imageUrl:''
            })
        }
    }, [editData, form])

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
            if(editData) {
                await apiUpdateMenu(restaurantId, editData.id, data)
                toast.success("Menu Updated")
            } else{
                await apiCreateMenu(restaurantId, data)
                toast.success("Menu Added")
            }
            form.reset()
            if(onSuccess) await onSuccess()
                onClose()
        } catch(err) {
            toast.error(editData? "Update Failed" : "Create Failed")
        } finally{
            setIsSubmitting(false)
        }
    }
    return { form, handleUpload, onSubmit, isUploading, isSubmitting }
}