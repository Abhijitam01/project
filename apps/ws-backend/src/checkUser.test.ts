import { afterEach, describe, expect, it } from "vitest"
import jwt from "jsonwebtoken"
import { checkUser } from "./checkUser"

const ORIGINAL_SECRET = process.env.JWT_SECRET

afterEach(() => {
  process.env.JWT_SECRET = ORIGINAL_SECRET
})

describe("checkUser", () => {
  it("returns null when JWT_SECRET is missing", () => {
    delete process.env.JWT_SECRET
    const token = jwt.sign({ userId: "abc" }, "fallback")

    expect(checkUser(token)).toBeNull()
  })

  it("returns userId for valid token", () => {
    process.env.JWT_SECRET = "test-secret"
    const token = jwt.sign({ userId: "user-123" }, process.env.JWT_SECRET)

    expect(checkUser(token)).toBe("user-123")
  })

  it("returns null for invalid token", () => {
    process.env.JWT_SECRET = "test-secret"

    expect(checkUser("not-a-valid-jwt")).toBeNull()
  })

  it("returns null when token was signed with different secret", () => {
    process.env.JWT_SECRET = "secret-a"
    const token = jwt.sign({ userId: "user-123" }, "secret-b")

    expect(checkUser(token)).toBeNull()
  })
})
