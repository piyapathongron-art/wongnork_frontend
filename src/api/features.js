import { mainApi } from "./mainApi";

export async function apiAiRecommend(body) {
  return await mainApi.post("/features/ai-recommend", body);
}
