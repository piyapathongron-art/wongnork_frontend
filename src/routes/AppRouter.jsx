import { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router";
import AppLayout from "../layouts/AppLayout";
import Party from "../pages/Party";
import RestaurantDetail from "../pages/RestaurantDetail"; // หน้า Slide-up ข้อมูลร้านอาหารที่ปักหมุด
import ResetPassword from "../pages/ResetPassword";
import ForgotPassword from "../pages/ForgotPassword";

// Layouts
const AuthLayout = lazy(() => import("../layouts/AuthLayout")); // Layout สำหรับ Login/Register
const ProtectedRoute = lazy(() => import("../layouts/ProtectedRoute")); // Wrapper กันคนยังไม่ Login

// Auth Pages
const Login = lazy(() => import("../pages/Login"));
const Register = lazy(() => import("../pages/Register"));

// Main Tab Pages (Bottom Nav)
const HomeMap = lazy(() => import("../pages/HomeMap"));
const AiRecommend = lazy(() => import("../pages/AiRecommend"));
const Restaurants = lazy(() => import("../pages/Restaurants"));
const Profile = lazy(() => import("../pages/Profile"));

// Party & Split Bill Pages
const SplitBillMenu = lazy(() => import("../pages/SplitBillMenu"));
const SplitBillSummary = lazy(() => import("../pages/SplitBillSummary"));

// ==========================================
// 2. Router Configuration
// ==========================================
const router = createBrowserRouter([
  // ----------------------------------------------------
  // 🔓 กลุ่มที่ 1: Public Routes (ใครๆ ก็เข้าได้ ไม่ต้องล็อกอิน)
  // ----------------------------------------------------
  {
    element: <AuthLayout />,
    children: [
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
      { path: "/forgot-password", element: <ForgotPassword /> },
      { path: "/reset-password/:id/:token", element: <ResetPassword /> },
    ],
  },

  // Layout ที่มี Bottom Nav ด้านล่าง
  {
    element: <AppLayout />,
    children: [
      {
        path: "/",
        element: <HomeMap />,
        children: [{ path: "restaurant/:id", element: <RestaurantDetail /> }],
      },
      {
        path: "/restaurants",
        element: <Restaurants />,
        children: [{ path: ":id", element: <RestaurantDetail /> }],
      },
      { path: "/party", element: <Party /> },
      { path: "/ai-recommend", element: <AiRecommend /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: "/profile", element: <Profile /> },
          { path: "/profile/:id", element: <Profile /> },
        ],
      },
    ],
  },

  // ----------------------------------------------------
  // 🔒 กลุ่มที่ 2: Protected Routes (Standalone ไม่มี NavBar)
  // ----------------------------------------------------
  {
    element: <ProtectedRoute />,
    children: [
      { path: "/party/:id/split-bill", element: <SplitBillMenu /> },
      { path: "/party/:id/split-bill/summary", element: <SplitBillSummary /> },
    ],
  },
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
