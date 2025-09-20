// Ses sistemi metrikleri ve performans takibi

export interface VoiceMetrics {
  totalCommands: number;
  successfulCommands: number;
  failedCommands: number;
  averageConfidence: number;
  averageResponseTime: number;
  mostUsedCommands: Array<{ command: string; count: number }>;
  categoryUsage: Record<string, number>;
  dailyUsage: Record<string, number>;
  weeklyUsage: Record<string, number>;
  monthlyUsage: Record<string, number>;
  errorRate: number;
  successRate: number;
}

export interface VoiceEvent {
  timestamp: number;
  command: string;
  category: string;
  action: string;
  confidence: number;
  responseTime: number;
  success: boolean;
  error?: string;
}

class VoiceMetricsCollector {
  private events: VoiceEvent[] = [];
  private maxEvents = 1000; // Maksimum olay sayısı

  // Olay ekle
  addEvent(event: VoiceEvent): void {
    this.events.push(event);
    
    // Eski olayları temizle
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }
    
    // LocalStorage'a kaydet
    this.saveToStorage();
  }

  // Metrikleri hesapla
  calculateMetrics(): VoiceMetrics {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const totalCommands = this.events.length;
    const successfulCommands = this.events.filter(e => e.success).length;
    const failedCommands = totalCommands - successfulCommands;
    
    const averageConfidence = totalCommands > 0 
      ? this.events.reduce((sum, e) => sum + e.confidence, 0) / totalCommands 
      : 0;
    
    const averageResponseTime = totalCommands > 0 
      ? this.events.reduce((sum, e) => sum + e.responseTime, 0) / totalCommands 
      : 0;

    // En çok kullanılan komutlar
    const commandCounts: Record<string, number> = {};
    this.events.forEach(e => {
      commandCounts[e.command] = (commandCounts[e.command] || 0) + 1;
    });
    
    const mostUsedCommands = Object.entries(commandCounts)
      .map(([command, count]) => ({ command, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Kategori kullanımı
    const categoryUsage: Record<string, number> = {};
    this.events.forEach(e => {
      categoryUsage[e.category] = (categoryUsage[e.category] || 0) + 1;
    });

    // Günlük kullanım
    const dailyUsage: Record<string, number> = {};
    this.events
      .filter(e => new Date(e.timestamp).toISOString().split('T')[0] === today)
      .forEach(e => {
        dailyUsage[e.command] = (dailyUsage[e.command] || 0) + 1;
      });

    // Haftalık kullanım
    const weeklyUsage: Record<string, number> = {};
    this.events
      .filter(e => new Date(e.timestamp) >= weekAgo)
      .forEach(e => {
        weeklyUsage[e.command] = (weeklyUsage[e.command] || 0) + 1;
      });

    // Aylık kullanım
    const monthlyUsage: Record<string, number> = {};
    this.events
      .filter(e => new Date(e.timestamp) >= monthAgo)
      .forEach(e => {
        monthlyUsage[e.command] = (monthlyUsage[e.command] || 0) + 1;
      });

    const errorRate = totalCommands > 0 ? (failedCommands / totalCommands) * 100 : 0;
    const successRate = totalCommands > 0 ? (successfulCommands / totalCommands) * 100 : 0;

    return {
      totalCommands,
      successfulCommands,
      failedCommands,
      averageConfidence,
      averageResponseTime,
      mostUsedCommands,
      categoryUsage,
      dailyUsage,
      weeklyUsage,
      monthlyUsage,
      errorRate,
      successRate,
    };
  }

  // LocalStorage'a kaydet
  private saveToStorage(): void {
    try {
      const data = {
        events: this.events,
        lastUpdated: Date.now(),
      };
      localStorage.setItem('voice_metrics', JSON.stringify(data));
    } catch (error) {
      console.warn('Voice metrics could not be saved to localStorage:', error);
    }
  }

  // LocalStorage'dan yükle
  loadFromStorage(): void {
    try {
      const data = localStorage.getItem('voice_metrics');
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed.events && Array.isArray(parsed.events)) {
          this.events = parsed.events;
        }
      }
    } catch (error) {
      console.warn('Voice metrics could not be loaded from localStorage:', error);
    }
  }

  // Metrikleri temizle
  clearMetrics(): void {
    this.events = [];
    localStorage.removeItem('voice_metrics');
  }

  // Belirli bir zaman aralığındaki olayları getir
  getEventsInRange(startDate: Date, endDate: Date): VoiceEvent[] {
    return this.events.filter(e => {
      const eventDate = new Date(e.timestamp);
      return eventDate >= startDate && eventDate <= endDate;
    });
  }

  // Hata oranını hesapla
  getErrorRate(): number {
    const total = this.events.length;
    if (total === 0) return 0;
    
    const errors = this.events.filter(e => !e.success).length;
    return (errors / total) * 100;
  }

  // Başarı oranını hesapla
  getSuccessRate(): number {
    const total = this.events.length;
    if (total === 0) return 0;
    
    const successes = this.events.filter(e => e.success).length;
    return (successes / total) * 100;
  }

  // Ortalama güven skorunu hesapla
  getAverageConfidence(): number {
    const total = this.events.length;
    if (total === 0) return 0;
    
    const sum = this.events.reduce((acc, e) => acc + e.confidence, 0);
    return sum / total;
  }

  // Ortalama yanıt süresini hesapla
  getAverageResponseTime(): number {
    const total = this.events.length;
    if (total === 0) return 0;
    
    const sum = this.events.reduce((acc, e) => acc + e.responseTime, 0);
    return sum / total;
  }
}

// Singleton instance
export const voiceMetrics = new VoiceMetricsCollector();

// Yardımcı fonksiyonlar
export function recordVoiceCommand(
  command: string,
  category: string,
  action: string,
  confidence: number,
  responseTime: number,
  success: boolean,
  error?: string
): void {
  const event: VoiceEvent = {
    timestamp: Date.now(),
    command,
    category,
    action,
    confidence,
    responseTime,
    success,
    error,
  };
  
  voiceMetrics.addEvent(event);
}

export function getVoiceMetrics(): VoiceMetrics {
  return voiceMetrics.calculateMetrics();
}

export function clearVoiceMetrics(): void {
  voiceMetrics.clearMetrics();
}

export function exportVoiceMetrics(): string {
  const metrics = voiceMetrics.calculateMetrics();
  return JSON.stringify(metrics, null, 2);
}

export function importVoiceMetrics(data: string): boolean {
  try {
    const metrics = JSON.parse(data);
    // Metrikleri doğrula ve uygula
    if (metrics && typeof metrics === 'object') {
      // Burada metrikleri geri yükleme işlemi yapılabilir
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// Performans izleme
export class PerformanceTracker {
  private startTime: number = 0;
  private endTime: number = 0;

  start(): void {
    this.startTime = performance.now();
  }

  end(): number {
    this.endTime = performance.now();
    return this.endTime - this.startTime;
  }

  getDuration(): number {
    return this.endTime - this.startTime;
  }
}

// Singleton performance tracker
export const performanceTracker = new PerformanceTracker();