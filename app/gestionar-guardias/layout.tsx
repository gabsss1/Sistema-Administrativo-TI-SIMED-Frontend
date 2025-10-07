"use client";

import { AdminLayout } from "@/components/admin-layout";

export default function GestionarGuardiasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayout>{children}</AdminLayout>;
}