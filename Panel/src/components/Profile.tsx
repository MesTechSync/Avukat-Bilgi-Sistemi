import React, { useState } from 'react';
import { User, Edit, Camera, Mail, Phone, Building, MapPin, Calendar, Award, Star, TrendingUp, FileText, Users, Gavel } from 'lucide-react';

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Av. Mehmet Zeki Alagöz',
    title: 'Kıdemli Avukat',
    email: 'mehmet@hukuk.com',
    phone: '+90 532 123 4567',
    company: 'Hukuk Bürosu & Ortakları',
    address: 'Levent, İstanbul, Türkiye',
    bio: 'Ticaret hukuku, iş hukuku ve medeni hukuk alanlarında 15 yıllık deneyime sahip avukat. Müvekkillerine en iyi hukuki hizmeti sunmak için sürekli kendini geliştiren, yenilikçi çözümler üreten bir hukuk uzmanı.',
    specializations: ['Ticaret Hukuku', 'İş Hukuku', 'Medeni Hukuk', 'Aile Hukuku'],
    experience: '15 yıl',
    education: 'İstanbul Üniversitesi Hukuk Fakültesi',
    barNumber: '12345',
    languages: ['Türkçe', 'İngilizce', 'Almanca']
  });

  const stats = [
    { label: 'Toplam Davalar', value: '247', icon: Gavel, color: 'text-blue-600' },
    { label: 'Aktif Müvekkiller', value: '89', icon: Users, color: 'text-green-600' },
    { label: 'Başarı Oranı', value: '%94', icon: TrendingUp, color: 'text-purple-600' },
    { label: 'Deneyim', value: '15 Yıl', icon: Award, color: 'text-orange-600' }
  ];

  const recentAchievements = [
    {
      title: 'Yılın Avukatı Ödülü',
      organization: 'İstanbul Barosu',
      date: '2024',
      type: 'award'
    },
    {
      title: 'Ticaret Hukuku Sertifikası',
      organization: 'Türkiye Barolar Birliği',
      date: '2023',
      type: 'certificate'
    },
    {
      title: '100+ Başarılı Dava',
      organization: 'Kişisel Başarı',
      date: '2023',
      type: 'milestone'
    }
  ];

  const handleSave = () => {
    setIsEditing(false);
    alert('Profil bilgileri güncellendi!');
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-blue-600/90 to-purple-600/90 text-white rounded-xl backdrop-blur-xl shadow-2xl border border-white/20 overflow-hidden">
        <div className="p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Profile Picture */}
            <div className="relative">
              <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border-4 border-white/30">
                <span className="text-4xl font-bold text-white">
                  {profile.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <button className="absolute bottom-2 right-2 p-2 bg-white/20 rounded-full backdrop-blur-sm hover:bg-white/30 transition-colors">
                <Camera className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{profile.name}</h1>
                  <p className="text-xl text-blue-100 mb-2">{profile.title}</p>
                  <div className="flex items-center gap-4 text-blue-100">
                    <span className="flex items-center gap-1">
                      <Building className="w-4 h-4" />
                      {profile.company}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {profile.address}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg backdrop-blur-sm hover:bg-white/30 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  {isEditing ? 'İptal' : 'Düzenle'}
                </button>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-blue-100">
                  <Mail className="w-4 h-4" />
                  <span>{profile.email}</span>
                </div>
                <div className="flex items-center gap-2 text-blue-100">
                  <Phone className="w-4 h-4" />
                  <span>{profile.phone}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div key={index} className="bg-white/70 dark:bg-gray-800/70 p-6 rounded-xl shadow-xl border border-white/20 dark:border-gray-700/50 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg bg-gray-100 dark:bg-gray-700`}>
                  <IconComponent className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bio Section */}
          <div className="bg-white/70 dark:bg-gray-800/70 rounded-xl shadow-xl border border-white/20 dark:border-gray-700/50 backdrop-blur-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Hakkımda
            </h3>
            {isEditing ? (
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile({...profile, bio: e.target.value})}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            ) : (
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {profile.bio}
              </p>
            )}
          </div>

          {/* Professional Info */}
          <div className="bg-white/70 dark:bg-gray-800/70 rounded-xl shadow-xl border border-white/20 dark:border-gray-700/50 backdrop-blur-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Profesyonel Bilgiler
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Uzmanlık Alanları
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profile.specializations.join(', ')}
                    onChange={(e) => setProfile({...profile, specializations: e.target.value.split(', ')})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profile.specializations.map((spec, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                        {spec}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Deneyim
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profile.experience}
                    onChange={(e) => setProfile({...profile, experience: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                ) : (
                  <p className="text-gray-700 dark:text-gray-300">{profile.experience}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Eğitim
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profile.education}
                    onChange={(e) => setProfile({...profile, education: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                ) : (
                  <p className="text-gray-700 dark:text-gray-300">{profile.education}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Baro Sicil No
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profile.barNumber}
                    onChange={(e) => setProfile({...profile, barNumber: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                ) : (
                  <p className="text-gray-700 dark:text-gray-300">{profile.barNumber}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Diller
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profile.languages.join(', ')}
                    onChange={(e) => setProfile({...profile, languages: e.target.value.split(', ')})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profile.languages.map((lang, index) => (
                      <span key={index} className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm">
                        {lang}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Kaydet
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recent Achievements */}
          <div className="bg-white/70 dark:bg-gray-800/70 rounded-xl shadow-xl border border-white/20 dark:border-gray-700/50 backdrop-blur-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Son Başarılar
            </h3>
            <div className="space-y-4">
              {recentAchievements.map((achievement, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-white/50 dark:bg-gray-700/50 rounded-lg backdrop-blur-sm">
                  <div className={`p-2 rounded-lg ${
                    achievement.type === 'award' ? 'bg-yellow-100 dark:bg-yellow-900' :
                    achievement.type === 'certificate' ? 'bg-blue-100 dark:bg-blue-900' :
                    'bg-green-100 dark:bg-green-900'
                  }`}>
                    {achievement.type === 'award' ? (
                      <Award className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                    ) : achievement.type === 'certificate' ? (
                      <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <Star className="w-4 h-4 text-green-600 dark:text-green-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                      {achievement.title}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {achievement.organization}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {achievement.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white/70 dark:bg-gray-800/70 rounded-xl shadow-xl border border-white/20 dark:border-gray-700/50 backdrop-blur-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Hızlı İşlemler
            </h3>
            <div className="space-y-3">
              <button className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50/70 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100/70 dark:hover:bg-blue-900/50 transition-colors">
                <FileText className="w-4 h-4" />
                <span className="font-medium">CV İndir</span>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 bg-green-50/70 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100/70 dark:hover:bg-green-900/50 transition-colors">
                <Mail className="w-4 h-4" />
                <span className="font-medium">İletişim Kartı</span>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 bg-purple-50/70 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-100/70 dark:hover:bg-purple-900/50 transition-colors">
                <Award className="w-4 h-4" />
                <span className="font-medium">Sertifikalar</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}