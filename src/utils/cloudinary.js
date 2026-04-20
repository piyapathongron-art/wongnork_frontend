import axios from "axios";
import { toast } from "react-toastify";
import { apiCloudinary } from "../api/mainApi";

/**
 * Standardized Cloudinary Upload Utility
 * 1. ดึง Signature, Timestamp, CloudName จาก Backend (ป้องกัน Hardcode)
 * 2. สร้าง Signed URL เพื่อความปลอดภัยสูงสุด
 * @param {File} file - ไฟล์ที่ต้องการอัปโหลด
 * @param {string} toastContainerId - ID สำหรับแสดง Toast Notification
 */
const uploadCloudinary = async (file, toastContainerId) => {
  try {
    // สเต็ปที่ 1: ไปขอ Signature, Timestamp และ API Key จาก Backend
    // ส่ง folder: 'wongnork' ไปเพื่อให้ Backend สร้าง Signature ให้ตรงกัน
    const authRes = await apiCloudinary("wongnork");


    const { signature, timestamp, api_key, cloud_name, folder } = authRes.data;
    console.log(authRes.data)

    // สเต็ปที่ 2: เตรียมข้อมูล FormData
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", api_key);
    formData.append("timestamp", timestamp);
    formData.append("signature", signature);
    formData.append("folder", folder);

    // สเต็ปที่ 3: ส่งไป Cloudinary โดยใช้ cloud_name ที่ได้จาก API
    const resp = await axios.post(
      `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
      formData,
    );

    // ส่งคืน secure_url สำหรับเก็บลง Database
    return resp.data.secure_url;
  } catch (err) {
    console.error("Upload Cloudinary Error:", err);
    toast.error("Upload Image Error", { containerId: toastContainerId });
    throw err;
  }
};

export default uploadCloudinary;
