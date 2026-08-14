import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import type { User } from "firebase/auth";
import { db } from "@/lib/firebase/client";
import type { AppUser, UserRole } from "@/types/domain";

export async function createUserProfile(
  user: User,
  extra: { municipality: string | null } = { municipality: null },
): Promise<void> {
  const ref = doc(db, "users", user.uid);
  await setDoc(ref, {
    uid: user.uid,
    role: "citizen" satisfies UserRole,
    displayName: user.displayName,
    email: user.email,
    phoneNumber: user.phoneNumber,
    municipality: extra.municipality,
    createdAt: serverTimestamp(),
  });
}

export async function getUserProfile(uid: string): Promise<AppUser | null> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;

  const data = snap.data();
  return {
    uid: snap.id,
    role: data.role,
    displayName: data.displayName ?? null,
    email: data.email ?? null,
    phoneNumber: data.phoneNumber ?? null,
    municipality: data.municipality ?? null,
    createdAt: data.createdAt?.toMillis?.() ?? Date.now(),
  };
}
