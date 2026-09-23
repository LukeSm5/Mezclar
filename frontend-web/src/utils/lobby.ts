import QRCode from "qrcode";

export function createLobbyQrCode(url: string): Promise<string> {
  return QRCode.toDataURL(url, { width: 192, margin: 4 });
}
