import { afterEach, describe, expect, it, vi } from "vitest";
import { getExposureSummary, getSession, listEvents, listSessions } from "./client";

function mockFetchOnce(body: unknown, ok = true, status = 200) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok,
      status,
      statusText: ok ? "OK" : "Error",
      json: () => Promise.resolve(body),
    })
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("api client", () => {
  it("listSessions hits GET /sessions with no query when no filter is given", async () => {
    mockFetchOnce([{ id: "s1" }]);
    const result = await listSessions();
    expect(result).toEqual([{ id: "s1" }]);
    expect(fetch).toHaveBeenCalledWith("http://localhost:3000/sessions");
  });

  it("listSessions passes a state filter as a query param", async () => {
    mockFetchOnce([]);
    await listSessions("Pause");
    expect(fetch).toHaveBeenCalledWith("http://localhost:3000/sessions?state=Pause");
  });

  it("getSession hits GET /sessions/:id", async () => {
    mockFetchOnce({ id: "s1" });
    await getSession("s1");
    expect(fetch).toHaveBeenCalledWith("http://localhost:3000/sessions/s1");
  });

  it("listEvents hits GET /sessions/:id/events", async () => {
    mockFetchOnce([]);
    await listEvents("s1");
    expect(fetch).toHaveBeenCalledWith("http://localhost:3000/sessions/s1/events");
  });

  it("getExposureSummary hits GET /sessions/:id/exposure/summary", async () => {
    mockFetchOnce({});
    await getExposureSummary("s1");
    expect(fetch).toHaveBeenCalledWith("http://localhost:3000/sessions/s1/exposure/summary");
  });

  it("throws on a non-ok response rather than silently returning bad data", async () => {
    mockFetchOnce({ message: "not found" }, false, 404);
    await expect(getSession("missing")).rejects.toThrow(/404/);
  });
});
