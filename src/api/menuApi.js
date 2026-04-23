import { mainApi } from "./mainApi";

const apiGetMenuByRestaurantId = async (restaurantId) => {
    return await mainApi.get(`/restaurants/${restaurantId}/menus`);
}

const apiCreateMenu = async (restaurantId, body) => {
    return await mainApi.post(`/restaurants/${restaurantId}/menus`, body);
}

const apiUpdateMenu = async (restaurantId, menuId, body) => {
    return await mainApi.put(`/restaurants/${restaurantId}/menus/${menuId}`, body);
}

const apiDeleteMenu = async (restaurantId, menuId) => {
    return await mainApi.delete(`/restaurants/${restaurantId}/menus/${menuId}`);
}

export {
    apiGetMenuByRestaurantId,
    apiCreateMenu,
    apiUpdateMenu,
    apiDeleteMenu
}