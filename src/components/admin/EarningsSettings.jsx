// components/admin/EarningsSettings.jsx

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { IndianRupee, Save, RefreshCw, AlertCircle } from 'lucide-react';

const EarningsSettings = () => {
  const { token } = useSelector(state => state.user);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const [settings, setSettings] = useState({
    earningPerPage: 0.05,
    minWithdrawal: 10,
  });

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

  const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  useEffect(() => {
    fetchSettings();
  }, [token]);

  const fetchSettings = async () => {
    setFetching(true);
    try {
      const res = await api.get('/admin/earnings-settings');
      if (res.data.success) {
        setSettings(res.data.settings);
      }
    } catch (err) {
      toast.error('Failed to load settings');
    } finally {
      setFetching(false);
    }
  };

  const handleSave = async () => {
    if (settings.earningPerPage < 0.01 || settings.earningPerPage > 1) {
      toast.error('Earning rate must be ₹0.01 to ₹1.00');
      return;
    }
    if (settings.minWithdrawal < 10 || settings.minWithdrawal > 500) {
      toast.error('Minimum withdrawal must be ₹10 to ₹500');
      return;
    }

    setLoading(true);
    try {
      await api.post('/admin/earnings-settings', settings);
      toast.success('Settings updated!');
    } catch (err) {
      toast.error('Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Earnings Settings</h1>
          <p className="text-gray-600">Admin can change earning rates anytime</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
          {/* Earning Per Page */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <IndianRupee className="h-4 w-4 mr-1" />
              Earning Per Page View
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="number"
                min="0.01"
                max="1"
                step="0.01"
                value={settings.earningPerPage}
                onChange={(e) => handleChange('earningPerPage', e.target.value)}
                className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-600">per page view</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Users earn this amount every time someone views a page
            </p>
          </div>

          {/* Minimum Withdrawal */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <AlertCircle className="h-4 w-4 mr-1" />
              Minimum Withdrawal
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="number"
                min="10"
                max="500"
                step="5"
                value={settings.minWithdrawal}
                onChange={(e) => handleChange('minWithdrawal', e.target.value)}
                className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-600">minimum payout</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Users can withdraw only after reaching this amount
            </p>
          </div>

          {/* Save Button */}
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>

          {/* Live Example */}
          <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
            <h3 className="text-sm font-medium text-indigo-900 mb-2">Live Example</h3>
            <p className="text-xs text-indigo-700">
              10 pages × 100 views × ₹{settings.earningPerPage} = 
              <span className="text-green-600 font-bold">
                {' ₹' + (100 * 10 * settings.earningPerPage).toFixed(2)}
              </span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default EarningsSettings;