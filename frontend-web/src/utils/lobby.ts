import QRCode from 'qrcode';

// A temporary display code; the backend will assign unique session codes later.
export function generateJoinCode(digits = 6): string {
  if (!Number.isInteger(digits) || digits < 1 || digits > 32) {
    throw new RangeError('Code length must be an integer between 1 and 32.');
  }

  let code = String(Math.floor(Math.random() * 9) + 1);
  for (let index = 1; index < digits; index += 1) {
    code += Math.floor(Math.random() * 10);
  }
  return code;
}

export function createLobbyQrCode(url = 'http://localhost:5173'): Promise<string> {
  return QRCode.toDataURL(url, { width: 192, margin: 4 });
}
