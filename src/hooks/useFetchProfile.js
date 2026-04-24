import { useState, useEffect } from 'react';
import { apiGetme, apiGetPublicProfile } from '../api/mainApi';

function useFetchProfile(id, isMe) {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editForm, setEditForm] = useState({
        name: '',
        avatarUrl: '',
        promptPayNumber: '',
        promptPayName: ''
    });

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                setLoading(true);
                const response = isMe ? await apiGetme() : await apiGetPublicProfile(id);
                const userObj = response.data.data;
                setUserData(userObj);

                setEditForm({
                    name: userObj.name || '',
                    avatarUrl: userObj.avatarUrl || '',
                    promptPayNumber: userObj.promptPayNumber || '',
                    promptPayName: userObj.promptPayName || ''
                });
                setError(null);
            } catch (err) {
                console.error("Error fetching profile:", err);
                setError('ไม่สามารถโหลดข้อมูลโปรไฟล์ได้');
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [id, isMe]);

    return {
        userData,
        setUserData,
        loading,
        setLoading,
        error,
        setError,
        editForm,
        setEditForm
    };
}

export default useFetchProfile;