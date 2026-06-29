import { createFileRoute, Link } from "@tanstack/react-router";
import { Layers, Palette, ScrollText } from "lucide-react";

import { useCustomAdmin } from "@/components/admin/custom/custom-admin-context";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/admin/custom/")({
  component: AdminCustomIndexPage,
});

const LINKS = [
  {
    to: "/admin/custom/projects" as const,
    title: "Custom Projects",
    description: "สร้างและจัดการสินค้า Custom แต่ละ Project",
    icon: Layers,
  },
  {
    to: "/admin/custom/rules" as const,
    title: "Preview Rules",
    description: "กำหนดภาพ Preview ตามชุดตัวเลือกของ Project ที่เลือก",
    icon: ScrollText,
  },
  {
    to: "/admin/custom/fabrics" as const,
    title: "ผ้า (Fabrics)",
    description: "เพิ่ม/แก้ไขผ้า ราคา และ swatch สำหรับ Configurator",
    icon: Palette,
  },
];

function AdminCustomIndexPage() {
  const { projects, fabrics, productId } = useCustomAdmin();

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-semibold">{projects.length}</p>
            <p className="text-sm text-muted-foreground">Projects</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-semibold">{fabrics.length}</p>
            <p className="text-sm text-muted-foreground">ผ้า</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-semibold">
              {productId ? "เลือกแล้ว" : "—"}
            </p>
            <p className="text-sm text-muted-foreground">Project ปัจจุบัน</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {LINKS.map((item) => (
          <Link key={item.to} to={item.to} className="group">
            <Card className="h-full transition hover:border-primary/50">
              <CardContent className="space-y-3 p-4">
                <item.icon className="size-8 text-primary" />
                <div>
                  <p className="font-semibold group-hover:text-primary">
                    {item.title}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
