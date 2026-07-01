import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Mail, Globe, Phone, Building, Search, RefreshCw, AlertTriangle } from 'lucide-react';

export default function AxiosDemo() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [dataSource, setDataSource] = useState('Local Express Backend');

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      // Attempt to fetch from local Node.js Express backend first
      try {
        const API_BASE = `http://${window.location.hostname}:5000/api`;
        const response = await axios.get(`${API_BASE}/users`);
        setUsers(response.data);
        setDataSource('Local Express Backend');
      } catch (localErr) {
        console.warn('Local Express server not running, falling back to public mock API.');
        const response = await axios.get('https://jsonplaceholder.typicode.com/users');
        setUsers(response.data);
        setDataSource('Public JSONPlaceholder API (Fallback)');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch user data. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.company.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Axios API Fetching Demo
          </h1>
          <p className="text-slate-400 mt-1">
            Active Source: <span className="text-purple-400 font-semibold">{dataSource}</span>
          </p>
        </div>
        <button
          onClick={fetchUsers}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-950 hover:bg-slate-900 text-slate-350 hover:text-slate-100 disabled:opacity-50 disabled:pointer-events-none transition-all duration-200"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-8 max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
        <input
          type="text"
          placeholder="Search by name, email, or company..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-slate-950/70 border border-slate-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl text-white placeholder-slate-500 focus:outline-none transition-all duration-250"
        />
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="p-6 rounded-2xl border border-slate-800 bg-slate-950 animate-pulse">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 rounded-full bg-slate-800"></div>
                <div className="flex-1">
                  <div className="h-4 bg-slate-800 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-slate-800 rounded w-1/2"></div>
                </div>
              </div>
              <div className="space-y-3 mt-4 pt-4 border-t border-slate-900">
                <div className="h-3 bg-slate-800 rounded w-5/6"></div>
                <div className="h-3 bg-slate-800 rounded w-2/3"></div>
                <div className="h-3 bg-slate-800 rounded w-4/5"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-red-500/20 bg-red-500/5 max-w-xl mx-auto">
          <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Error Occurred</h3>
          <p className="text-red-400/90 text-sm mb-6">{error}</p>
          <button
            onClick={fetchUsers}
            className="px-5 py-2.5 rounded-xl bg-red-650 hover:bg-red-550 text-white font-medium shadow-md shadow-red-650/10 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Success State */}
      {!loading && !error && (
        <>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-16 border border-slate-850 rounded-2xl bg-slate-950/40">
              <p className="text-slate-400">No users found matching "{searchQuery}".</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex flex-col justify-between p-6 rounded-2xl border border-slate-800 bg-slate-950 hover:border-slate-700 hover:shadow-[0_0_20px_rgba(99,102,241,0.05)] transition-all duration-250"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center justify-center h-12 w-12 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white leading-tight">
                          {user.name}
                        </h3>
                        <span className="text-xs text-slate-500">@{user.username}</span>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-3 mt-4 pt-4 border-t border-slate-900 text-sm">
                      <div className="flex items-center gap-3 text-slate-400">
                        <Mail className="h-4 w-4 text-slate-550 shrink-0" />
                        <span className="truncate">{user.email}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-400">
                        <Phone className="h-4 w-4 text-slate-550 shrink-0" />
                        <span>{user.phone.split(' ')[0]}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-400">
                        <Globe className="h-4 w-4 text-slate-550 shrink-0" />
                        <a
                          href={`https://${user.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-purple-400 transition-colors truncate"
                        >
                          {user.website}
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Company Info */}
                  <div className="mt-6 pt-4 border-t border-slate-900 flex items-start gap-3">
                    <Building className="h-4.5 w-4.5 text-indigo-400 mt-0.5 shrink-0" />
                    <div className="text-xs">
                      <div className="font-semibold text-slate-300">{user.company.name}</div>
                      <div className="text-slate-500 italic mt-0.5">"{user.company.catchPhrase}"</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
