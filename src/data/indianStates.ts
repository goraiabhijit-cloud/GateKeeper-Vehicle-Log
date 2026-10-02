export const STATE_CODES: Record<string, string> = {
  AN: 'Andaman & Nicobar',
  AP: 'Andhra Pradesh',
  AR: 'Arunachal Pradesh',
  AS: 'Assam',
  BR: 'Bihar',
  CH: 'Chandigarh',
  CG: 'Chhattisgarh',
  DD: 'Daman & Diu',
  DL: 'Delhi',
  DN: 'Dadra & Nagar Haveli',
  GA: 'Goa',
  GJ: 'Gujarat',
  HP: 'Himachal Pradesh',
  HR: 'Haryana',
  JH: 'Jharkhand',
  JK: 'Jammu & Kashmir',
  KA: 'Karnataka',
  KL: 'Kerala',
  LA: 'Ladakh',
  LD: 'Lakshadweep',
  MH: 'Maharashtra',
  ML: 'Meghalaya',
  MN: 'Manipur',
  MP: 'Madhya Pradesh',
  MZ: 'Mizoram',
  NL: 'Nagaland',
  OD: 'Odisha',
  PB: 'Punjab',
  PY: 'Puducherry',
  RJ: 'Rajasthan',
  SK: 'Sikkim',
  TN: 'Tamil Nadu',
  TR: 'Tripura',
  TS: 'Telangana',
  UK: 'Uttarakhand',
  UP: 'Uttar Pradesh',
  WB: 'West Bengal',
};

// Strict regex requested by user prompt: 2 letters, 2 digits, 1 letter, space, 4 digits
// Pattern: Regex("^[A-Z]{2}[0-9]{2}[A-Z]{1}\\s[0-9]{4}$")
export const VEHICLE_REGEX_STRICT = /^[A-Z]{2}[0-9]{2}[A-Z]{1}\s[0-9]{4}$/;

// Extended regex that also allows 2 series letters (e.g., DL01AB 1234)
export const VEHICLE_REGEX_EXTENDED = /^[A-Z]{2}[0-9]{2}[A-Z]{1,2}\s[0-9]{4}$/;

/**
 * Validates a vehicle number against format:
 * e.g., WB39F 9009
 */
export function isValidVehicle(number: string, allowTwoSeriesLetters: boolean = false): boolean {
  if (!number) return false;
  const regex = allowTwoSeriesLetters ? VEHICLE_REGEX_EXTENDED : VEHICLE_REGEX_STRICT;
  return regex.test(number.trim());
}

/**
 * Automatic input masking helper for vehicle plate.
 * E.g., user types "wb39f9009" -> converts to uppercase and inserts space after 5th char: "WB39F 9009"
 */
export function formatVehiclePlate(rawInput: string): string {
  if (!rawInput) return '';

  // Uppercase and remove any characters other than alphanumeric and single spaces
  const cleaned = rawInput.toUpperCase().replace(/[^A-Z0-9 ]/g, '');

  // If user already typed with space, keep it clean
  const noSpace = cleaned.replace(/\s+/g, '');

  // Format parts:
  // Part 1: State code (up to 2 chars, letters only)
  // Part 2: RTO digits (up to 2 chars, digits only)
  // Part 3: Series letter(s) (1 or 2 chars, letters only)
  // [SPACE]
  // Part 4: 4 digits (up to 4 chars)

  if (noSpace.length <= 5) {
    return noSpace;
  }

  // If length is > 5 and <= 9, insert space after 5th character (for single series letter format like WB39F 9009)
  const prefix = noSpace.slice(0, 5);
  const suffix = noSpace.slice(5, 9);
  return `${prefix} ${suffix}`;
}

/**
 * Lookup state from 2-letter state code
 */
export function getStateFromPlate(plate: string): string | null {
  if (!plate || plate.length < 2) return null;
  const code = plate.slice(0, 2).toUpperCase();
  return STATE_CODES[code] || null;
}
