import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function UnisexProductsPage() {
  redirect("/products?gender=UNISEX");
}
