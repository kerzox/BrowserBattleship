import { authClient } from "@/lib/auth-client";

export function useSession() {
  const {
    data: session,
    isPending, //loading state
    error, //error object
    refetch, //refetch the session
  } = authClient();

  return {
    session, //session object
    isPending, //loading state
    error, //error object
    refetch, //refetch the session
  };
}
