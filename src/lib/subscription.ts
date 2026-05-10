import { cookies } from "next/headers";
import { MEMBER_COOKIE, verifyMemberSession } from "@/lib/session";

export async function getMemberEmail() {
  const jar = await cookies();
  const token = jar.get(MEMBER_COOKIE)?.value;
  if (!token) return null;
  const session = await verifyMemberSession(token);
  return session?.email ?? null;
}

export async function isSubscriber() {
  const email = await getMemberEmail();
  return Boolean(email);
}
