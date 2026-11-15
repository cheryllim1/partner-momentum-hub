export const REGION_OPTIONS = ["EMEA N", "EMEA S", "NA", "LATAM", "APAC", "GCN", "DACH"] as const;
export type PartnerRegion = (typeof REGION_OPTIONS)[number];
const countries: Record<PartnerRegion, readonly string[]> = {
  "EMEA N": ["France", "Denmark", "Finland", "Iceland", "Norway", "Sweden", "United Kingdom", "Ireland", "Ireland - Republic of EIRE", "Belgium", "Netherlands", "Luxembourg", "Albania", "Bosnia and Herzegovina", "Bulgaria", "Czech Republic", "Estonia", "Hungary", "Latvia", "Poland", "Romania", "Slovenia", "Ukraine", "Cyprus"],
  "EMEA S": ["Spain", "Italy", "Portugal", "Algeria", "Angola", "Benin", "Côte d'Ivoire", "Egypt", "Ghana", "Morocco", "South Africa", "Iraq", "Israel", "Kuwait", "Qatar", "Saudi Arabia", "Turkey", "United Arab Emirates", "Azerbaijan", "Russian Federation", "Russia"],
  NA: ["United States", "Canada"],
  LATAM: ["Argentina", "Bermuda", "Bolivia", "Brazil", "Chile", "Colombia", "Costa Rica", "Ecuador", "Mexico", "Panama", "Peru", "Puerto Rico", "Trinidad and Tobago"],
  APAC: ["Australia", "New Zealand", "India", "Indonesia", "Japan", "Kazakhstan", "Korea - South", "Malaysia", "Mongolia", "Papua New Guinea", "Philippines", "Singapore", "Thailand", "Uzbekistan", "Viet Nam"],
  GCN: ["China", "Hong Kong", "Taiwan"],
  DACH: ["Germany", "Austria", "Switzerland"],
};
/** Unspecified country assignments remain empty rather than guessing an EMEA split. */
export function regionForCountry(country: string): PartnerRegion | null {
  for (const region of REGION_OPTIONS) if (countries[region].includes(country.trim())) return region;
  return null;
}
/** Legacy demo deals lack countries; normalize only explicitly mapped territories. */
export function regionForDealTerritory(territory: string): PartnerRegion | null {
  if (REGION_OPTIONS.some((region) => region === territory)) return territory as PartnerRegion;
  return territory === "Nordics" || territory === "France" ? "EMEA N" : null;
}