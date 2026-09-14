import React, { useState, useEffect, useCallback } from 'react';
import { StoredOrder, OrderStatus } from '../types';
import {
  getOrderHistory,
  refreshPendingOrders,
  fetchServerOrderStatus,
  ORDER_HISTORY_EVENT,
  updateOrderStatus,
} from '../utils/orderHistory';
import { WHATSAPP_PHONE_NUMBER } from '../utils/whatsapp';
import {
  X,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Package,
  Receipt,
  Copy,
  Check,
  MessageCircle,
  ExternalLink,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MyOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MyOrdersModal: React.FC<MyOrdersModalProps> = ({ isOpen, onClose }) => {
  const [orders, setOrders] = useState<StoredOrder[]>([]);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [refreshNotice, setRefreshNotice] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [checkingOrderId, setCheckingOrderId] = useState<string | null>(null);

  // Load and sort orders (most recent first)
  const loadOrders = useCallback(() => {
    const list = getOrderHistory();
    // Sort most recent first
    const sorted = [...list].sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime() || 0;
      const timeB = new Date(b.timestamp).getTime() || 0;
      return timeB - timeA;
    });
    setOrders(sorted);
    return sorted;
  }, []);

  // Automatic live refresh on opening and periodic polling for any pending order (Requirement 4)
  const performRefresh = useCallback(async (currentList?: StoredOrder[], isManual: boolean = false) => {
    const listToCheck = currentList || getOrderHistory();
    const hasPending = listToCheck.some((o) => o.status === 'Pending');

    if (!hasPending) {
      if (isManual) {
        setRefreshNotice('All orders are up to date');
        setTimeout(() => setRefreshNotice(null), 2500);
      }
      return;
    }

    setIsRefreshing(true);
    setRefreshNotice('Checking real-time payment status with server...');

    try {
      const { updatedOrders, updatedCount } = await refreshPendingOrders(listToCheck);
      // Sort most recent first
      const sorted = [...updatedOrders].sort((a, b) => {
        const timeA = new Date(a.timestamp).getTime() || 0;
        const timeB = new Date(b.timestamp).getTime() || 0;
        return timeB - timeA;
      });
      setOrders(sorted);

      if (updatedCount > 0) {
        setRefreshNotice(`Updated ${updatedCount} order status${updatedCount === 1 ? '' : 'es'}`);
      } else if (isManual) {
        setRefreshNotice('Status checked — still awaiting bank/gateway confirmation');
      } else {
        setRefreshNotice(null);
      }
    } catch (err) {
      console.warn('Failed to refresh pending orders:', err);
      setRefreshNotice(null);
    } finally {
      setIsRefreshing(false);
      setTimeout(() => setRefreshNotice(null), 3500);
    }
  }, []);

  // Check individual order on demand
  const handleCheckSingleOrder = async (orderId: string) => {
    setCheckingOrderId(orderId);
    try {
      const res = await fetchServerOrderStatus(orderId);
      if (res && res.status) {
        const serverStatus = String(res.status).trim();
        const norm = serverStatus.toLowerCase();
        if (norm === 'paid') {
          const payId = res.paymentId || res.payment_id || null;
          updateOrderStatus(orderId, 'Paid', payId);
        } else if (norm === 'failed') {
          updateOrderStatus(orderId, 'Failed');
        } else if (norm === 'cancelled' || norm === 'canceled') {
          updateOrderStatus(orderId, 'Cancelled');
        }
      }
      loadOrders();
    } catch (err) {
      console.warn('Single order check failed:', err);
    } finally {
      setCheckingOrderId(null);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const loaded = loadOrders();
    performRefresh(loaded);

    // Auto status-check polling every 6 seconds while modal is open if any order is Pending
    const interval = setInterval(() => {
      const current = getOrderHistory();
      if (current.some((o) => o.status === 'Pending')) {
        performRefresh(current);
      }
    }, 6000);

    return () => clearInterval(interval);
  }, [isOpen, loadOrders, performRefresh]);

  // Listen to orderHistory updates from other actions or windows
  useEffect(() => {
    const handleUpdate = () => {
      loadOrders();
    };
    window.addEventListener(ORDER_HISTORY_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener(ORDER_HISTORY_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [loadOrders]);

  const handleCopyOrderId = (id: string) => {
    try {
      navigator.clipboard.writeText(id);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // ignore
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return isoString;
      return new Intl.DateTimeFormat('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }).format(date);
    } catch {
      return isoString;
    }
  };

  // Status badge styling adhering strictly to requirement 3:
  // - Green "Paid"
  // - Red "Failed"
  // - Grey "Cancelled"
  // - Yellow "Pending"
  const renderStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Paid':
        return (
          <span
            id="badge-paid"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-600/60 shadow-xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Paid
          </span>
        );
      case 'Failed':
        return (
          <span
            id="badge-failed"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-950/80 text-red-300 border border-red-600/60 shadow-xs"
          >
            <XCircle className="w-3.5 h-3.5 text-red-400" />
            Failed
          </span>
        );
      case 'Cancelled':
        return (
          <span
            id="badge-cancelled"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-800/90 text-stone-300 border border-stone-600/60 shadow-xs"
          >
            <MinusCircle className="w-3.5 h-3.5 text-stone-400" />
            Cancelled
          </span>
        );
      case 'Pending':
      default:
        return (
          <span
            id="badge-pending"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-950/80 text-amber-300 border border-amber-500/60 shadow-xs"
          >
            <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
            Pending
          </span>
        );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6">
          {/* Dark backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
          />

          {/* Modal Container adhering strictly to dark-mode aesthetic (Requirement 6) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 15 }}
            transition={{ type: 'spring', damping: 26, stiffness: 280 }}
            className="relative w-full max-w-2xl bg-[#1A0E08] text-[#FAF7F2] rounded-2xl border border-[#3D2316] shadow-2xl overflow-hidden z-10 my-6 flex flex-col max-h-[88vh]"
          >
            {/* Header */}
            <div className="p-4 sm:p-5 bg-[#23140C] border-b border-[#3D2316] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#B45309]/20 text-[#FDE68A] flex items-center justify-center border border-[#B45309]/40">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-display text-lg sm:text-xl font-bold text-[#FDE68A]">
                    My Orders
                  </h2>
                  <p className="text-xs text-[#A88C7D]">
                    Your locally saved purchase history &amp; real-time payment status
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {orders.length > 0 && (
                  <button
                    id="refresh-order-status-button"
                    onClick={() => performRefresh(undefined, true)}
                    disabled={isRefreshing}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2E1A10] hover:bg-[#3E2316] text-[#EADFCF] hover:text-white rounded-lg text-xs font-medium border border-[#4D2E1F] transition-all cursor-pointer disabled:opacity-50"
                    title="Refresh payment status from server"
                  >
                    <RefreshCw
                      className={`w-3.5 h-3.5 text-[#FDE68A] ${isRefreshing ? 'animate-spin' : ''}`}
                    />
                    <span className="hidden sm:inline">Refresh Status</span>
                  </button>
                )}
                <button
                  id="close-my-orders-modal"
                  onClick={onClose}
                  className="p-1.5 rounded-full hover:bg-[#2E1A10] text-[#A88C7D] hover:text-white transition-colors cursor-pointer"
                  aria-label="Close My Orders"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Refreshing notification banner */}
            {refreshNotice && (
              <div className="px-5 py-2.5 bg-[#2A170E] border-b border-[#4A2B1C] text-xs text-[#FDE68A] flex items-center justify-between animate-fadeIn">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 text-[#FDE68A] animate-spin" />
                  <span>{refreshNotice}</span>
                </div>
              </div>
            )}

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {/* Empty state (Requirement 5) */}
              {orders.length === 0 ? (
                <div className="text-center py-16 px-4">
                  <div className="w-16 h-16 rounded-full bg-[#25150D] border border-[#3D2316] flex items-center justify-center mx-auto mb-4 text-[#A88C7D]">
                    <Package className="w-8 h-8 opacity-60 text-[#B45309]" />
                  </div>
                  <h3 className="text-base font-semibold text-[#FAF7F2] mb-1">
                    No orders found
                  </h3>
                  <p className="text-sm text-[#A88C7D] max-w-sm mx-auto leading-relaxed">
                    No orders yet — your order history will appear here after your first purchase.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => {
                    const isPending = order.status === 'Pending';
                    const isCheckingThis = checkingOrderId === order.orderId;

                    return (
                      <div
                        key={order.orderId}
                        className="bg-[#24140D] border border-[#3D2316] hover:border-[#5C3622] rounded-xl p-4 sm:p-5 transition-all shadow-md"
                      >
                        {/* Order Header: Order ID, Date, Status */}
                        <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-[#381F13]">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-[#A88C7D]">Order ID:</span>
                              <span className="font-mono text-xs font-bold text-[#FAF7F2] bg-[#1A0E08] px-2 py-0.5 rounded border border-[#381F13]">
                                {order.orderId}
                              </span>
                              <button
                                onClick={() => handleCopyOrderId(order.orderId)}
                                className="text-[#A88C7D] hover:text-[#FDE68A] transition-colors p-1"
                                title="Copy Order ID"
                              >
                                {copiedId === order.orderId ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                            <p className="text-xs text-[#8C7060] mt-1">
                              {formatDate(order.timestamp)}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            {renderStatusBadge(order.status)}
                          </div>
                        </div>

                        {/* Payment ID (if available) */}
                        {order.paymentId && (
                          <div className="mt-2.5 text-xs text-[#A88C7D] flex items-center gap-1.5">
                            <span>Payment ID:</span>
                            <span className="font-mono text-[11px] text-[#E0CEBF] bg-[#1A0E08] px-2 py-0.5 rounded border border-[#381F13]">
                              {order.paymentId}
                            </span>
                          </div>
                        )}

                        {/* Items List */}
                        <div className="mt-3 space-y-1.5">
                          <span className="text-xs font-medium text-[#A88C7D] uppercase tracking-wider block">
                            Items
                          </span>
                          <div className="bg-[#1C0F0A] rounded-lg p-2.5 border border-[#331C11] space-y-1.5 divide-y divide-[#2B180E]">
                            {order.items && order.items.length > 0 ? (
                              order.items.map((item, idx) => (
                                <div
                                  key={idx}
                                  className={`flex justify-between items-center text-xs ${
                                    idx > 0 ? 'pt-1.5' : ''
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-[#FAF7F2]">
                                      {item.name}
                                    </span>
                                    <span className="text-[#8C7060]">
                                      × {item.qty}
                                    </span>
                                  </div>
                                  <span className="text-[#E0CEBF] font-medium">
                                    ₹{(item.price * item.qty).toLocaleString()}
                                  </span>
                                </div>
                              ))
                            ) : (
                              <p className="text-xs text-[#8C7060] italic">
                                Bakery items details
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Total & Action Footer */}
                        <div className="mt-3.5 pt-3 border-t border-[#381F13] flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-baseline gap-2">
                            <span className="text-xs text-[#A88C7D]">Total:</span>
                            <span className="text-base sm:text-lg font-bold text-[#FDE68A]">
                              ₹{order.total.toLocaleString()}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Live status check for pending orders */}
                            {isPending && (
                              <button
                                onClick={() => handleCheckSingleOrder(order.orderId)}
                                disabled={isCheckingThis}
                                className="flex items-center gap-1.5 px-2.5 py-1 text-xs bg-[#B45309]/20 hover:bg-[#B45309]/30 text-[#FDE68A] border border-[#B45309]/40 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                              >
                                <RefreshCw
                                  className={`w-3 h-3 ${isCheckingThis ? 'animate-spin' : ''}`}
                                />
                                <span>Check Status</span>
                              </button>
                            )}

                            {/* WhatsApp Support fallback for failed or stuck orders */}
                            {(order.status === 'Failed' || order.status === 'Pending') && (
                              <a
                                href={`https://wa.me/${WHATSAPP_PHONE_NUMBER}?text=${encodeURIComponent(
                                  `Hi Sweet Treats! I have a question about my order ID: ${order.orderId} (Status: ${order.status}, Total: ₹${order.total}).`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] text-[#A88C7D] hover:text-emerald-400 transition-colors"
                              >
                                <MessageCircle className="w-3 h-3 text-emerald-500" />
                                <span>Support</span>
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer Notice */}
            <div className="p-3 sm:p-4 bg-[#1F110A] border-t border-[#3D2316] flex items-center justify-between text-[11px] text-[#8C7060]">
              <span>Saved locally in your browser storage</span>
              <button
                onClick={onClose}
                className="text-[#FDE68A] hover:underline font-medium cursor-pointer"
              >
                Back to Shop
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
