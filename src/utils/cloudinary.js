import axios from "axios";
import { toast } from "react-toastify";
import { apiCloudinary } from "../api/mainApi";

const uploadCloudinary = async (file, toastContainerId) => {
  try {
    //ไปขอ Signature, Timestamp และ API Key จาก Backend ของเรา
    const authRes = await apiCloudinary();
    const { signature, timestamp, api_key } = authRes.data;

    // สเต็ปที่ 2: เตรียมข้อมูล
    const formData = new FormData();
    formData.append("file", file);

    // [สิ่งที่เปลี่ยนไป] เลิกใช้ upload_preset แบบเดิม และใช้ 3 ตัวนี้แทน
    formData.append("api_key", api_key);
    formData.append("timestamp", timestamp);
    formData.append("signature", signature);
    formData.append("folder", "wongnork");

    // สเต็ปที่ 3: ส่งไป Cloudinary (URL เดิมของคุณ)
    const resp = await axios.post(
      "https://api.cloudinary.com/v1_1/dc8ywsgsf/image/upload",
      formData,
    );

    return resp.data.secure_url;
  } catch (err) {
    console.error("Upload Cloudinary Error:", err);
    toast.error("Upload Image Error", { containerId: toastContainerId });
    throw err;
  }
};

export default uploadCloudinary;
