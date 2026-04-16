import { mainApi } from "./mainApi";

const apiGetMenuByRestaurantId = async (restaurantId) => {
    return await mainApi.get(`/restaurants/${restaurantId}/menus`);
}

const apiCreateMenu = async (restaurantId, body) => {
    return await mainApi.post(`/restaurants/${restaurantId}/menus`, body);
}

const apiUpdateMenu = async (menuId, body) => {
    return await mainApi.put(`/menus/${menuId}`, body);
}

const apiDeleteMenu = async (menuId) => {
    return await mainApi.delete(`/menus/${menuId}`);
}

export {
    apiGetMenuByRestaurantId,
    apiCreateMenu,
    apiUpdateMenu,
    apiDeleteMenu
}