import { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router";
import AppLayout from "../layouts/AppLayout";

// Layouts
// const AppLayout = lazy(() => import("./layouts/AppLayout")); // Layout ที่มี Bottom Nav
const AuthLayout = lazy(() => import("../layouts/AuthLayout")); // Layout สำหรับ Login/Register
const ProtectedRoute = lazy(() => import("../layouts/ProtectedRoute")); // Wrapper กันคนยังไม่ Login
// const AdminRoute = lazy(() => import("./layouts/AdminRoute")); // Wrapper กันคนไม่ใช่ Admin
import RestaurantDetail from "../pages/RestaurantDetail"; // หน้า Slide-up ข้อมูลร้านอาหารที่ปักหมุด
// import Restaurants from "../pages/Restaurants";

// // Auth Pages
// const Splash = lazy(() => import("./pages/Splash"));
const Login = lazy(() => import("../pages/Login"));
const Register = lazy(() => import("../pages/Register"));

// // Main Tab Pages (Bottom Nav)
const HomeMap = lazy(() => import("../pages/HomeMap"));
const AiRecommend = lazy(() => import("../pages/AiRecommend"));
const MyParties = lazy(() => import("../pages/MyParties"));
const Restaurants = lazy(() => import("../pages/Restaurants"));
const Profile = lazy(() => import("../pages/Profile"));

// // Search & Restaurant Pages
// const SearchFilter = lazy(() => import("./pages/SearchFilter"));
// const AddRestaurant = lazy(() => import("./pages/AddRestaurant"));
// const RestaurantDetail = lazy(() => import("../pages/RestaurantDetail"));

// // Party & Split Bill Pages
// const CreateParty = lazy(() => import("./pages/CreateParty"));
// const PartyDetail = lazy(() => import("./pages/PartyDetail"));
// const SplitBillMenu = lazy(() => import("./pages/SplitBillMenu"));
// const SplitBillSummary = lazy(() => import("./pages/SplitBillSummary"));

// // Admin Page
// const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));

// ==========================================
// 2. Router Configuration
// ==========================================
const router = createBrowserRouter([
  // ----------------------------------------------------
  // 🔓 กลุ่มที่ 1: Public Routes (ใครๆ ก็เข้าได้ ไม่ต้องล็อกอิน)
  // ----------------------------------------------------
  // {
  //   path: "/welcome",
  //   element: <Splash />,
  // },
  {
    element: <AuthLayout />,
    children: [
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
    ],
  },

  // Layout ที่มี Bottom Nav ด้านล่าง
  // {
  //   element: <AppLayout />,
  //   children: [
  //     { path: "/", element: <HomeMap /> }, // ✅ แผนที่ให้คนทั่วไปดูได้
  //     // 🔒 สอดไส้ ProtectedRoute เฉพาะหน้า Tab ที่ต้องล็อกอิน
  //     {
  //       element: <ProtectedRoute />,
  //       children: [
  //         { path: "/ai-recommend", element: <AiRecommend /> },
  //         { path: "/my-parties", element: <MyParties /> },
  //         { path: "/profile", element: <Profile /> },
  //       ]
  //     }
  //   ],
  // },

  // Layout ที่มี Bottom Nav ด้านล่าง
  {
    element: <AppLayout />,
    children: [
      {
        path: "/",
        element: <HomeMap />,
        children: [{ path: "restaurant/:id", element: <RestaurantDetail /> }],
      },
      { path: "/restaurants", element: <Restaurants /> },
      { path: "/my-parties", element: <MyParties /> },
      { path: "/ai-recommend", element: <AiRecommend /> },
      {
        element: <ProtectedRoute />,
        children: [{ path: "/profile", element: <Profile /> }],
      },
    ],
  },

  // // หน้า Standalone ที่คนทั่วไปเปิดดูได้ (เช่น แชร์ลิงก์ให้เพื่อนดูร้าน)
  // { path: "/search", element: <SearchFilter /> },
  // { path: "/restaurant/:id", element: <Restaurants /> },
  // { path: "/party/:id", element: <PartyDetail /> }, // ✅ ดูรายละเอียดตี้ได้ แต่ถ้าจะกด Join ต้องเช็คสิทธิ์

  // // ----------------------------------------------------
  // // 🔒 กลุ่มที่ 2: Protected Routes (บังคับล็อกอิน 100%)
  // // ----------------------------------------------------
  // {
  //   element: <ProtectedRoute />,
  //   children: [
  //     // หน้าสร้างตี้ / หารบิล ต้องมี User ID
  //     { path: "/restaurant/:id/party/create", element: <CreateParty /> },
  //     { path: "/party/:id/split-bill", element: <SplitBillMenu /> },
  //     { path: "/party/:id/split-bill/summary", element: <SplitBillSummary /> },

  //     // Admin Only
  //     {
  //       element: <AdminRoute />,
  //       children: [
  //         { path: "/admin", element: <AdminDashboard /> },
  //       ],
  //     },
  //   ],
  // },

  // { path: "*", element: <Navigate to="/" replace /> },
]);

function AppRouter() {
  return (
    <Suspense
      fallback={
        <div className="text-2xl text-center h-screen flex items-center justify-center bg-white">
          Loading...
        </div>
      }
    >
      <RouterProvider router={router} />
    </Suspense>
  );
}

export default AppRouter;
