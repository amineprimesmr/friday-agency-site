import { redirect } from "next/navigation";

export const dynamic = "force-static";

export async function GET() {
  redirect("https://www.icloud.com/shortcuts/15ffc694f45844dfabcf7e48198545d7");
}
