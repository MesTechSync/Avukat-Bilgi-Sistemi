import React, { useState, useEffect, useCallback } from 'react';

interface ScrapingState {
  isRunning: boolean;
  progress: number;
  status: string;
  results: any[];
  logs: string[];
  total_results: number;
  current_page: number;
  current_decision: number;
  resume_from: number;
  pagination_size: number;
}

const SeleniumDataScraping: React.FC<{
  isDarkMode: boolean;
}> = ({ isDarkMode }) => {
  const [keyword, setKeyword] = useState('tazminat');
  const [limit, setLimit] = useState(10);
  const [system, setSystem] = useState('UYAP');
  const [headless, setHeadless] = useState(true);
  
  const [scrapingState, setScrapingState] = useState<ScrapingState>({
    isRunning: false,
    progress: 0,
    status: 'Hazir',
    results: [],
    logs: ['Sistem hazir. Arama yapmak icin ayarlari belirleyin ve "Aramayi Baslat" butonuna tiklayin.'],
    total_results: 0,
    current_page: 1,
    current_decision: 0,
    resume_from: 0,
    pagination_size: 10
  });
  
  const [allResults, setAllResults] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDecision, setSelectedDecision] = useState<any>(null);
  const [pageSize, setPageSize] = useState(25);

  const startSearch = useCallback(async () => {
    if (scrapingState.isRunning || !keyword.trim()) return;

    try {
      const data = {
        keyword: keyword.trim(),
        limit: limit,
        system: system,
        headless: headless
      };

      const response = await fetch('http://localhost:9000/api/selenium/start_search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const statusInterval = setInterval(updateUI, 1000);
        setTimeout(() => clearInterval(statusInterval), 60000);
      } else {
        const errorData = await response.json();
        alert('Hata: ' + errorData.message);
      }
    } catch (error) {
      console.error('Arama baslatma hatasi:', error);
      alert('Arama baslatilamadi!');
    }
  }, [keyword, limit, system, headless, scrapingState.isRunning]);

  const stopSearch = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:9000/api/selenium/stop_search', {
        method: 'POST'
      });

      if (response.ok) {
        updateUI();
      }
    } catch (error) {
      console.error('Arama durdurma hatasi:', error);
    }
  }, []);

  const updateUI = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:9000/api/selenium/status');
      const data = await response.json();

      setScrapingState(prev => ({
        ...prev,
        ...data
      }));

      if (data.results && data.results.length > 0) {
        setAllResults(data.results);
      }

    } catch (error) {
      console.error('Status guncelleme hatasi:', error);
    }
  }, []);

  const showDetail = useCallback((result: any) => {
    setSelectedDecision(result);
  }, []);

  const closeDetailModal = useCallback(() => {
    setSelectedDecision(null);
  }, []);

  const downloadExcel = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:2000/api/download_excel');
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'karar_sonuclari.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Excel dosyasi indirilemedi');
      }
    } catch (error) {
      alert('Excel dosyasi indirilemedi: ' + error);
    }
  }, []);

  // Sayfalandırma fonksiyonları
  const goToPage = useCallback((page: number) => {
    if (page < 1 || allResults.length === 0) return;
    
    const totalPages = Math.ceil(allResults.length / pageSize);
    if (page > totalPages) return;
    
    setCurrentPage(page);
  }, [allResults.length, pageSize]);

  const changePageSize = useCallback((newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  }, []);

  const continueSearch = useCallback(async () => {
    if (scrapingState.isRunning || !keyword.trim()) return;

    try {
      setScrapingState(prev => ({ ...prev, isRunning: true }));
      
      const response = await fetch('http://localhost:9000/api/selenium/continue_search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keyword: keyword,
          system: system,
          limit: 5 // 5 sayfa daha çek (50 karar)
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Başarılı devam arama sonrası status polling başlat
        const intervalId = setInterval(async () => {
          try {
            const statusResponse = await fetch('http://localhost:9000/api/selenium/status');
            const statusData = await statusResponse.json();
            
            setScrapingState(prev => ({
              ...prev,
              ...statusData
            }));
            
            if (statusData.results && statusData.results.length > 0) {
              setAllResults(statusData.results);
              
              // Toplam sonuç sayısını güncelle
              if (statusData.total_results) {
                setScrapingState(prev => ({
                  ...prev,
                  total_results: statusData.total_results
                }));
              }
            }
            
            // Arama tamamlandıysa interval'i temizle
            if (!statusData.is_running) {
              clearInterval(intervalId);
              setScrapingState(prev => ({
                ...prev,
                isRunning: false
              }));
            }
          } catch (statusError) {
            console.error('Status güncelleme hatası:', statusError);
          }
        }, 2000); // Her 2 saniyede bir kontrol et
        
        // Timeout için cleanup
        setTimeout(() => {
          clearInterval(intervalId);
        }, 600000); // 10 dakika sonra timeout
      } else {
        alert(`Hata: ${data.message}`);
        setScrapingState(prev => ({ ...prev, isRunning: false }));
      }
    } catch (error) {
      console.error('Devam arama hatası:', error);
      alert('Devam arama başlatılamadı!');
      setScrapingState(prev => ({ ...prev, isRunning: false }));
    }
  }, [keyword, system]);

  const clearResults = useCallback(() => {
    if (confirm('Sonuçları temizlemek istediğinizden emin misiniz?')) {
      setAllResults([]);
      setCurrentPage(1);
      setScrapingState(prev => ({
        ...prev,
        total_results: 0,
        status: 'Hazır'
      }));
    }
  }, []);

  const updatePaginationInfo = useCallback(() => {
    if (allResults.length === 0) return "0 kayıt arasından 0 ile 0 arasındaki kayıtlar gösteriliyor";
    
    const total = allResults.length;
    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, total);
    
    return `${total.toLocaleString('tr-TR')} kayıt arasından ${start} ile ${end} arasındaki kayıtlar gösteriliyor`;
  }, [allResults.length, currentPage, pageSize]);

  const getCurrentPageResults = useCallback(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return allResults.slice(startIndex, startIndex + pageSize);
  }, [allResults, currentPage, pageSize]);

  useEffect(() => {
    updateUI();
  }, [updateUI]);

  return (
    <div className={`max-w-[1200px] mx-auto ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        {/* Control Panel - Kompakt */}
        <div className={`p-4 rounded-xl border backdrop-blur-sm shadow-lg ${isDarkMode ? 'bg-gray-800/80 border-gray-700/50' : 'bg-white/80 border-gray-200/50'}`}>
          <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            ⚙️ Arama Ayarları
          </h3>

          <div className="space-y-4">
            {/* Keyword */}
            <div>
              <label className={`block text-xs font-semibold mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Anahtar Kelime:
              </label>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Örn: tazminat, boşanma, icra"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all text-sm backdrop-blur-sm ${
                  isDarkMode 
                    ? 'border-gray-600 bg-gray-700/80 text-white focus:ring-blue-400 placeholder-gray-400' 
                    : 'border-gray-300 bg-white/80 text-gray-900 focus:ring-blue-500 placeholder-gray-500'
                }`}
              />
            </div>

            {/* Limit */}
            <div>
              <label className={`block text-xs font-semibold mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Sayfa Sayisi:
              </label>
              <input
                type="number"
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                min="1"
                max="20"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all text-sm backdrop-blur-sm ${
                  isDarkMode 
                    ? 'border-gray-600 bg-gray-700/80 text-white focus:ring-blue-400' 
                    : 'border-gray-300 bg-white/80 text-gray-900 focus:ring-blue-500'
                }`}
              />
              <small className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Her sayfa 10 karar
              </small>
            </div>

            {/* System */}
            <div>
              <label className={`block text-xs font-semibold mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Sistem:
              </label>
              <select
                value={system}
                onChange={(e) => setSystem(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all text-sm backdrop-blur-sm ${
                  isDarkMode 
                    ? 'border-gray-600 bg-gray-700 text-white focus:ring-blue-500' 
                    : 'border-gray-300 bg-white text-gray-800 focus:ring-blue-500'
                }`}
              >
                <option value="Her Ikisi">Her Ikisi</option>
                <option value="UYAP">UYAP</option>
                <option value="Yargitay">Yargitay</option>
              </select>
            </div>

            {/* Headless */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="headless"
                checked={headless}
                onChange={(e) => setHeadless(e.target.checked)}
                className="w-3 h-3"
              />
              <label htmlFor="headless" className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Headless Mod
              </label>
            </div>

            {/* Buttons */}
            <div className="space-y-2">
              <button
                onClick={startSearch}
                disabled={scrapingState.isRunning}
                className={`w-full px-3 py-2 rounded-lg font-medium transition-all text-sm shadow-lg backdrop-blur-sm ${
                  scrapingState.isRunning
                    ? 'bg-gray-500 text-white cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-blue-500/25'
                }`}
              >
                {scrapingState.isRunning ? '⏸️ Çalışıyor...' : '🚀 Başlat'}
              </button>
              
              <button
                onClick={stopSearch}
                disabled={!scrapingState.isRunning}
                className={`w-full px-3 py-2 rounded-lg font-medium transition-all text-sm shadow-lg backdrop-blur-sm ${
                  !scrapingState.isRunning
                    ? 'bg-gray-500 text-white cursor-not-allowed'
                    : 'bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:from-gray-700 hover:to-gray-800'
                }`}
              >
                ⏹️ Durdur
              </button>
            </div>

            {/* File Actions */}
            <div className="border-t pt-3">
              <h4 className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                📁 Dosya Islemleri
              </h4>
              
              <button
                onClick={downloadExcel}
                disabled={allResults.length === 0}
                className={`w-full mb-2 px-3 py-2 rounded-lg font-medium transition-all text-sm shadow-lg backdrop-blur-sm ${
                  allResults.length === 0
                    ? 'bg-gray-500 text-white cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800'
                }`}
              >
                📊 Excel İndir
              </button>
              
              <button
                onClick={continueSearch}
                disabled={scrapingState.isRunning || allResults.length === 0}
                className={`w-full mb-2 px-3 py-2 rounded-lg font-medium transition-all text-sm shadow-lg backdrop-blur-sm ${
                  scrapingState.isRunning || allResults.length === 0
                    ? 'bg-gray-500 text-white cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700'
                }`}
              >
                ➕ Daha Fazla Sonuç Çek
              </button>
              
              <button
                onClick={clearResults}
                disabled={allResults.length === 0}
                className={`w-full px-3 py-2 rounded-lg font-medium transition-all text-sm shadow-lg backdrop-blur-sm ${
                  allResults.length === 0
                    ? 'bg-gray-500 text-white cursor-not-allowed'
                    : 'bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:from-gray-700 hover:to-gray-800'
                }`}
              >
                🗑️ Sonuçları Temizle
              </button>
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className={`xl:col-span-3 p-4 rounded-xl border backdrop-blur-sm shadow-lg ${isDarkMode ? 'bg-gray-800/80 border-gray-700/50' : 'bg-white/80 border-gray-200/50'}`}>

          {/* Status Bar */}
          <div className={`flex justify-between items-center mb-4 p-3 rounded-lg border backdrop-blur-sm ${
            isDarkMode 
              ? 'bg-gray-700/50 border-gray-600' 
              : 'bg-white/80 border-gray-200/50'
          }`}>
            <div className={`text-sm font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
              {scrapingState.status}
            </div>
            <div className="flex-1 mx-4">
              <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300 shadow-lg"
                  style={{ width: `${scrapingState.progress}%` }}
                />
              </div>
              <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {Math.round(scrapingState.progress)}%
              </div>
            </div>
          </div>

          {/* Logs */}
          <div className={`h-64 p-3 rounded-lg overflow-y-auto font-mono text-xs mb-4 backdrop-blur-sm ${
            isDarkMode ? 'bg-gray-900/80 text-gray-300 border border-gray-700' : 'bg-gray-900/80 text-gray-300 border border-gray-700'
          }`}>
            {scrapingState.logs.map((log, index) => (
              <div key={index} className="mb-1 break-words">
                {log}
              </div>
            ))}
          </div>

          {/* Results Table */}
          {allResults.length > 0 && (
            <div className="mt-4">
              <div className={`flex justify-between items-center mb-3 p-3 rounded-lg border backdrop-blur-sm ${
                isDarkMode 
                  ? 'bg-gray-700/50 border-gray-600' 
                  : 'bg-white/80 border-gray-200/50'
              }`}>
                <div className={`text-sm font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                  <strong>{scrapingState.total_results.toLocaleString('tr-TR')}</strong> adet karar bulundu.
                </div>
                
                {/* Sayfa Boyutu Seçici */}
                <div className="flex items-center gap-2">
                  <select
                    value={pageSize}
                    onChange={(e) => changePageSize(Number(e.target.value))}
                    className={`px-3 py-1 border rounded-md text-sm focus:outline-none focus:ring-2 ${
                      isDarkMode 
                        ? 'border-gray-600 bg-gray-700 text-white focus:ring-blue-400' 
                        : 'border-gray-300 bg-white text-gray-900 focus:ring-blue-500'
                    }`}
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    kayıt göster
                  </span>
                </div>
              </div>

              <div className={`overflow-x-auto rounded-lg border backdrop-blur-sm ${
                isDarkMode 
                  ? 'bg-gray-800/50 border-gray-600' 
                  : 'bg-white/80 border-gray-200/50'
              }`}>
                <table className="w-full border-collapse min-w-[600px]">
                  <thead className={`backdrop-blur-sm ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50/50'}`}>
                    <tr>
                      <th className={`px-2 py-2 border-b font-medium text-left text-xs min-w-[150px] ${
                        isDarkMode ? 'border-gray-600 text-gray-300' : 'border-gray-200 text-gray-600'
                      }`}>Daire</th>
                      <th className={`px-2 py-2 border-b font-medium text-left text-xs min-w-[80px] ${
                        isDarkMode ? 'border-gray-600 text-gray-300' : 'border-gray-200 text-gray-600'
                      }`}>Esas</th>
                      <th className={`px-2 py-2 border-b font-medium text-left text-xs min-w-[80px] ${
                        isDarkMode ? 'border-gray-600 text-gray-300' : 'border-gray-200 text-gray-600'
                      }`}>Karlar</th>
                      <th className={`px-2 py-2 border-b font-medium text-left text-xs min-w-[100px] ${
                        isDarkMode ? 'border-gray-600 text-gray-300' : 'border-gray-200 text-gray-600'
                      }`}>Tarih</th>
                      <th className={`px-2 py-2 border-b font-medium text-left text-xs min-w-[100px] ${
                        isDarkMode ? 'border-gray-600 text-gray-300' : 'border-gray-200 text-gray-600'
                      }`}>Durum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getCurrentPageResults().map((result, index) => (
                      <tr 
                        key={index} 
                        className={`cursor-pointer transition-colors duration-150 ${
                          isDarkMode ? 'hover:bg-gray-700/30' : 'hover:bg-gray-100'
                        }`}
                        onClick={() => showDetail(result)}
                      >
                        <td className={`px-4 py-3 border-b text-sm align-middle min-w-[200px] transition-colors hover:${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'} ${
                          isDarkMode ? 'border-gray-600 text-gray-100' : 'border-gray-200 text-gray-700'
                        }`}>
                          {result.daire || "N/A"}
                        </td>
                        <td className={`px-4 py-3 border-b text-sm align-middle font-medium min-w-[100px] transition-colors hover:${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'} ${
                          isDarkMode ? 'border-gray-600 text-gray-100' : 'border-gray-200 text-gray-700'
                        }`}>
                          {result.esas_no || "N/A"}
                        </td>
                        <td className={`px-4 py-3 border-b text-sm align-middle font-medium min-w-[100px] transition-colors hover:${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'} ${
                          isDarkMode ? 'border-gray-600 text-gray-100' : 'border-gray-200 text-gray-700'
                        }`}>
                          {result.karar_no || "N/A"}
                        </td>
                        <td className={`px-4 py-3 border-b text-sm align-middle min-w-[120px] transition-colors hover:${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'} ${
                          isDarkMode ? 'border-gray-600 text-gray-100' : 'border-gray-200 text-gray-700'
                        }`}>
                          {result.karar_tarihi || result.tarih || "N/A"}
                        </td>
                        <td className={`px-4 py-3 border-b text-sm align-middle min-w-[120px] ${
                          isDarkMode ? 'border-gray-600' : 'border-gray-200'
                        }`}>
                          <span className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1 rounded-lg text-xs font-semibold uppercase shadow-sm">
                            {result.karar_durumu || "KESINLEŞTI"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Sayfalandırma Kontrolleri */}
              <div className={`flex justify-between items-center mt-4 p-4 rounded-lg border backdrop-blur-sm ${
                isDarkMode 
                  ? 'bg-gray-700/50 border-gray-600' 
                  : 'bg-white/80 border-gray-200/50'
              }`}>
                
                {/* Sayfa Bilgisi */}
                <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {updatePaginationInfo()}
                </div>

                {/* Sayfa Kontrolleri */}
                <div className="flex items-center gap-2">
                  {(() => {
                    const totalPages = Math.ceil(allResults.length / pageSize);
                    const pages = [];
                    const currentVisible = 2; // Gösterilecek sayfa sayısı (mevcut sayfanın her iki tarafında)
                    
                    // Önceki sayfa butonu
                    if (currentPage > 1) {
                      pages.push(
                        <button
                          key="prev"
                          onClick={() => goToPage(currentPage - 1)}
                          className={`px-3 py-1 border rounded text-sm transition-colors ${
                            isDarkMode 
                              ? 'border-gray-600 bg-gray-700 text-white hover:bg-gray-600' 
                              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          &lt;
                        </button>
                      );
                    }

                    // Sayfa numaraları
                    const startPage = Math.max(1, currentPage - currentVisible);
                    const endPage = Math.min(totalPages, currentPage + currentVisible);

                    // İlk sayfa
                    if (startPage > 1) {
                      pages.push(
                        <button
                          key={1}
                          onClick={() => goToPage(1)}
                          className={`px-3 py-1 border rounded text-sm transition-colors ${
                            isDarkMode 
                              ? 'border-gray-600 bg-gray-700 text-white hover:bg-gray-600' 
                              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          1
                        </button>
                      );
                      
                      if (startPage > 2) {
                        pages.push(
                          <span key="dots1" className={`px-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            ...
                          </span>
                        );
                      }
                    }

                    // Orta sayfalar
                    for (let i = startPage; i <= endPage; i++) {
                      if (i === currentPage) {
                        pages.push(
                          <button
                            key={i}
                            className="px-3 py-1 border rounded text-sm font-semibold bg-blue-600 text-white shadow-sm"
                          >
                            {i}
                          </button>
                        );
                      } else {
                        pages.push(
                          <button
                            key={i}
                            onClick={() => goToPage(i)}
                            className={`px-3 py-1 border rounded text-sm transition-colors ${
                              isDarkMode 
                                ? 'border-gray-600 bg-gray-700 text-white hover:bg-gray-600' 
                                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {i}
                          </button>
                        );
                      }
                    }

                    // Son sayfa
                    if (endPage < totalPages) {
                      if (endPage < totalPages - 1) {
                        pages.push(
                          <span key="dots2" className={`px-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            ...
                          </span>
                        );
                      }
                      
                      pages.push(
                        <button
                          key={totalPages}
                          onClick={() => goToPage(totalPages)}
                          className={`px-3 py-1 border rounded text-sm transition-colors ${
                            isDarkMode 
                              ? 'border-gray-600 bg-gray-700 text-white hover:bg-gray-600' 
                              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {totalPages}
                        </button>
                      );
                    }

                    // Sonraki sayfa butonu
                    if (currentPage < totalPages) {
                      pages.push(
                        <button
                          key="next"
                          onClick={() => goToPage(currentPage + 1)}
                          className={`px-3 py-1 border rounded text-sm transition-colors ${
                            isDarkMode 
                              ? 'border-gray-600 bg-gray-700 text-white hover:bg-gray-600' 
                              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          &gt;
                        </button>
                      );
                    }

                    return pages;
                  })()}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedDecision && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div 
            className={`rounded-xl overflow-hidden border shadow-2xl backdrop-blur-md relative transition-all duration-300 resize ${
              isDarkMode 
                ? 'bg-gray-800/80 border-gray-700/50' 
                : 'bg-white/80 border-gray-200/50'
            }`}
            style={{
              width: '100%',
              maxWidth: '90vw',
              height: '90vh',
              maxHeight: '800px',
              minHeight: '400px'
            }}
          >
            {/* Modal Header */}
            <div className={`px-4 py-3 border-b ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <h4 className={`text-lg font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                  Karar Detayı
                </h4>
                <button
                  onClick={closeDetailModal}
                  className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded text-sm hover:from-red-600 hover:to-red-700 transition-all"
                >
                  ✕ Kapat
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex flex-col h-full overflow-hidden">
              {/* Header Info */}
              <div className={`px-4 py-3 border-b overflow-x-auto ${
                isDarkMode ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <div className="flex gap-4 text-sm whitespace-nowrap">
                  <span><strong>DAIRE:</strong> {selectedDecision.daire || "N/A"}</span>
                  <span><strong>ESAS:</strong> {selectedDecision.esas_no || "N/A"}</span>
                  <span><strong>KARAR:</strong> {selectedDecision.karar_no || "N/A"}</span>
                  <span><strong>TARIH:</strong> {selectedDecision.karar_tarihi || selectedDecision.tarih || "N/A"}</span>
                </div>
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className={`text-sm leading-relaxed ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <div className="mb-4">
                    <strong className={`text-base ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`}>
                      Karar Metni:
                    </strong>
                  </div>
                  <div className={`p-4 rounded border whitespace-pre-wrap ${
                    isDarkMode 
                      ? 'bg-gray-900/50 border-gray-600' 
                      : 'bg-gray-50 border-gray-300'
                  }`}>
                    {selectedDecision.karar_metni || "Karar metni bulunamadi."}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className={`px-4 py-3 border-t ${
                isDarkMode ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <div className="text-xs text-center">
                  Karar durumu: <strong>{selectedDecision.karar_durumu || "KESINLESTI"}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeleniumDataScraping;
