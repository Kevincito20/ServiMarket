import type { Database } from "./database.types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export type AuthUser = {
    id: string;
    email: string | undefined;
    profile: Profile | null;
};

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";
