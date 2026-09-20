import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function MenProductsPage() {
  redirect("/products?gender=MEN");
}
