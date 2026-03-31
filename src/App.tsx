import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Wallet, 
  Zap, 
  MessageSquare, 
  TrendingUp, 
  ShieldCheck, 
  AlertCircle,
  RefreshCw,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  User,
  Save,
  Phone,
  Building2,
  History
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { cn } from './lib/utils';
import { Transaction, CreditAnalysis } from './types';
import { analyzeCreditworthiness, generateSimulatedData } from './services/aiService';

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [analysis, setAnalysis] = useState<CreditAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'insights' | 'profile'>('overview');

  // Profile State
  const [profile, setProfile] = useState({
    name: 'John Doe',
    phone: '+254 712 *** 456',
    mpesaVolume: '45000',
    mpesaFrequency: 'Daily',
    utilityConsistency: '95',
    smsBusinessActivity: 'Medium',
    businessType: 'Retail'
  });

  useEffect(() => {
    handleRefreshData();
  }, []);

  const handleRefreshData = async () => {
    setLoading(true);
    const newData = generateSimulatedData();
    setTransactions(newData);
    try {
      const result = await analyzeCreditworthiness(newData);
      setAnalysis(result);
    } catch (error) {
      console.error("Analysis failed", error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = useMemo(() => {
    const daily = transactions.reduce((acc: any, curr) => {
      const date = curr.date;
      if (!acc[date]) acc[date] = { date, income: 0, expense: 0 };
      if (curr.category === 'INCOME') acc[date].income += curr.amount;
      else acc[date].expense += curr.amount;
      return acc;
    }, {});
    return Object.values(daily).reverse().slice(-14); // Last 14 days
  }, [transactions]);

  const pieData = [
    { name: 'Income', value: analysis?.metrics.monthlyIncome || 0 },
    { name: 'Expenses', value: analysis?.metrics.monthlyExpenses || 0 },
  ];

  const COLORS = ['#49B249', '#E61E26'];

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate saving and re-analyzing
    setTimeout(() => {
      setLoading(false);
      setActiveTab('overview');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-light-bg text-slate-900 selection:bg-safaricom-green/30">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-light-border bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl safaricom-gradient shadow-lg shadow-safaricom-green/20">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">Lipascore</h1>
              <p className="text-[10px] font-medium uppercase tracking-widest text-slate-500">Alternative Credit Scoring</p>
            </div>
          </div>
          <button 
            onClick={handleRefreshData}
            disabled={loading}
            className="flex items-center gap-2 rounded-full border border-light-border bg-white px-4 py-2 text-sm font-medium transition-all hover:bg-slate-50 disabled:opacity-50 shadow-sm"
          >
            <RefreshCw className={cn("h-4 w-4 text-slate-600", loading && "animate-spin")} />
            {loading ? 'Analyzing...' : 'Refresh Data'}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          
          {/* Sidebar Navigation */}
          <nav className="lg:col-span-3">
            <div className="space-y-1">
              {[
                { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
                { id: 'transactions', label: 'Transaction History', icon: Wallet },
                { id: 'insights', label: 'AI Insights', icon: TrendingUp },
                { id: 'profile', label: 'User Profile', icon: User },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all",
                    activeTab === item.id 
                      ? "bg-safaricom-green/10 text-safaricom-green" 
                      : "text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </button>
              ))}
            </div>

            {/* Quick Stats */}
            <div className="mt-8 rounded-2xl border border-light-border bg-white p-6 shadow-sm">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Risk Profile</h3>
              <div className="mt-4 flex items-center justify-between">
                <span className={cn(
                  "rounded-full px-3 py-1 text-xs font-bold",
                  analysis?.riskLevel === 'LOW' ? "bg-safaricom-green/10 text-safaricom-green" :
                  analysis?.riskLevel === 'MEDIUM' ? "bg-yellow-500/10 text-yellow-600" :
                  "bg-safaricom-red/10 text-safaricom-red"
                )}>
                  {analysis?.riskLevel || 'PENDING'} RISK
                </span>
                <span className="text-2xl font-bold text-slate-900">{analysis?.score || '---'}</span>
              </div>
              <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(analysis?.score || 0) / 10}%` }}
                  className="h-full safaricom-gradient"
                />
              </div>
              <p className="mt-4 text-xs text-slate-500 leading-relaxed">
                Score based on 90 days of simulated M-Pesa and utility payment patterns.
              </p>
            </div>
          </nav>

          {/* Main Content Area */}
          <div className="lg:col-span-9">
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div 
                  key="overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  {/* Top Stats */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-light-border bg-white p-6 shadow-sm">
                      <div className="flex items-center justify-between">
                        <Wallet className="h-6 w-6 text-safaricom-green" />
                        <span className="text-[10px] font-bold text-safaricom-green">+12% vs last month</span>
                      </div>
                      <p className="mt-4 text-sm text-slate-500">Monthly Income</p>
                      <h4 className="text-2xl font-bold text-slate-900">KES {analysis?.metrics.monthlyIncome.toLocaleString() || '0'}</h4>
                    </div>
                    <div className="rounded-2xl border border-light-border bg-white p-6 shadow-sm">
                      <div className="flex items-center justify-between">
                        <Zap className="h-6 w-6 text-yellow-500" />
                        <span className="text-[10px] font-bold text-yellow-600">Regular</span>
                      </div>
                      <p className="mt-4 text-sm text-slate-500">Utility Consistency</p>
                      <h4 className="text-2xl font-bold text-slate-900">{analysis?.metrics.consistencyScore || 0}%</h4>
                    </div>
                    <div className="rounded-2xl border border-light-border bg-white p-6 shadow-sm">
                      <div className="flex items-center justify-between">
                        <TrendingUp className="h-6 w-6 text-blue-500" />
                        <span className="text-[10px] font-bold text-blue-600">Healthy</span>
                      </div>
                      <p className="mt-4 text-sm text-slate-500">Savings Rate</p>
                      <h4 className="text-2xl font-bold text-slate-900">{analysis?.metrics.savingsRate || 0}%</h4>
                    </div>
                  </div>

                  {/* Charts Section */}
                  <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                    <div className="rounded-2xl border border-light-border bg-white p-6 shadow-sm">
                      <h3 className="mb-6 text-lg font-semibold text-slate-900">Cash Flow (Last 14 Days)</h3>
                      <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData}>
                            <defs>
                              <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#49B249" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#49B249" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                            <XAxis dataKey="date" stroke="#94A3B8" fontSize={10} tickFormatter={(val) => val.split('-')[2]} />
                            <YAxis stroke="#94A3B8" fontSize={10} />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                              itemStyle={{ fontSize: '12px' }}
                            />
                            <Area type="monotone" dataKey="income" stroke="#49B249" fillOpacity={1} fill="url(#colorIncome)" />
                            <Area type="monotone" dataKey="expense" stroke="#E61E26" fill="transparent" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-light-border bg-white p-6 shadow-sm">
                      <h3 className="mb-6 text-lg font-semibold text-slate-900">Income vs Expense Ratio</h3>
                      <div className="flex h-[250px] w-full items-center justify-center relative">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={pieData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px' }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute flex flex-col items-center">
                          <span className="text-xs text-slate-400 uppercase">Ratio</span>
                          <span className="text-xl font-bold text-slate-900">
                            {analysis ? Math.round((analysis.metrics.monthlyExpenses / analysis.metrics.monthlyIncome) * 100) : 0}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI Summary */}
                  <div className="rounded-2xl border border-safaricom-green/20 bg-safaricom-green/5 p-8">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-safaricom-green/10">
                        <MessageSquare className="h-6 w-6 text-safaricom-green" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-safaricom-green">AI Credit Analysis</h3>
                        <div className="mt-2 prose prose-slate prose-sm max-w-none text-slate-600">
                          <ReactMarkdown>{analysis?.reasoning || 'Analyzing your financial patterns...'}</ReactMarkdown>
                        </div>
                        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                          {analysis?.recommendations.map((rec, i) => (
                            <div key={i} className="flex items-center gap-3 rounded-xl bg-white p-3 text-xs border border-light-border shadow-sm">
                              <ChevronRight className="h-4 w-4 text-safaricom-green" />
                              {rec}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'transactions' && (
                <motion.div 
                  key="transactions"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="rounded-2xl border border-light-border bg-white overflow-hidden shadow-sm"
                >
                  <div className="p-6 border-b border-light-border flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
                    <div className="flex gap-2">
                      <span className="flex items-center gap-1 text-xs text-slate-400"><div className="h-2 w-2 rounded-full bg-safaricom-green"></div> M-Pesa</span>
                      <span className="flex items-center gap-1 text-xs text-slate-400"><div className="h-2 w-2 rounded-full bg-yellow-500"></div> Utility</span>
                      <span className="flex items-center gap-1 text-xs text-slate-400"><div className="h-2 w-2 rounded-full bg-blue-500"></div> SMS Biz</span>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                          <th className="px-6 py-4">Date</th>
                          <th className="px-6 py-4">Source</th>
                          <th className="px-6 py-4">Description</th>
                          <th className="px-6 py-4 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-light-border">
                        {transactions.slice(0, 20).map((tx) => (
                          <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 text-sm text-slate-500">{tx.date}</td>
                            <td className="px-6 py-4">
                              <span className={cn(
                                "rounded-full px-2 py-0.5 text-[10px] font-bold",
                                tx.type === 'MPESA' ? "bg-safaricom-green/10 text-safaricom-green" :
                                tx.type === 'UTILITY' ? "bg-yellow-500/10 text-yellow-600" :
                                "bg-blue-500/10 text-blue-600"
                              )}>
                                {tx.type}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-slate-900">{tx.description}</td>
                            <td className={cn(
                              "px-6 py-4 text-right text-sm font-bold",
                              tx.category === 'INCOME' ? "text-safaricom-green" : "text-slate-900"
                            )}>
                              {tx.category === 'INCOME' ? '+' : '-'} KES {tx.amount.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {activeTab === 'insights' && (
                <motion.div 
                  key="insights"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="rounded-2xl border border-light-border bg-white p-8 shadow-sm">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600">
                        <CreditCard className="h-6 w-6" />
                      </div>
                      <h3 className="mt-6 text-xl font-bold text-slate-900">Credit Limit Estimate</h3>
                      <p className="mt-2 text-sm text-slate-500">Based on your current cash flow and risk profile.</p>
                      <div className="mt-8">
                        <span className="text-4xl font-bold text-slate-900">KES {analysis ? Math.round(analysis.metrics.monthlyIncome * 0.4).toLocaleString() : '0'}</span>
                        <span className="ml-2 text-sm text-safaricom-green font-medium">Available Now</span>
                      </div>
                      <button className="mt-8 w-full rounded-xl safaricom-gradient py-4 font-bold text-white shadow-lg shadow-safaricom-green/20 transition-transform active:scale-95">
                        Apply for Micro-Loan
                      </button>
                    </div>

                    <div className="rounded-2xl border border-light-border bg-white p-8 shadow-sm">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-500/10 text-yellow-600">
                        <AlertCircle className="h-6 w-6" />
                      </div>
                      <h3 className="mt-6 text-xl font-bold text-slate-900">Financial Health Tips</h3>
                      <ul className="mt-6 space-y-4">
                        <li className="flex items-start gap-3 text-sm text-slate-600">
                          <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-safaricom-green" />
                          Maintain utility payments on the same date each month to boost consistency score.
                        </li>
                        <li className="flex items-start gap-3 text-sm text-slate-600">
                          <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-safaricom-green" />
                          Keep your debt-to-income ratio below 30% for premium interest rates.
                        </li>
                        <li className="flex items-start gap-3 text-sm text-slate-600">
                          <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-safaricom-green" />
                          Consolidate business payments through M-Pesa Till to improve record visibility.
                        </li>
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'profile' && (
                <motion.div 
                  key="profile"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">User Profile</h2>
                      <p className="text-sm text-slate-500">Manage your anonymized financial data for credit scoring.</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-safaricom-green/10 text-safaricom-green">
                      <User className="h-6 w-6" />
                    </div>
                  </div>

                  <form onSubmit={handleProfileUpdate} className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                    {/* Basic Info */}
                    <div className="space-y-6 rounded-2xl border border-light-border bg-white p-8 shadow-sm">
                      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                        <User className="h-5 w-5 text-safaricom-green" />
                        <h3 className="font-semibold text-slate-900">Personal Information</h3>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                          <input 
                            type="text" 
                            value={profile.name}
                            onChange={(e) => setProfile({...profile, name: e.target.value})}
                            className="w-full rounded-xl border border-light-border bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-safaricom-green focus:bg-white focus:outline-none transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Phone Number (Anonymized)</label>
                          <div className="relative">
                            <Phone className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
                            <input 
                              type="text" 
                              value={profile.phone}
                              disabled
                              className="w-full rounded-xl border border-light-border bg-slate-100/50 px-11 py-3 text-sm text-slate-400 cursor-not-allowed"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* M-Pesa Patterns */}
                    <div className="space-y-6 rounded-2xl border border-light-border bg-white p-8 shadow-sm">
                      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                        <Wallet className="h-5 w-5 text-safaricom-green" />
                        <h3 className="font-semibold text-slate-900">M-Pesa Patterns</h3>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Avg. Monthly Volume (KES)</label>
                          <input 
                            type="number" 
                            value={profile.mpesaVolume}
                            onChange={(e) => setProfile({...profile, mpesaVolume: e.target.value})}
                            className="w-full rounded-xl border border-light-border bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-safaricom-green focus:bg-white focus:outline-none transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Transaction Frequency</label>
                          <select 
                            value={profile.mpesaFrequency}
                            onChange={(e) => setProfile({...profile, mpesaFrequency: e.target.value})}
                            className="w-full rounded-xl border border-light-border bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-safaricom-green focus:bg-white focus:outline-none transition-all appearance-none"
                          >
                            <option>Daily</option>
                            <option>Weekly</option>
                            <option>Monthly</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Utility & Business */}
                    <div className="space-y-6 rounded-2xl border border-light-border bg-white p-8 shadow-sm">
                      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                        <Zap className="h-5 w-5 text-yellow-500" />
                        <h3 className="font-semibold text-slate-900">Utility & Business Records</h3>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Utility Consistency (%)</label>
                          <input 
                            type="range" 
                            min="0" 
                            max="100"
                            value={profile.utilityConsistency}
                            onChange={(e) => setProfile({...profile, utilityConsistency: e.target.value})}
                            className="w-full accent-safaricom-green"
                          />
                          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                            <span>0%</span>
                            <span>{profile.utilityConsistency}%</span>
                            <span>100%</span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">SMS Business Activity</label>
                          <select 
                            value={profile.smsBusinessActivity}
                            onChange={(e) => setProfile({...profile, smsBusinessActivity: e.target.value})}
                            className="w-full rounded-xl border border-light-border bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-safaricom-green focus:bg-white focus:outline-none transition-all appearance-none"
                          >
                            <option>High</option>
                            <option>Medium</option>
                            <option>Low</option>
                            <option>None</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Business Type</label>
                          <div className="relative">
                            <Building2 className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
                            <input 
                              type="text" 
                              value={profile.businessType}
                              onChange={(e) => setProfile({...profile, businessType: e.target.value})}
                              className="w-full rounded-xl border border-light-border bg-slate-50 px-11 py-3 text-sm text-slate-900 focus:border-safaricom-green focus:bg-white focus:outline-none transition-all"
                              placeholder="e.g. Retail, Service, Farming"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Data Privacy Notice */}
                    <div className="flex flex-col justify-between rounded-2xl border border-light-border bg-white p-8 shadow-sm">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 text-safaricom-green">
                          <ShieldCheck className="h-6 w-6" />
                          <h3 className="font-bold">Data Privacy & Security</h3>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          Lipascore uses anonymized data patterns to predict creditworthiness. 
                          We do not store your actual transaction details or personal identifiers. 
                          All data is processed securely to generate your unique credit profile.
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <History className="h-4 w-4" />
                          Last updated: Today, 10:45 AM
                        </div>
                      </div>
                      
                      <button 
                        type="submit"
                        disabled={loading}
                        className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl safaricom-gradient py-4 font-bold text-white shadow-lg shadow-safaricom-green/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                      >
                        <Save className={cn("h-5 w-5", loading && "animate-spin")} />
                        {loading ? 'Saving Changes...' : 'Save & Re-Analyze'}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-light-border bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-2 opacity-40">
            <ShieldCheck className="h-5 w-5 text-slate-600" />
            <span className="text-sm font-medium text-slate-600">Secure AI Credit Scoring Engine</span>
          </div>
          <p className="mt-4 text-xs text-slate-400">
            &copy; 2026 Lipascore. Powered by Google Gemini. This is a prototype for demonstration purposes.
          </p>
        </div>
      </footer>
    </div>
  );
}
