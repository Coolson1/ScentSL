import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function WomenProductsPage() {
  redirect("/products?gender=WOMEN");
}
