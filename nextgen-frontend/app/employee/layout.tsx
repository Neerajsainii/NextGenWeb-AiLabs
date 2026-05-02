"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getStoredEmployeeUser } from "@/lib/employee-api";

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/employee/login") return;
    const user = getStoredEmployeeUser();
    if (!user) router.replace("/employee/login");
  }, [pathname, router]);

  return <>{children}</>;
}
