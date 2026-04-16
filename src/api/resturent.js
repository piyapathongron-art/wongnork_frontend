import { mainApi } from "./mainApi";

const apiCreateResturent = async (body) => {
    return await mainApi.post("/resturent", body);
}

const apiGetResturent = async () => {
    return await mainApi.get("/restaurants");
}

const apiGetResturentById = async (id) => {
    return await mainApi.get(`/resturent/${id}`);
}

const apiUpdateResturent = async (id, body) => {
    return await mainApi.put(`/resturent/${id}`, body);
}

const apiDeleteResturent = async (id) => {
    return await mainApi.delete(`/resturent/${id}`)
}

export { apiCreateResturent, apiGetResturent, apiGetResturentById, apiUpdateResturent, apiDeleteResturent }