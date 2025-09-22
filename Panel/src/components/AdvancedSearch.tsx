  const mockResults: SearchResult[] = [];

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
          );
