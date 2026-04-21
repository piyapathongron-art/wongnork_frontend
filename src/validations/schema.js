import { z } from "zod";

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร")
      .transform((val) => val.trim()),
    email: z
      .email("รูปแบบอีเมลไม่ถูกต้อง")
      .transform((val) => val.trim().toLowerCase()),
    password: z.string().min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
    confirmPassword: z.string().min(1, "กรุณายืนยันรหัสผ่าน"),
  })
  .refine((input) => input.password === input.confirmPassword, {
    message: "รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z
    .email("รูปแบบอีเมลไม่ถูกต้อง")
    .min(1, "กรุณากรอกอีเมล")
    .transform((val) => val.trim().toLowerCase()),
  password: z.string().min(1, "กรุณากรอกรหัสผ่าน"),
});

const restaurantSchema = z.object({
  name: z.string()
    .min(1, "กรุณากรอกชื่อร้าน")
    .max(255, "ชื่อร้านต้องไม่เกิน 255 ตัวอักษร"),

  description: z.string()
    .max(255, "รายละเอียดร้านต้องไม่เกิน 255 ตัวอักษร")
    .optional(),

  category: z.string()
    .min(1, "กรุณากรอกประเภทร้าน")
    .max(255, "ประเภทร้านต้องไม่เกิน 255 ตัวอักษร"),

  lat: z.number({ required_error: "กรุณากรอกละติจูด", invalid_type_error: "ละติจูดต้องเป็นตัวเลข" })
    .min(-90, "ละติจูดต้องไม่ต่ำกว่า -90")
    .max(90, "ละติจูดต้องไม่เกิน 90"),

  lng: z.number({ required_error: "กรุณากรอกลองจิจูด", invalid_type_error: "ลองจิจูดต้องเป็นตัวเลข" })
    .min(-180, "ลองจิจูดต้องไม่ต่ำกว่า -180")
    .max(180, "ลองจิจูดต้องไม่เกิน 180"),
});

// สำหรับ Create สามารถดึง Schema ตัวหลักไปใช้ได้เลย
export const createRestaurantSchema = restaurantSchema;

// สำหรับ Update ใช้ .partial() เพื่อให้สามารถส่งมาแค่อย่างใดอย่างหนึ่งได้
export const updateRestaurantSchema = restaurantSchema.partial();

// สร้างparty
export const createPartySchema = z.object({
  name: z.string()
    .min(1, "กรุณากรอกชื่อปาร์ตี้")
    .max(255, "ชื่อปาร์ตี้ต้องไม่เกิน 255 ตัวอักษร")
    .optional()
    .nullable(),

  details: z.string()
    .max(1000, "รายละเอียดปาร์ตี้ต้องไม่เกิน 1000 ตัวอักษร")
    .optional()
    .nullable(),

  meetupTime: z.string()
    .refine((val) => !isNaN(Date.parse(val)), "รูปแบบวันที่และเวลาไม่ถูกต้อง")
    .transform((val) => new Date(val)),

  maxParticipants: z.number({ 
    required_error: "กรุณากรอกจำนวนคนรับ", 
    invalid_type_error: "จำนวนคนต้องเป็นตัวเลข" 
  }).min(2, "จำนวนคนต้องมีอย่างน้อย 2 คน"),

  contactInfo: z.string()
    .min(1, "กรุณากรอกช่องทางติดต่อ")
    .max(255, "ช่องทางติดต่อต้องไม่เกิน 255 ตัวอักษร"),

  serviceCharge: z.number().min(0).optional().default(0),
  vat: z.number().min(0).optional().default(0),
  });