import { describe, expect, it } from "vitest";
import { hashClave, verificarClave } from "@/lib/auth/password";
import { signSession, verifySession } from "@/lib/auth/token";
import { parseBloqueo, parsePago, ValidationError } from "@/lib/db/validate";

describe("contraseñas", () => {
  it("verifica la correcta y rechaza otra", () => {
    const h = hashClave("clave-segura-1");
    expect(verificarClave("clave-segura-1", h)).toBe(true);
    expect(verificarClave("otra", h)).toBe(false);
  });
  it("dos hashes de la misma clave son distintos (sal)", () => expect(hashClave("x1234567")).not.toBe(hashClave("x1234567")));
  it("rechaza hashes mal formados", () => expect(verificarClave("a", "basura")).toBe(false));
});

describe("sesión firmada", () => {
  const ses = { id: "u1", email: "a@b.co", nombre: "Ana", rol: "recepcion" as const };
  it("ida y vuelta", async () => expect(await verifySession(await signSession(ses))).toEqual(ses));
  it("rechaza una firma alterada", async () => {
    const t = await signSession(ses);
    expect(await verifySession(t.slice(0, -2) + "xx")).toBeNull();
  });
  it("rechaza si cambian el contenido (subir de rol)", async () => {
    const [p, s] = (await signSession(ses)).split(".");
    const falso = btoa(JSON.stringify({ ...JSON.parse(atob(p.replace(/-/g, "+").replace(/_/g, "/"))), rol: "profesional" })).replace(/=+$/, "");
    expect(await verifySession(`${falso}.${s}`)).toBeNull();
  });
  it("rechaza vacío o basura", async () => {
    expect(await verifySession(undefined)).toBeNull();
    expect(await verifySession("a.b")).toBeNull();
  });
});

describe("validación", () => {
  const pago = { pacienteId: "p1", monto: 80.5, metodo: "yape", fecha: "2030-01-07", concepto: "Sesión" };
  it("acepta un pago válido", () => expect(parsePago(pago).monto).toBe(80.5));
  it("rechaza montos inválidos", () => {
    for (const monto of [0, -5, "abc", 1e9]) expect(() => parsePago({ ...pago, monto })).toThrow(ValidationError);
  });
  it("rechaza método y fecha inválidos", () => {
    expect(() => parsePago({ ...pago, metodo: "bitcoin" })).toThrow(ValidationError);
    expect(() => parsePago({ ...pago, fecha: "ayer" })).toThrow(ValidationError);
  });
  it("bloqueo: la fecha final no puede ser anterior", () => {
    expect(() => parseBloqueo({ desde: "2030-01-10", hasta: "2030-01-05" })).toThrow(ValidationError);
  });
});
