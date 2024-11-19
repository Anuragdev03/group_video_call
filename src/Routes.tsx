import { Route, createBrowserRouter } from "react-router-dom";

//Screens
import Home from "./screens/Home";
import Call from "./screens/Call";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Home />
    },
    {
        path: "/call/:id",
        element: <Call />
    }
])