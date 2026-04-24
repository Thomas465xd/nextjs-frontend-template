import { useState } from "react";
import type { SweetAlertTheme } from "sweetalert2";

/**
 * Hook to safely get theme from localStorage after hydration
 * Uses lazy initialization to prevent cascading renders
 */
export const useThemeForModal = () => {
    const [theme] = useState<SweetAlertTheme | "light">(() => {
        if (typeof window === 'undefined') return "light";
        return (localStorage.getItem("theme") as SweetAlertTheme | null) || "light";
    });

    return theme;
};
