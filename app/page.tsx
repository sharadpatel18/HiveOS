"use client"

import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    redirect("/dashboard")
  );
}
