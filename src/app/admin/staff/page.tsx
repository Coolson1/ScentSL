import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { InviteStaffDialog } from "@/components/admin/InviteStaffDialog";
import { StaffRoleSelect } from "@/components/admin/StaffRoleSelect";
import { StaffActiveToggle } from "@/components/admin/StaffActiveToggle";

export default async function AdminStaffPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/admin");

  const staff = await prisma.user.findMany({
    where: { role: { in: ["STAFF", "ADMIN"] } },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
    orderBy: [{ isActive: "desc" }, { createdAt: "asc" }],
  });

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="font-serif text-3xl text-brand-black">Staff</h1>
          <p className="text-sm text-muted-foreground">
            {staff.length} {staff.length === 1 ? "member" : "members"} · admin only
          </p>
        </div>
        <InviteStaffDialog />
      </header>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Active</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staff.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-8 text-center text-sm text-muted-foreground"
                >
                  No staff members yet.
                </TableCell>
              </TableRow>
            ) : (
              staff.map((s) => {
                const isSelf = s.id === session.user.id;
                return (
                  <TableRow key={s.id}>
                    <TableCell>
                      <div className="font-medium">{s.name ?? "Not set"}</div>
                      {isSelf && (
                        <Badge variant="secondary" className="mt-1 text-[10px]">
                          You
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {s.email}
                    </TableCell>
                    <TableCell>
                      <StaffRoleSelect
                        staffId={s.id}
                        currentRole={s.role}
                        disabled={isSelf}
                      />
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {s.createdAt.toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      <StaffActiveToggle
                        staffId={s.id}
                        isActive={s.isActive}
                        disabled={isSelf}
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
