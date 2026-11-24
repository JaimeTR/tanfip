import { describe, expect, it } from "vitest";
import { formatoTelefono, limpiarTelefonoInput, normalizarTelefono, telefonoWa } from "@/lib/phone";

describe("teléfonos (Perú)", () => {
  it.each(["949809459", "0949809459", "0 949 809 459", "949-809-459", "+51 949 809 459", "51949809459", "0051949809459"])("normaliza %s", (t) => {
    expect(normalizarTelefono(t)).toBe("949809459");
  });
  it("wa.me usa código 51 y nunca lleva el 0", () => {
    expect(telefonoWa("0949809459")).toBe("51949809459");
    expect(telefonoWa("949809459")).toBe("51949809459");
    expect(telefonoWa("+51949809459")).toBe("51949809459");
  });
  it("respeta números de otro país", () => {
    expect(normalizarTelefono("+593 99 123 4567")).toBe("+593991234567");
    expect(telefonoWa("+593991234567")).toBe("593991234567");
  });
  it("formatea para mostrar", () => {
    expect(formatoTelefono("0949809459")).toBe("949 809 459");
    expect(formatoTelefono("")).toBe("");
  });
  it("quita el cero inicial mientras se escribe", () => {
    expect(limpiarTelefonoInput("0949")).toBe("949");
    expect(limpiarTelefonoInput("+593")).toBe("+593");
    expect(limpiarTelefonoInput("949 8")).toBe("949 8");
  });
});
