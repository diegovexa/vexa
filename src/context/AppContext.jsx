import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../config/supabase";
import { productsService } from "../services/productsService";
import { ordersService } from "../services/ordersService";
import { configService } from "../services/configService";
import { isLocalMode, localDB } from "../services/backend";

const AppContext = createContext(null);
const CART_KEY = "vexa.cart";
const LOCAL_ADMIN_KEY = "vexa.localAdmin";

// Login sin Supabase: solo en desarrollo (npm run dev), nunca en el build de producción
export const LOCAL_LOGIN_ENABLED = import.meta.env.DEV;

export function AppProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [localMode, setLocalModeState] = useState(isLocalMode());
  const [cart, setCart] = useState(() => localDB.get(CART_KEY, []));

  useEffect(() => { localDB.set(CART_KEY, cart); }, [cart]);

  useEffect(() => {
    if (LOCAL_LOGIN_ENABLED && localDB.get(LOCAL_ADMIN_KEY, null)) {
      setUser(localDB.get(LOCAL_ADMIN_KEY, null));
    }
    supabase.auth.getSession()
      .then(({ data: { session } }) => { if (session?.user) setUser(session.user); })
      .catch(() => {});
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) setUser(session.user);
    });
    return () => listener?.subscription?.unsubscribe();
  }, []);

  async function loadData() {
    try {
      setLoadError(null);
      const [prods, cfg] = await Promise.all([
        productsService.getAll(),
        configService.get(),
      ]);
      setProducts(prods);
      setConfig(cfg);
      setLocalModeState(isLocalMode());
    } catch (err) {
      console.error("Error cargando datos:", err);
      setLoadError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function loadOrders() {
    try {
      const o = await ordersService.getAll();
      setOrders(o);
    } catch (err) {
      console.error("Error cargando pedidos:", err.message);
    }
  }

  async function signIn(email, password) {
    if (isLocalMode() && LOCAL_LOGIN_ENABLED) {
      const localUser = { id: "local-admin", email: email || "admin@local" };
      localDB.set(LOCAL_ADMIN_KEY, localUser);
      setUser(localUser);
      return { user: localUser };
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  async function signOut() {
    localDB.set(LOCAL_ADMIN_KEY, null);
    if (!isLocalMode()) await supabase.auth.signOut();
    setUser(null);
  }

  async function addOrder(orderData) {
    const order = await ordersService.create(orderData);
    setOrders(prev => [order, ...prev]);
    return order;
  }

  async function updateOrderStatus(id, status) {
    const updated = await ordersService.updateStatus(id, status);
    setOrders(prev => prev.map(o => o.id === id ? updated : o));
    return updated;
  }

  async function refreshProducts() {
    const prods = await productsService.getAll();
    setProducts(prods);
  }

  async function refreshConfig() {
    const cfg = await configService.get();
    setConfig(cfg);
  }

  // === Carrito (compartido entre páginas y guardado en el navegador) ===
  function addToCart(item, qty) {
    setCart(prev => {
      const ex = prev.find(c => c.key === item.key);
      return ex
        ? prev.map(c => c.key === item.key ? { ...c, qty: c.qty + qty } : c)
        : [...prev, { ...item, qty }];
    });
  }

  function changeQty(key, delta) {
    setCart(prev => prev.map(c => c.key === key ? { ...c, qty: c.qty + delta } : c).filter(c => c.qty > 0));
  }

  function removeFromCart(key) {
    setCart(prev => prev.filter(c => c.key !== key));
  }

  function clearCart() {
    setCart([]);
  }

  return (
    <AppContext.Provider value={{
      products, setProducts, refreshProducts,
      orders, setOrders, loadOrders, addOrder, updateOrderStatus,
      config, setConfig, refreshConfig,
      loading, loadError, user, signIn, signOut, loadData, localMode,
      cart, addToCart, changeQty, removeFromCart, clearCart,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
