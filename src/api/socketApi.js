import { mainApi } from "./mainApi";

const apiGetMessage = async (roomId) => {
    return await mainApi.get(`/socket/messages/${roomId}`);
}

export {
    apiGetMessage
}