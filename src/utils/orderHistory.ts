import { StoredOrder, OrderStatus } from '../types';
import { GOOGLE_SCRIPT_API_URL } from './api';

export const ORDER_HISTORY_STORAGE_KEY = 'orderHistory';
export const ORDER_HISTORY_EVENT = 'sweet_treats_order_history_updated';

function emitOrderHistoryUpdated() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(ORDER_HISTORY_EVENT));
  }
}

/**
 * Retrieve the locally stored orders array from localStorage.
 */
export function getOrderHistory(): StoredOrder[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ORDER_HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (err) {
    console.warn('Failed to parse orderHistory from localStorage:', err);
    return [];
  }
}

/**
 * Save an initial order creation attempt (Status: Pending) to localStorage.
 */
export function saveOrderAttempt(order: StoredOrder): StoredOrder[] {
  try {
    const current = getOrderHistory();
    // Check if orderId already exists; if so, replace it, otherwise prepend
    const existingIndex = current.findIndex((o) => o.orderId === order.orderId);
    let updated: StoredOrder[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = order;
    } else {
      updated = [order, ...current];
    }
    localStorage.setItem(ORDER_HISTORY_STORAGE_KEY, JSON.stringify(updated));
    emitOrderHistoryUpdated();
    return updated;
  } catch (err) {
    console.error('Failed to save order attempt to localStorage:', err);
    return getOrderHistory();
  }
}

/**
 * Update the status and optional paymentId of an order in localStorage.
 * Guaranteed not to downgrade a 'Paid' status to 'Cancelled' or 'Failed'.
 */
export function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  paymentId?: string | null
): StoredOrder[] {
  try {
    const current = getOrderHistory();
    let changed = false;

    const updated = current.map((order) => {
      if (order.orderId === orderId) {
        // If it was already marked Paid, don't overwrite with Failed or Cancelled
        if (order.status === 'Paid' && newStatus !== 'Paid') {
          return order;
        }

        changed = true;
        return {
          ...order,
          status: newStatus,
          paymentId:
            paymentId !== undefined
              ? paymentId
              : order.paymentId,
        };
      }
      return order;
    });

    if (changed) {
      localStorage.setItem(ORDER_HISTORY_STORAGE_KEY, JSON.stringify(updated));
      emitOrderHistoryUpdated();
    }
    return updated;
  } catch (err) {
    console.error('Failed to update order status in localStorage:', err);
    return getOrderHistory();
  }
}

/**
 * Returns true if there is at least one order in local storage marked 'Pending'.
 */
export function hasPendingOrders(): boolean {
  try {
    const list = getOrderHistory();
    return list.some((order) => order.status === 'Pending');
  } catch {
    return false;
  }
}

/**
 * Calls the Google Apps Script action=orderStatus endpoint for an order.
 * https://script.google.com/macros/s/.../exec?action=orderStatus&order_id=<orderId>
 */
export async function fetchServerOrderStatus(orderId: string): Promise<{
  success?: boolean;
  status?: string;
  paymentId?: string | null;
  payment_id?: string | null;
  order_id?: string;
  orderId?: string;
  message?: string;
} | null> {
  try {
    const url = `${GOOGLE_SCRIPT_API_URL}?action=orderStatus&order_id=${encodeURIComponent(orderId)}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      return null;
    }

    const text = await res.text();
    try {
      const data = JSON.parse(text);
      return data;
    } catch {
      console.warn(`Non-JSON response for order ${orderId}:`, text);
      return null;
    }
  } catch (err) {
    console.warn(`Error checking server status for order ${orderId}:`, err);
    return null;
  }
}

/**
 * Refreshes all orders currently marked 'Pending' by checking the server.
 * Handles:
 * - "Paid" -> updates status to "Paid" and sets paymentId if provided
 * - "Initiated" -> shows as "Pending" (left as Pending)
 * - "Not Found" -> left as is
 */
export async function refreshPendingOrders(
  currentOrders?: StoredOrder[]
): Promise<{ updatedOrders: StoredOrder[]; updatedCount: number }> {
  const orders = currentOrders || getOrderHistory();
  let updatedCount = 0;
  let hasChanges = false;

  const refreshed = await Promise.all(
    orders.map(async (order) => {
      if (order.status !== 'Pending') {
        return order;
      }

      const res = await fetchServerOrderStatus(order.orderId);
      if (!res || !res.status) {
        return order;
      }

      const serverStatus = String(res.status).trim();
      const normalized = serverStatus.toLowerCase();

      if (normalized === 'paid') {
        const foundPaymentId =
          res.paymentId || res.payment_id || order.paymentId || null;
        hasChanges = true;
        updatedCount++;
        return {
          ...order,
          status: 'Paid' as OrderStatus,
          paymentId: foundPaymentId,
        };
      } else if (normalized === 'initiated') {
        // Show as "Pending" (leave as Pending)
        return order;
      } else if (normalized === 'not found') {
        // Leave as is
        return order;
      } else if (normalized === 'failed') {
        hasChanges = true;
        updatedCount++;
        return {
          ...order,
          status: 'Failed' as OrderStatus,
        };
      } else if (normalized === 'cancelled' || normalized === 'canceled') {
        hasChanges = true;
        updatedCount++;
        return {
          ...order,
          status: 'Cancelled' as OrderStatus,
        };
      }

      return order;
    })
  );

  if (hasChanges) {
    localStorage.setItem(ORDER_HISTORY_STORAGE_KEY, JSON.stringify(refreshed));
    emitOrderHistoryUpdated();
  }

  return { updatedOrders: refreshed, updatedCount };
}
