# 🏛️ Avukat Bilgi Sistemi

**AI-Powered Legal Management System**

Modern, kullanıcı dostu ve AI destekli hukuki süreç yönetim sistemi.

## ✨ Özellikler

### 🤖 AI Destekli Özellikler
- **Hukuk Asistanı**: Gemini ve OpenAI ile çift AI sistemi
- **Sözleşme Oluşturucu**: AI ile otomatik sözleşme hazırlama
- **Dilekçe Yazımı**: AI destekli dilekçe oluşturma
- **Notebook LLM**: Belge analizi ve hukuki değerlendirme

### 📊 Yönetim Modülleri
- **Dava Yönetimi**: Dava takibi ve organizasyon
- **Müvekkil Yönetimi**: Müvekkil bilgileri ve iletişim
- **Mali İşler**: Gelir-gider takibi ve raporlama
- **Randevu Yönetimi**: Takvim ve randevu sistemi

### 🔍 Araştırma ve Analiz
- **İçtihat & Mevzuat**: Yargı kararları ve mevzuat arama
- **Belge ile Arama**: PDF, DOCX dosyalarından arama
- **Dosya Dönüştürücü**: Belge format dönüştürme

### 🎨 Modern UI/UX
- **Dark/Light Mode**: Tema değiştirme
- **Responsive Tasarım**: Mobil ve desktop uyumlu
- **Voice Commands**: Sesli komut desteği
- **Real-time Updates**: Canlı güncellemeler

## 🚀 Kurulum

### Gereksinimler
- Node.js 18+
- npm veya yarn
- Supabase hesabı

### Adımlar

1. **Repository'yi klonlayın**
```bash
git clone https://github.com/MesTechSync/Avukat-Bilgi-Sistemi.git
cd Avukat-Bilgi-Sistemi/Panel
```

2. **Bağımlılıkları yükleyin**
```bash
npm install
```

3. **Environment variables ayarlayın**
`.env.local` dosyası oluşturun:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_OPENAI_API_KEY=your_openai_api_key
GEMINI_API_KEY=your_gemini_api_key
```

4. **Development server'ı başlatın**
```bash
npm run dev
```

5. **Production build**
```bash
npm run build:production
```

## 🛠️ Teknolojiler

### Frontend
- **React 18**: Modern UI framework
- **TypeScript**: Type safety
- **Vite**: Fast build tool
- **Tailwind CSS**: Utility-first CSS
- **Lucide React**: Modern icon library

### Backend & Database
- **Supabase**: PostgreSQL database
- **Row Level Security**: Güvenlik
- **Real-time subscriptions**: Canlı güncellemeler

### AI Services
- **Google Gemini**: AI chat ve analiz
- **OpenAI GPT**: Sözleşme ve dilekçe oluşturma
- **Dual AI System**: En iyi yanıtı seçme

### Development Tools
- **Vitest**: Testing framework
- **ESLint**: Code linting
- **Prettier**: Code formatting

## 📱 Kullanım

### Ana Özellikler

1. **Dashboard**: Genel bakış ve hızlı erişim
2. **AI Chat**: Hukuki sorularınız için AI asistan
3. **Case Management**: Dava dosyalarınızı yönetin
4. **Client Management**: Müvekkil bilgilerini organize edin
5. **Contract Generator**: AI ile sözleşme oluşturun
6. **Petition Writer**: Dilekçe yazımı
7. **Advanced Search**: İçtihat ve mevzuat arama

### AI Özellikleri

- **Dual AI System**: Gemini ve OpenAI karşılaştırması
- **Legal Context**: Hukuki bağlamda yanıtlar
- **Document Analysis**: Belge analizi
- **Contract Generation**: Otomatik sözleşme oluşturma

## 🔧 API Keys

### Gerekli API Keys
- **Supabase**: Database ve authentication
- **OpenAI**: GPT-4 için API key
- **Gemini**: Google AI için API key

### API Key Kurulumu
1. Supabase projesi oluşturun
2. OpenAI API key alın
3. Gemini API key alın
4. Environment variables'a ekleyin

## 📊 Database Schema

### Ana Tablolar
- **cases**: Dava dosyaları
- **clients**: Müvekkil bilgileri
- **financials**: Mali işlemler
- **appointments**: Randevular (opsiyonel)

### Güvenlik
- Row Level Security (RLS) aktif
- JWT token authentication
- Secure API endpoints

## 🚀 Deployment

### Production Build
```bash
npm run build:production
```

### Static Hosting
- Vercel
- Netlify
- GitHub Pages
- AWS S3

### Environment Variables
Production'da gerekli environment variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_OPENAI_API_KEY`
- `GEMINI_API_KEY`

## 🧪 Testing

```bash
# Unit tests
npm run test

# Watch mode
npm run test:watch

# AI Chat integrity check
npm run check:aichat
```

## 📈 Performance

### Optimizasyonlar
- **Code Splitting**: Lazy loading
- **Tree Shaking**: Unused code removal
- **Bundle Optimization**: Minification
- **Caching**: Browser caching
- **CDN**: Static asset delivery

### Monitoring
- **Console Logs**: Development only
- **Error Tracking**: Production errors
- **Performance Metrics**: Load times
- **User Analytics**: Usage statistics

## 🔒 Güvenlik

### Data Protection
- **Encryption**: Data encryption
- **Authentication**: JWT tokens
- **Authorization**: Role-based access
- **Input Validation**: XSS protection

### Privacy
- **GDPR Compliance**: Data privacy
- **Local Storage**: Secure storage
- **API Security**: Rate limiting
- **HTTPS**: Secure connections

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

Bu proje MIT lisansı altında lisanslanmıştır.

## 📞 Support

- **Issues**: GitHub Issues
- **Documentation**: README.md
- **Email**: support@example.com

## 🎯 Roadmap

### v1.1
- [ ] Mobile app
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] API documentation

### v1.2
- [ ] Team collaboration
- [ ] Advanced AI features
- [ ] Integration APIs
- [ ] Performance monitoring

---

**Made with ❤️ for Legal Professionals**
