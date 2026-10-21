import type { Session } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";
import { createAuthEventHandler } from "@/lib/auth-events";

const session = { user: { id: "user-1" } } as Session;
const setup = () => {
  const actions = { signedIn: vi.fn(), signedOut: vi.fn(), userUpdated: vi.fn(), sessionReady: vi.fn() };
  return { actions, handler: createAuthEventHandler(actions) };
};

describe("Auth event coordination", () => {
  it("processes repeated sign-in events once instead of restarting authenticated requests", () => {
    const { actions, handler } = setup();
    handler("INITIAL_SESSION", null);
    for (let i = 0; i < 20; i++) handler("SIGNED_IN", session);
    expect(actions.signedIn).toHaveBeenCalledTimes(1);
  });
  it("does not reload routes for refresh events or an already restored identity", () => {
    const { actions, handler } = setup();
    handler("INITIAL_SESSION", session);
    handler("SIGNED_IN", session);
    handler("TOKEN_REFRESHED", session);
    expect(actions.sessionReady).toHaveBeenCalledTimes(1);
    expect(actions.signedIn).not.toHaveBeenCalled();
  });
  it("handles sign-out once and allows a subsequent sign-in", () => {
    const { actions, handler } = setup();
    handler("INITIAL_SESSION", session);
    handler("SIGNED_OUT", null);
    handler("SIGNED_OUT", null);
    handler("SIGNED_IN", session);
    expect(actions.signedOut).toHaveBeenCalledTimes(1);
    expect(actions.signedIn).toHaveBeenCalledTimes(1);
  });
});