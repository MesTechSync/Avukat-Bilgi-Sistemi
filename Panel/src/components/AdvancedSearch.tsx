  const mockResults: SearchResult[] = [];

  const courtTypes = [
    {
      id: '5',
      caseNumber: '2023/7890',
      courtName: 'Anayasa Mahkemesi',
      courtType: 'aym',
      decisionDate: '2023-05-20',
      subject: 'Anayasal Hak İhlali',
      content: 'Temel hak ve özgürlüklerin ihlali durumunda Anayasa Mahkemesi\'ne başvuru. Anayasal hakların korunması ve ihlal durumunda tazminat hakkı. Bireysel başvuru şartları ve süreci.',
      relevanceScore: 94,
      legalAreas: ['Anayasa Hukuku'],
      keywords: ['anayasa', 'hak ihlali', 'temel haklar', 'özgürlük', 'bireysel başvuru'],
      highlight: 'Anayasal hak ihlali ve tazminat hakkı'
    },
    {
      id: '6',
      caseNumber: '2023/2468',
      courtName: 'Yargıtay 3. Hukuk Dairesi',
      courtType: 'yargitay',
      decisionDate: '2023-08-15',
      subject: 'Kira Artış Oranı',
      content: 'Kira sözleşmelerinde kira artış oranının belirlenmesi. TÜFE oranına göre kira artışı yapılabilir. Aşırı kira artışları hukuka aykırıdır. Kira artış sınırları ve hesaplama yöntemi.',
      relevanceScore: 87,
      legalAreas: ['Borçlar Hukuku'],
      keywords: ['kira', 'artış', 'TÜFE', 'sözleşme', 'kira artış sınırı'],
      highlight: 'Kira artış oranı ve TÜFE bağlantısı'
    },
    {
      id: '7',
      caseNumber: '2023/1357',
      courtName: 'Sayıştay',
      courtType: 'sayistay',
      decisionDate: '2023-04-12',
      subject: 'Kamu Harcaması Denetimi',
      content: 'Kamu kurumlarının harcamalarının denetimi ve usulsüzlük tespiti. Sayıştay\'ın denetim yetkisi ve sonuçları. Usulsüzlük tespiti durumunda alınacak önlemler.',
      relevanceScore: 91,
      legalAreas: ['Mali Hukuk'],
      keywords: ['kamu harcaması', 'denetim', 'usulsüzlük', 'sayıştay', 'kamu maliyesi'],
      highlight: 'Kamu harcaması denetimi ve usulsüzlük tespiti'
    },
    {
      id: '8',
      caseNumber: '2023/9753',
      courtName: 'Yargıtay 1. Hukuk Dairesi',
      courtType: 'yargitay',
      decisionDate: '2023-09-25',
      subject: 'Miras Paylaşımı',
      content: 'Miras bırakanın ölümü sonrası mirasçılar arasında miras paylaşımı. Yasal mirasçılar ve miras payları. Miras reddi ve mirasçılık sıfatı. Miras paylaşımında saklı paylar.',
      relevanceScore: 93,
      legalAreas: ['Miras Hukuku'],
      keywords: ['miras', 'paylaşım', 'mirasçı', 'yasal mirasçı', 'saklı pay'],
      highlight: 'Miras paylaşımı ve yasal mirasçılık'
    },
    {
      id: '9',
      caseNumber: '2023/4680',
      courtName: 'Yargıtay 5. Hukuk Dairesi',
      courtType: 'yargitay',
      decisionDate: '2023-10-08',
      subject: 'Sözleşme İhlali',
      content: 'Sözleşme taraflarından birinin sözleşme yükümlülüklerini yerine getirmemesi durumunda diğer tarafın hakları. Sözleşme ihlali sonucu tazminat ve fesih hakkı. Sözleşme ihlali tespiti ve ispatı.',
      relevanceScore: 86,
      legalAreas: ['Borçlar Hukuku'],
      keywords: ['sözleşme', 'ihlal', 'tazminat', 'fesih', 'yükümlülük'],
      highlight: 'Sözleşme ihlali ve sonuçları'
    },
    {
      id: '10',
      caseNumber: '2023/8024',
      courtName: 'Danıştay 3. Dairesi',
      courtType: 'danistay',
      decisionDate: '2023-11-12',
      subject: 'İdari Para Cezası',
      content: 'İdari makamlar tarafından verilen para cezalarının hukuka uygunluğu. Para cezası verme yetkisi ve sınırları. Para cezasına itiraz ve iptal davası açma süreci.',
      relevanceScore: 84,
      legalAreas: ['İdari Hukuk'],
      keywords: ['idari para cezası', 'yetki', 'itiraz', 'iptal', 'idari makam'],
      highlight: 'İdari para cezası ve itiraz süreci'
    }
  ];

  const courtTypes = [
    { value: 'yargitay', label: 'Yargıtay' },
    { value: 'danistay', label: 'Danıştay' },
    { value: 'bam', label: 'Bölge Adliye Mahkemesi' },
    { value: 'aym', label: 'Anayasa Mahkemesi' },
    { value: 'sayistay', label: 'Sayıştay' },
    { value: 'emsal', label: 'UYAP Emsal' },
    { value: 'istinaf', label: 'İstinaf Mahkemeleri' },
    { value: 'hukuk', label: 'Hukuk Mahkemeleri' }
  ];
  // Legal areas options
  const legalAreas = [
    'İş Hukuku', 'Ticaret Hukuku', 'Medeni Hukuk', 'Ceza Hukuku',
    'İdare Hukuku', 'Vergi Hukuku', 'Aile Hukuku', 'Miras Hukuku',
    'Borçlar Hukuku', 'Eşya Hukuku', 'İcra İflas Hukuku'
  ];

  // Helper: quick date range
  const setQuickDateRange = (months: number) => {
    const to = new Date();
    const from = new Date();
    from.setMonth(from.getMonth() - months);
    const fmt = (d: Date) => d.toISOString().slice(0, 10);
    setFilters(prev => ({ ...prev, dateRange: { from: fmt(from), to: fmt(to) } }));
  };

  // Backend readiness check
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const base = getBackendBase();
        const health = await fetch(`${base}/health`).then(r => r.ok ? 'ok' : 'bad').catch(() => 'bad');
        if (health !== 'ok') {
          if (!cancelled) setBackendStatus('down');
          return;
        }
        const db = await fetch(`${base}/api/databases`, { method: 'GET' }).then(r => r.ok ? 'ok' : 'bad').catch(() => 'bad');
        if (!cancelled) setBackendStatus(db === 'ok' ? 'ok' : 'degraded');
      } catch {
        if (!cancelled) setBackendStatus('down');
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Search handler (real search for İçtihat; mock for Mevzuat for now)
  // Ses komutları için event listener
  useEffect(() => {
    const handleVoiceSearch = (event: CustomEvent) => {
      const { query, searchType } = event.detail;
      if (query) {
        setQuery(query);
        
        // Arama tipine göre modu ayarla
        if (searchType) {
          if (searchType === 'yargitay' || searchType === 'danistay' || searchType === 'emsal' || 
              searchType === 'bedesten' || searchType === 'istinaf' || searchType === 'hukuk') {
            setMode('ictihat');
          } else if (searchType === 'kanun' || searchType === 'yonetmelik' || 
                     searchType === 'kararname' || searchType === 'genelge') {
            setMode('mevzuat');
          }
        }
        
        // Arama yap
        handleSearch();
      }
    };

    const handleDictateStart = () => {
      if (isDictationSupported) {
        startDictation();
      }
    };

    const handleDictateStop = () => {
      if (isDictating) {
        stopDictation();
      }
    };

    window.addEventListener('voice-search', handleVoiceSearch as EventListener);
    window.addEventListener('dictate-start', handleDictateStart);
    window.addEventListener('dictate-stop', handleDictateStop);
    // Deep voice actions from App.tsx
    const handleDeep = (e: Event) => {
      const intent = (e as CustomEvent).detail?.intent as { action?: string; parameters?: any };
      if (!intent) return;
      switch (intent.action) {
        case 'SEARCH_SET_MODE':
          if (intent.parameters?.mode === 'ictihat' || intent.parameters?.mode === 'mevzuat') {
            setMode(intent.parameters.mode);
          }
          break;
        case 'SEARCH_SET_COURT':
          if (typeof intent.parameters?.courtType === 'string') {
            setFilters(prev => ({ ...prev, courtType: intent.parameters.courtType }));
          }
          break;
        case 'SEARCH_SET_LEGAL_AREA':
          if (typeof intent.parameters?.legalArea === 'string') {
            setFilters(prev => ({ ...prev, legalArea: intent.parameters.legalArea }));
          }
          break;
        case 'SEARCH_SET_DATE_RANGE':
          if (typeof intent.parameters?.months === 'number') {
            setQuickDateRange(intent.parameters.months);
          }
          break;
        case 'SEARCH_TOGGLE_FILTERS':
          setShowFilters(s => !s);
          break;
        case 'SEARCH_SORT':
          if (intent.parameters?.by && intent.parameters?.dir) {
            setSort({ by: intent.parameters.by, dir: intent.parameters.dir });
            // Re-run search if we already have results
            setTimeout(() => handleSearch(), 0);
          }
          break;
        case 'SEARCH_RUN':
          if (typeof intent.parameters?.query === 'string' && intent.parameters.query) setQuery(intent.parameters.query);
          setPage(1);
          setTimeout(() => handleSearch(), 0);
          break;
        case 'SEARCH_PAGE_NEXT':
          setPage(p => p + 1);
          break;
        case 'SEARCH_PAGE_PREV':
          setPage(p => Math.max(1, p - 1));
          break;
        case 'SEARCH_OPEN_INDEX': {
          const idx = Number(intent.parameters?.index || 0);
          if (idx > 0) setSelectedIndex(idx);
          break;
        }
      }
    };
    window.addEventListener('advanced-search-action', handleDeep);
    
    return () => {
      window.removeEventListener('voice-search', handleVoiceSearch as EventListener);
      window.removeEventListener('dictate-start', handleDictateStart);
      window.removeEventListener('dictate-stop', handleDictateStop);
      window.removeEventListener('advanced-search-action', handleDeep);
    };
  }, [isDictationSupported, isDictating, startDictation, stopDictation]);

  const handleSearch = async () => {
    setErrorMsg(null);
    setIsSearching(true);

    const t0 = performance.now();
    try {
      let searchResults: SearchResult[] = [];
      
      if (mode === 'ictihat') {
        // İçtihat araması - önce gerçek API'yi dene, sonra mock data
        try {
          const apiFilters = {
            courtType: (filters.courtType || 'yargitay') as any,
            dateRange: {
              from: filters.dateRange.from || undefined,
              to: filters.dateRange.to || undefined
            },
            legalArea: filters.legalArea || undefined
          };

          const data = await searchIctihat(query, apiFilters);
          searchResults = (data || []).map((r: any) => ({
            id: r.id,
            caseNumber: r.caseNumber || '',
            courtName: r.courtName || '',
            courtType: r.courtType || (filters.courtType || ''),
            decisionDate: r.decisionDate || '',
            subject: r.subject || '',
            content: r.content || '',
            relevanceScore: r.relevanceScore || 0,
            legalAreas: r.legalAreas || [],
            keywords: r.keywords || [],
            highlight: r.highlight
          }));
          
          console.log('✅ İçtihat API başarılı:', searchResults.length, 'sonuç');
          
        } catch (apiError) {
          console.log('⚠️ İçtihat API hatası, mock data kullanılıyor:', apiError);
          
          // Mock data ile devam et
          searchResults = mockResults.filter(result => 
            result.subject.toLowerCase().includes(query.toLowerCase()) ||
            result.content.toLowerCase().includes(query.toLowerCase()) ||
            result.caseNumber.toLowerCase().includes(query.toLowerCase())
