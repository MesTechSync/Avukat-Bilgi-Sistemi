// Dosya işleme servisi
export class FileProcessingService {
  
  // PDF dosyasını metne çevir (basit implementasyon)
  async extractTextFromPDF(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          // PDF.js kullanarak metin çıkarma (şimdilik basit implementasyon)
          // Gerçek implementasyon için PDF.js gerekir
          const arrayBuffer = reader.result as ArrayBuffer;
          const uint8Array = new Uint8Array(arrayBuffer);
          
          // Basit PDF metin çıkarma (gerçek implementasyon için PDF.js gerekir)
          const text = this.extractTextFromPDFBuffer(uint8Array);
          resolve(text);
        } catch (error) {
          reject(new Error('PDF metin çıkarma hatası: ' + (error as Error).message));
        }
      };
      reader.onerror = () => reject(new Error('Dosya okuma hatası'));
      reader.readAsArrayBuffer(file);
    });
  }

  // DOCX dosyasını metne çevir
  async extractTextFromDOCX(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          // DOCX dosyası için basit metin çıkarma
          // Gerçek implementasyon için mammoth.js gerekir
          const arrayBuffer = reader.result as ArrayBuffer;
          const text = this.extractTextFromDOCXBuffer(arrayBuffer);
          resolve(text);
        } catch (error) {
          reject(new Error('DOCX metin çıkarma hatası: ' + (error as Error).message));
        }
      };
      reader.onerror = () => reject(new Error('Dosya okuma hatası'));
      reader.readAsArrayBuffer(file);
    });
  }

  // TXT dosyasını oku
  async extractTextFromTXT(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const text = reader.result as string;
          resolve(text);
        } catch (error) {
          reject(new Error('TXT dosya okuma hatası: ' + (error as Error).message));
        }
      };
      reader.onerror = () => reject(new Error('Dosya okuma hatası'));
      reader.readAsText(file, 'UTF-8');
    });
  }

  // Dosya tipine göre metin çıkar
  async extractTextFromFile(file: File): Promise<string> {
    const extension = file.name.toLowerCase().split('.').pop();
    
    switch (extension) {
      case 'pdf':
        return this.extractTextFromPDF(file);
      case 'docx':
      case 'doc':
        return this.extractTextFromDOCX(file);
      case 'txt':
        return this.extractTextFromTXT(file);
      default:
        throw new Error(`Desteklenmeyen dosya tipi: ${extension}`);
    }
  }

  // Basit PDF metin çıkarma (gerçek implementasyon için PDF.js gerekir)
  private extractTextFromPDFBuffer(buffer: Uint8Array): string {
    // Bu basit bir implementasyon - gerçek PDF.js implementasyonu gerekir
    const text = new TextDecoder('utf-8', { fatal: false }).decode(buffer);
    
    // PDF'den metin çıkarma için basit regex (gerçek implementasyon değil)
    const textMatches = text.match(/\([^)]+\)/g);
    if (textMatches) {
      return textMatches
        .map(match => match.slice(1, -1))
        .filter(text => text.length > 2)
        .join(' ');
    }
    
    return 'PDF içeriği çıkarılamadı. Gerçek PDF.js implementasyonu gerekir.';
  }

  // Basit DOCX metin çıkarma (gerçek implementasyon için mammoth.js gerekir)
  private extractTextFromDOCXBuffer(buffer: ArrayBuffer): string {
    // Bu basit bir implementasyon - gerçek mammoth.js implementasyonu gerekir
    const uint8Array = new Uint8Array(buffer);
    const text = new TextDecoder('utf-8', { fatal: false }).decode(uint8Array);
    
    // DOCX'den metin çıkarma için basit regex (gerçek implementasyon değil)
    const textMatches = text.match(/<w:t[^>]*>([^<]+)<\/w:t>/g);
    if (textMatches) {
      return textMatches
        .map(match => match.replace(/<[^>]*>/g, ''))
        .join(' ');
    }
    
    return 'DOCX içeriği çıkarılamadı. Gerçek mammoth.js implementasyonu gerekir.';
  }

  // Dosya boyutunu kontrol et
  validateFileSize(file: File, maxSize: number): boolean {
    return file.size <= maxSize;
  }

  // Dosya tipini kontrol et
  validateFileType(file: File, allowedTypes: string[]): boolean {
    const extension = file.name.toLowerCase().split('.').pop();
    return allowedTypes.includes(extension || '');
  }
}

// Singleton instance
export const fileProcessingService = new FileProcessingService();
