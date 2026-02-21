"use client";

import { useAuthInit } from "@/hooks/use-auth-init";

export default function AuthInitializer() {
    useAuthInit();
    return null;
}