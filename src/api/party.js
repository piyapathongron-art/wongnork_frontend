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

const apiKickMember = async (partyId, userId) => {
    return await mainApi.delete(`/parties/${partyId}/members/${userId}`);
}

// const apiUpdatePartyStatus = async (id, status) => {
//     return await mainApi.patch(`/parties/${id}/status`, { status });
// }

const apiAddOrderItem = async (partyId, body) => {
    // body can be { menuId } or { customItemId }
    return await mainApi.post(`/parties/${partyId}/items`, body);
}

const apiRemoveOrderItem = async (partyId, itemId) => {
    return await mainApi.delete(`/parties/${partyId}/items/${itemId}`);
}

const apiAddCustomItem = async (partyId, body) => {
    return await mainApi.post(`/parties/${partyId}/custom-items`, body);
}

const apiGetSplitBill = async (partyId) => {
    return await mainApi.get(`/parties/${partyId}/split-bill`);
}

export {
    apiGetParties,
    apiGetPartyById,
    apiCreateParty,
    apiJoinParty,
    apiLeaveParty,
    apiKickMember,
    apiAddOrderItem,
    apiRemoveOrderItem,
    apiGetSplitBill,
    apiAddCustomItem
}