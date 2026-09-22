import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { NotificationSettings } from "@/components/account/NotificationSettings";

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/account/notifications");
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <NotificationSettings />
    </div>
  );
}
