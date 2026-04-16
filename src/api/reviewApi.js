import { mainApi } from "./mainApi";

const apiGetAllReview = async (restaurantId) => {
    return await mainApi.get(`/restaurants/${restaurantId}/reviews`);
}

const apiCreateReview = async (restaurantId, body) => {
    return await mainApi.post(`/restaurants/${restaurantId}/reviews`, body);
}

const apiDeleteReview = async (reviewId) => {
    return await mainApi.delete(`/reviews/${reviewId}`);
}

export {
    apiGetAllReview,
    apiCreateReview,
    apiDeleteReview
}