import QRCode from 'qrcode';

// A temporary display code; the backend will assign unique session codes later.
export function generateJoinCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function createLobbyQrCode(url = 'http://localhost:5173'): Promise<string> {
  return QRCode.toDataURL(url, { width: 192, margin: 4 });
}
