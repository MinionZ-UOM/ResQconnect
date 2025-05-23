// lib/roles.ts
export const uiToBackend = {
    Responder: "first_responder",
    Volunteer: "volunteer",
    Affected: "affected_individual",
    Admin: "admin",
  } as const
  
  export type BackendRole = (typeof uiToBackend)[keyof typeof uiToBackend]
  