import { mainApi } from "./mainApi";

const apiGetParties = async () => {
    const res = await mainApi.get("/parties");
    console.log("API resp", res.data.data)
    return res
}

const apiGetPartyById = async (id) => {
    return await mainApi.get(`/parties/${id}`);
}

const apiCreateParty = async (restaurantId, body) => {
    return await mainApi.post(`/restaurants/${restaurantId}/parties`, body);
}

const apiJoinParty = async (id) => {
    return await mainApi.post(`/parties/${id}/join`);
}

const apiLeaveParty = async (id) => {
    return await mainApi.delete(`/parties/${id}/leave`);
}

// const apiUpdatePartyStatus = async (id, status) => {
//     return await mainApi.patch(`/parties/${id}/status`, { status });
// }

export {
    apiGetParties,
    apiGetPartyById,
    apiCreateParty,
    apiJoinParty,
    apiLeaveParty,
}