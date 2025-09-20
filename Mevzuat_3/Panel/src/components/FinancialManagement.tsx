import React, { useState } from 'react';
import { Calculator, TrendingUp, TrendingDown, CreditCard, Receipt, PieChart, Calendar, Plus, Filter, Download, Eye } from 'lucide-react';

interface FinancialManagementProps {
  onNavigate?: (tab: string) => void;
}

import { useSupabase } from '../hooks/useSupabase';
const FinancialManagement: React.FC<FinancialManagementProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const { financials, addFinancial } = useSupabase();

  // Supabase'den canlı veriler
  const totalRevenue = financials.filter(f => f.type === 'income').reduce((sum, f) => sum + Number(f.amount), 0);
  const totalExpenses = financials.filter(f => f.type === 'expense').reduce((sum, f) => sum + Number(f.amount), 0);
  const netProfit = totalRevenue - totalExpenses;
  const pendingPayments = financials.filter(f => f.status === 'pending').reduce((sum, f) => sum + Number(f.amount), 0);
  const monthlyGrowth = 0; // Gelişmiş analiz için eklenebilir

  // Son işlemler
  const recentTransactions = financials.slice(-10).reverse();

  // Aylık gelir/gider
  const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  const monthlyData = months.map((month, idx) => {
    const income = financials.filter(f => f.type === 'income' && new Date(f.date).getMonth() === idx).reduce((sum, f) => sum + Number(f.amount), 0);
    const expense = financials.filter(f => f.type === 'expense' && new Date(f.date).getMonth() === idx).reduce((sum, f) => sum + Number(f.amount), 0);
    return { month, income, expense };
  });

  // Yeni işlem ekleme
  const [newTransaction, setNewTransaction] = useState({ type: 'income', description: '', amount: '', date: '', status: 'pending' });
  const handleAddTransaction = async (e) => {
    e.preventDefault();
    try {
      await addFinancial(newTransaction);
      setShowAddTransaction(false);
      setNewTransaction({ type: 'income', description: '', amount: '', date: '', status: 'pending' });
    } catch (err) {
      // Hata yönetimi
    }
  };

  return (
    <div className="space-y-6">
      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Toplam Gelir</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ₺{totalRevenue.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-green-600 dark:text-green-400 text-sm font-medium">
              +{financialData.monthlyGrowth}%
            </span>
            <span className="text-gray-600 dark:text-gray-400 text-sm ml-2">bu ay</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Toplam Gider</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ₺{totalExpenses.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-red-600 dark:text-red-400 text-sm font-medium">
              +8.2%
            </span>
            <span className="text-gray-600 dark:text-gray-400 text-sm ml-2">bu ay</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Net Kar</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ₺{netProfit.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Calculator className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">
              +15.3%
            </span>
            <span className="text-gray-600 dark:text-gray-400 text-sm ml-2">bu ay</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Bekleyen Ödemeler</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ₺{pendingPayments.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <CreditCard className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-yellow-600 dark:text-yellow-400 text-sm font-medium">
              5 bekleyen
            </span>
            <span className="text-gray-600 dark:text-gray-400 text-sm ml-2">ödeme</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Genel Bakış', icon: PieChart },
              { id: 'transactions', label: 'İşlemler', icon: Receipt },
              { id: 'reports', label: 'Raporlar', icon: TrendingUp }
            ].map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Monthly Chart */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Aylık Gelir/Gider Grafiği
                </h3>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="space-y-3">
                    {monthlyData.map((data, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-16">
                          {data.month}
                        </span>
                        <div className="flex-1 mx-4">
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                              <div
                                className="bg-green-500 h-2 rounded-full"
                                style={{ width: `${(data.income / 70000) * 100}%` }}
                              ></div>
                            </div>
                            <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                              <div
                                className="bg-red-500 h-2 rounded-full"
                                style={{ width: `${(data.expense / 70000) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-green-600">
                            +₺{data.income.toLocaleString()}
                          </div>
                          <div className="text-sm font-medium text-red-600">
                            -₺{data.expense.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Hızlı İşlemler
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => setShowAddTransaction(true)}
                    className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
                  >
                    <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Yeni İşlem Ekle
                    </p>
                  </button>
                  <button className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
                    <Download className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Rapor İndir
                    </p>
                  </button>
                  <button className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
                    <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Ödeme Planla
                    </p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Son İşlemler
                </h3>
                <div className="flex gap-2">
                  <button className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Filtrele
                  </button>
                  <button
                    onClick={() => setShowAddTransaction(true)}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Yeni İşlem
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Açıklama
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Tür
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Tutar
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Tarih
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Durum
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        İşlemler
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {recentTransactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {transaction.description}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            transaction.type === 'income'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {transaction.type === 'income' ? 'Gelir' : 'Gider'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-medium ${
                            transaction.type === 'income'
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {transaction.type === 'income' ? '+' : '-'}₺{transaction.amount.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {transaction.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            transaction.status === 'completed'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }`}>
                            {transaction.status === 'completed' ? 'Tamamlandı' : 'Bekliyor'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3">
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Mali Raporlar
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-4">
                      Aylık Gelir Raporu
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Bu Ay</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          ₺60,000
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Geçen Ay</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          ₺55,000
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Değişim</span>
                        <span className="text-sm font-medium text-green-600 dark:text-green-400">
                          +9.1%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-4">
                      Gider Analizi
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Ofis Giderleri</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          ₺12,000
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Personel</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          ₺25,000
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Diğer</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          ₺8,000
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  PDF Rapor İndir
                </button>
                <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Excel İndir
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Transaction Modal */}
      {showAddTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Yeni İşlem Ekle
            </h3>
            <form className="space-y-4" onSubmit={handleAddTransaction}>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  İşlem Türü
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  value={newTransaction.type}
                  onChange={e => setNewTransaction({ ...newTransaction, type: e.target.value })}
                >
                  <option value="income">Gelir</option>
                  <option value="expense">Gider</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Açıklama
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="İşlem açıklaması"
                  value={newTransaction.description}
                  onChange={e => setNewTransaction({ ...newTransaction, description: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tutar
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="0.00"
                  value={newTransaction.amount}
                  onChange={e => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tarih
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  value={newTransaction.date}
                  onChange={e => setNewTransaction({ ...newTransaction, date: e.target.value })}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddTransaction(false)}
                  className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialManagement;