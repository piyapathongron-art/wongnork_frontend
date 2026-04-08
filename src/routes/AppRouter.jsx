import { lazy, Suspense } from "react";
import { createBrowserRouter,RouterProvider,Navigate } from "react-router"; 

const router = createBrowserRouter([
    {
        path:"/",
        element: <div className="text-5xl text-center h-screen flex items-center justify-center">starter</div>
    }
])


function AppRouter() {

    return(
        <Suspense fallback={<div>Loading...</div>}>
            <RouterProvider router={router} />
        </Suspense>
    )
}

export default AppRouter