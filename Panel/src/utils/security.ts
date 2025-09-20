// Güvenlik yardımcı fonksiyonları

/**
 * Metni güvenli hale getirir - XSS saldırılarını önler
 */
export function sanitizeText(text: string): string {
  if (!text) return '';
  
  return text
    .replace(/[<>]/g, '') // HTML etiketlerini kaldır
    .replace(/javascript:/gi, '') // JavaScript protokolünü kaldır
    .replace(/on\w+=/gi, '') // Event handler'ları kaldır
    .trim();
}

/**
 * URL'yi güvenli hale getirir
 */
export function sanitizeUrl(url: string): string {
  if (!url) return '';
  
  // Sadece güvenli protokollere izin ver
  const safeProtocols = ['http:', 'https:', 'mailto:', 'tel:'];
  try {
    const urlObj = new URL(url);
    if (safeProtocols.includes(urlObj.protocol)) {
      return url;
    }
  } catch {
    // Geçersiz URL
  }
  
  return '';
}

/**
 * HTML içeriğini güvenli hale getirir
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';
  
  // Basit HTML temizleme
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Script etiketlerini kaldır
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Iframe etiketlerini kaldır
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '') // Object etiketlerini kaldır
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '') // Embed etiketlerini kaldır
    .replace(/<link\b[^<]*(?:(?!<\/link>)<[^<]*)*<\/link>/gi, '') // Link etiketlerini kaldır
    .replace(/<meta\b[^<]*(?:(?!<\/meta>)<[^<]*)*<\/meta>/gi, '') // Meta etiketlerini kaldır
    .replace(/on\w+="[^"]*"/gi, '') // Event handler'ları kaldır
    .replace(/on\w+='[^']*'/gi, '') // Event handler'ları kaldır
    .replace(/javascript:/gi, '') // JavaScript protokolünü kaldır
    .replace(/vbscript:/gi, '') // VBScript protokolünü kaldır
    .replace(/data:/gi, '') // Data protokolünü kaldır
    .trim();
}

/**
 * Dosya adını güvenli hale getirir
 */
export function sanitizeFileName(fileName: string): string {
  if (!fileName) return '';
  
  return fileName
    .replace(/[<>:"/\\|?*]/g, '') // Geçersiz karakterleri kaldır
    .replace(/\.\./g, '') // Üst dizin referanslarını kaldır
    .replace(/^\.+/, '') // Başlangıçtaki noktaları kaldır
    .trim();
}

/**
 * E-posta adresini doğrular
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Telefon numarasını doğrular
 */
export function isValidPhone(phone: string): boolean {
  if (!phone) return false;
  
  // Türkiye telefon numarası formatı
  const phoneRegex = /^(\+90|0)?[5][0-9]{9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Şifre güçlülüğünü kontrol eder
 */
export function isStrongPassword(password: string): boolean {
  if (!password || password.length < 8) return false;
  
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
}

/**
 * IP adresini doğrular
 */
export function isValidIP(ip: string): boolean {
  if (!ip) return false;
  
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

/**
 * URL'yi doğrular
 */
export function isValidUrl(url: string): boolean {
  if (!url) return false;
  
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
}

/**
 * Metin uzunluğunu kontrol eder
 */
export function isValidLength(text: string, minLength: number = 0, maxLength: number = Infinity): boolean {
  if (!text) return minLength === 0;
  
  return text.length >= minLength && text.length <= maxLength;
}

/**
 * Sadece alfanumerik karakterlere izin verir
 */
export function isAlphanumeric(text: string): boolean {
  if (!text) return true;
  
  const alphanumericRegex = /^[a-zA-Z0-9]+$/;
  return alphanumericRegex.test(text);
}

/**
 * Sadece harflere izin verir
 */
export function isAlpha(text: string): boolean {
  if (!text) return true;
  
  const alphaRegex = /^[a-zA-ZçğıöşüÇĞIİÖŞÜ]+$/;
  return alphaRegex.test(text);
}

/**
 * Sadece rakamlara izin verir
 */
export function isNumeric(text: string): boolean {
  if (!text) return true;
  
  const numericRegex = /^[0-9]+$/;
  return numericRegex.test(text);
}

/**
 * Güvenli rastgele string oluşturur
 */
export function generateSecureRandomString(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

/**
 * Hash fonksiyonu (basit)
 */
export function simpleHash(text: string): string {
  let hash = 0;
  
  if (text.length === 0) return hash.toString();
  
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 32-bit integer'a dönüştür
  }
  
  return Math.abs(hash).toString(16);
}

/**
 * Güvenli JSON parse
 */
export function safeJsonParse<T>(jsonString: string, defaultValue: T): T {
  try {
    return JSON.parse(jsonString);
  } catch {
    return defaultValue;
  }
}

/**
 * Güvenli JSON stringify
 */
export function safeJsonStringify(obj: any): string {
  try {
    return JSON.stringify(obj);
  } catch {
    return '{}';
  }
}