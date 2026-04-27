import { useEffect, useState } from "react";


function useGetLocation() {
    const [location, setLocation] = useState(null);
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                () => {
                    console.warn('Geolocation not allowed');
                }
            );
        } else {
            console.warn('Geolocation not supported');
        }
    }, []);
    return {
        location,
        setLocation
    }
}

export default useGetLocation