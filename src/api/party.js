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

// --- Split Bill API (Hybrid Opt-in Flow) ---

const apiAddOrderItem = async (partyId, body) => {
    // body: { menuId, isCustom, name, price, quantity }
    return await mainApi.post(`/parties/${partyId}/items`, body);
}

const apiUpdateOrderItemQuantity = async (partyId, itemId, action) => {
    // action: "increment" | "decrement"
    return await mainApi.put(`/parties/${partyId}/items/${itemId}/quantity`, { action });
}

const apiToggleOrderItemSharer = async (partyId, itemId, action) => {
    // action: "join" | "leave"
    return await mainApi.put(`/parties/${partyId}/items/${itemId}/sharers`, { action });
}

const apiRemoveOrderItem = async (partyId, itemId) => {
    // Delete item entirely from the bill
    return await mainApi.delete(`/parties/${partyId}/items/${itemId}`);
}

const apiGetSplitBill = async (partyId) => {
    return await mainApi.get(`/parties/${partyId}/split-bill`);
}

const apiUpdatePartySettings = async (partyId, body) => {
    // body: { vat, serviceCharge, status }
    return await mainApi.put(`/parties/${partyId}/settings`, body);
}

const apiNotifyPayment = async (partyId, body) => {
    // body: { paymentSlipUrl }
    return await mainApi.post(`/parties/${partyId}/payment/notify`, body);
}

const apiVerifyPayment = async (partyId, userId) => {
    return await mainApi.post(`/parties/${partyId}/payment/verify/${userId}`);
}

const apiCancelPayment = async (partyId) => {
    return await mainApi.post(`/parties/${partyId}/payment/cancel`);
}

export {
    apiGetParties,
    apiGetPartyById,
    apiCreateParty,
    apiJoinParty,
    apiLeaveParty,
    apiKickMember,
    apiAddOrderItem,
    apiUpdateOrderItemQuantity,
    apiToggleOrderItemSharer,
    apiRemoveOrderItem,
    apiGetSplitBill,
    apiUpdatePartySettings,
    apiNotifyPayment,
    apiVerifyPayment,
    apiCancelPayment
}
