import { redirect } from "next/navigation";

export default function HomePage() {
  // Redirect to jobs listing as the main public page
  redirect("/jobs");
}
