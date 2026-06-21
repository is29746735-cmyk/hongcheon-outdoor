import { handlers } from "@/auth";

// Turso(libSQL) 클라이언트는 Node 런타임 필요 (edge 아님)
export const runtime = "nodejs";

export const { GET, POST } = handlers;
