import { describe, expect, it } from "vitest";
import { REGION_OPTIONS, regionForCountry } from "./regions";
describe("country-based partner regions", () => {
  it("uses exactly the seven requested regions", () => expect(REGION_OPTIONS).toEqual(["EMEA N", "EMEA S", "NA", "LATAM", "APAC", "GCN", "DACH"]));
  it("limits GCN to China, Hong Kong and Taiwan", () => {
    for (const c of ["China", "Hong Kong", "Taiwan"]) expect(regionForCountry(c)).toBe("GCN");
    for (const c of ["Japan", "Korea - South", "India", "Thailand"]) expect(regionForCountry(c)).toBe("APAC");
  });
  it("includes Australia and New Zealand in APAC", () => {
    expect(regionForCountry("Australia")).toBe("APAC");
    expect(regionForCountry("New Zealand")).toBe("APAC");
  });
  it("uses the supplied northern EMEA countries", () => {
    for (const c of ["France", "Denmark", "Finland", "Norway", "Sweden", "United Kingdom", "Ireland - Republic of EIRE"]) expect(regionForCountry(c)).toBe("EMEA N");
  });
  it("uses the supplied southern EMEA countries", () => {
    for (const c of ["Spain", "Italy", "Portugal", "South Africa", "United Arab Emirates"]) expect(regionForCountry(c)).toBe("EMEA S");
  });
  it("assigns DACH by country", () => {
    for (const c of ["Germany", "Austria", "Switzerland"]) expect(regionForCountry(c)).toBe("DACH");
  });
  it("assigns Benelux to EMEA N", () => {
    for (const c of ["Belgium", "Netherlands", "Luxembourg"]) expect(regionForCountry(c)).toBe("EMEA N");
  });
  it("assigns uploaded Eastern Europe countries to EMEA N", () => {
    for (const c of ["Albania", "Bosnia and Herzegovina", "Bulgaria", "Czech Republic", "Estonia", "Hungary", "Latvia", "Poland", "Romania", "Slovenia", "Ukraine"]) expect(regionForCountry(c)).toBe("EMEA N");
  });
  it("assigns Cyprus to EMEA N", () => {
    expect(regionForCountry("Cyprus")).toBe("EMEA N");
  });
  it("assigns Azerbaijan and Russia to EMEA S", () => {
    for (const c of ["Azerbaijan", "Russian Federation", "Russia"]) expect(regionForCountry(c)).toBe("EMEA S");
  });
  it("keeps unknown countries unresolved", () => {
    expect(regionForCountry("Unknown country")).toBeNull();
  });
});