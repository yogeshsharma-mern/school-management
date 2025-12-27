import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiPath from '../api/apiPath';
import { apiGet } from '../api/apiFetch';
import { useNavigate } from 'react-router-dom';
import { 
  format, 
  parseISO 
} from 'date-fns';
import { 
  Download, 
  Filter, 
  Search, 
  ChevronDown, 
  CreditCard, 
  User, 
  Calendar,
  AlertCircle,
  Loader2
} from 'lucide-react';

const fetchTransactions = async () => {
  const res = await apiGet(apiPath.walletTransactions);
  return res.results;
};

export default function TransactionDetails() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const navigate = useNavigate();

  const {
    data: transactions = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['wallet-transactions'],
    queryFn: fetchTransactions,
  });

  // Filter and sort transactions
  const filteredTransactions = React.useMemo(() => {
    let filtered = transactions.filter(tx => {
      const matchesSearch = 
        tx.referenceId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.teacherName?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = filterType === 'all' || tx.type === filterType;
      
      return matchesSearch && matchesType;
    });

    // Sorting
    filtered.sort((a, b) => {
      let valA, valB;
      
      switch(sortBy) {
        case 'date':
          valA = new Date(a.createdAt).getTime();
          valB = new Date(b.createdAt).getTime();
          break;
        case 'amount':
          valA = a.amount;
          valB = b.amount;
          break;
        case 'name':
          valA = a.studentName || a.teacherName || '';
          valB = b.studentName || b.teacherName || '';
          break;
        default:
          return 0;
      }
      
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });

    return filtered;
  }, [transactions, searchTerm, filterType, sortBy, sortOrder]);

  const handleExport = () => {
    // Implement export functionality
    console.log('Export transactions');
  };

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">

        <div className="text-center">
            
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-3" />
          
          <p className="text-gray-600">Loading transaction history...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-red-700 mb-2">
            <AlertCircle className="w-5 h-5" />
            <h3 className="font-semibold">Failed to load transactions</h3>
          </div>
          <p className="text-red-600 text-sm">{error?.message}</p>
        </div>
      </div>
    );
  }

  const totalAmount = filteredTransactions.reduce((sum, tx) => sum + tx.amount, 0);
  const creditCount = filteredTransactions.filter(tx => tx.type === 'credit').length;
  const debitCount = filteredTransactions.filter(tx => tx.type === 'debit').length;

  return (
    <div className="md:p-6 p-2 space-y-6 w-[100vw] md:w-[83vw]">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
                    <button onClick={()=>
                        {
                            navigate(-1);
                        }
                    } className='bg-gray-300 px-3 py-1 rounded mb-3 cursor-pointer'>Back</button>
          <h1 className="text-2xl font-bold text-gray-900">Transaction History</h1>
          <p className="text-gray-500 text-sm mt-1">
            Track all wallet transactions in real-time
          </p>
        </div>
        
        {/* <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button> */}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Volume</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ₹{totalAmount.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Credits</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {creditCount}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="w-6 h-6 text-green-600 font-bold">+</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Debits</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {debitCount}
              </p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <div className="w-6 h-6 text-red-600 font-bold">-</div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl border border-gray-200 p-2 md:p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions, reference, or user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="all">All Types</option>
              <option value="credit">Credit</option>
              <option value="debit">Debit</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="date">Sort by Date</option>
              <option value="amount">Sort by Amount</option>
              <option value="name">Sort by Name</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <ChevronDown className={`w-4 h-4 transition-transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Reference
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  User Details
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Class
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTransactions.map((tx) => {
                const isCredit = tx.type === 'credit';
                const userName = tx.studentName || tx.teacherName;
                const userRole = tx.studentName ? 'Student' : tx.teacherName ? 'Teacher' : null;

                return (
                  <tr 
                    key={tx._id}
                    className="hover:bg-gray-50/50 transition-colors group"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {format(parseISO(tx.createdAt), 'MMM dd, yyyy')}
                          </div>
                          <div className="text-gray-500">
                            {format(parseISO(tx.createdAt), 'hh:mm a')}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-sm font-mono bg-gray-50 px-3 py-1.5 rounded-md text-gray-700 group-hover:bg-gray-100 transition-colors">
                        {tx.referenceId}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {tx.description}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {userName || '-'}
                          </div>
                          {userRole && (
                            <div className="text-xs text-gray-500">
                              {userRole}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {tx.studentClass
                          ? `${tx.studentClass.name} - ${tx.studentClass.section}`
                          : tx.teacherClass
                          ? `${tx.teacherClass.name} - ${tx.teacherClass.section}`
                          : '-'}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className={`text-sm font-semibold ${isCredit ? 'text-green-600' : 'text-red-600'}`}>
                        <div className="flex items-center gap-1">
                          {isCredit ? (
                            <span className="text-green-500">+</span>
                          ) : (
                            <span className="text-red-500">-</span>
                          )}
                          ₹{tx.amount.toLocaleString()}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${
                        isCredit
                          ? 'bg-green-50 text-green-700'
                          : 'bg-red-50 text-red-700'
                      }`}>
                        {isCredit ? (
                          <>
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>
                            Credit
                          </>
                        ) : (
                          <>
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1.5"></span>
                            Debit
                          </>
                        )}
                      </span>
                    </td>
                  </tr>
                );
              })}

              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="text-gray-400">
                      <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-lg font-medium text-gray-500">No transactions found</p>
                      <p className="text-sm text-gray-400 mt-1">
                        {searchTerm || filterType !== 'all' 
                          ? 'Try adjusting your search or filters' 
                          : 'No transactions recorded yet'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {filteredTransactions.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-sm text-gray-500">
                Showing <span className="font-medium">{filteredTransactions.length}</span> of{' '}
                <span className="font-medium">{transactions.length}</span> transactions
              </div>
              
              <div className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}