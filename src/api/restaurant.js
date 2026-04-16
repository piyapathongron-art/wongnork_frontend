import { mainApi } from "./mainApi";

const apiCreateRestaurant = async (body) => {
    return await mainApi.post("/restaurants", body);
}

const apiGetRestaurants = async () => {
    return await mainApi.get("/restaurants");
}

const apiGetRestaurantById = async (id) => {
    return await mainApi.get(`/restaurants/${id}`);
}

const apiUpdateRestaurant = async (id, body) => {
    return await mainApi.put(`/restaurants/${id}`, body);
}

const apiDeleteRestaurant = async (id) => {
    return await mainApi.delete(`/restaurants/${id}`)
}

export { apiCreateRestaurant, apiGetRestaurants, apiGetRestaurantById, apiUpdateRestaurant, apiDeleteRestaurant }