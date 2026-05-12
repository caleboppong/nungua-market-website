// React hooks used for state, side effects, refs, and filtered lists.
import React, { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "./supabaseClient";
import {
  ShoppingCart, MapPin, Phone, Clock, Plus, Trash2, Pencil,
  LogOut, PackageCheck, UserPlus, BarChart3, Upload, Store,
  Utensils, ArrowLeft, Bike, Heart, MessageCircle, Moon, Sun,
  Music2, VolumeX
} from "lucide-react";

const shopCategories = ["All", "Fresh Produce", "Meat & Seafood", "Groceries", "Grains & Flour", "Cooking Ingredients", "Oils & Sauces", "Vegetables", "Seasonings", "Spices", "Drinks", "Snacks", "Frozen Food", "Personal Care"];
const foodCategories = ["All", "Main Meals", "Rice Dishes", "Soups", "Grills", "Sides", "Drinks", "Desserts"];

const slideshowImages = ["/Shop1.jpeg", "/Shop2.jpeg", "/Shop3.jpeg", "/Shop4.jpeg", "/Shop5.jpeg", "/Shop6.jpeg"];
const restaurantSlides = ["/Restaurant1.jpeg", "/Restaurant2.jpeg", "/Restaurant3.jpeg"];

const blankProduct = { name: "", category: "Fresh Produce", price: "", image_url: "", stock: "", description: "", available: true };
const blankFood = { name: "", category: "Main Meals", price: "", image_url: "", stock: "", description: "", available: true };

const shopOpeningHours = [
  ["Monday", "9am–9pm"], ["Tuesday", "9am–9pm"], ["Wednesday", "9am–9pm"],
  ["Thursday", "9am–9pm"], ["Friday", "9am–9pm"], ["Saturday", "9am–9pm"], ["Sunday", "10am–9pm"]
];

const restaurantOpeningHours = [
  ["Monday", "10:30am–11pm"], ["Tuesday", "10:30am–11pm"], ["Wednesday", "10:30am–11pm"],
  ["Thursday", "10:30am–11pm"], ["Friday", "10:30am–11pm"], ["Saturday", "10:30am–11pm"], ["Sunday", "10:30am–11pm"]
];


const businessInfo = {
  shop: {
    name: "",
    label: "",
    phone: "020 7000 4115",
    email: "shop@nunguamarket.com",
    image: "/Shop1.jpeg",
    openingHours: shopOpeningHours,
    description: "Contact the grocery shop for African groceries, bulk orders, and collection enquiries.",
    branches: [
      { name: "Walthamstow Branch", address: "32 High St, London E17 7LD", mapQuery: "32 High St, London E17 7LD" },
      { name: "Plaistow Branch", address: "133 Balaam Street, London E13 8AF", mapQuery: "133 Balaam Street, London E13 8AF" }
    ]
  },
  restaurant: {
    name: "",
    label: "",
    address: "75 Old Church Road, Chingford Mount, London E4 6ST",
    phone: "020 3152 4136",
    email: "restaurant@nunguamarket.com",
    mapQuery: "75 Old Church Road, Chingford Mount, London E4 6ST",
    image: "/Restaurant1.jpeg",
    openingHours: restaurantOpeningHours,
    description: "Contact the restaurant for food orders, reservations, takeaway, and delivery support."
  }
};

const homeCategories = [
  { title: "Fresh Produce", note: "Plantain, yam, peppers", emoji: "🍌" },
  { title: "Grains & Flour", note: "Gari, fufu flour, rice", emoji: "🌾" },
  { title: "Cooking Ingredients", note: "Jollof mix, spices, tins", emoji: "🥘" },
  { title: "Oils & Sauces", note: "Palm oil, sauces, seasoning", emoji: "🛢️" }
];

const allowedDeliveryZones = {
  E17: 2.99,
  E10: 3.99,
  E11: 4.99,
  N15: 5.99,
  N16: 5.99,
  N17: 5.99
};

function normalisePostcode(value = "") {
  return value.trim().toUpperCase().replace(/\s+/g, " ");
}

function postcodePrefix(value = "") {
  const cleaned = normalisePostcode(value).replace(/\s/g, "");
  const match = cleaned.match(/^[A-Z]{1,2}\d{1,2}/);
  return match ? match[0] : "";
}

function getDeliveryInfo(postcode) {
  const prefix = postcodePrefix(postcode);
  if (!prefix) return { allowed: false, fee: 0, message: "Enter a valid postcode." };

  const direct = allowedDeliveryZones[prefix];
  if (direct !== undefined) {
    return { allowed: true, fee: direct, message: `Delivery available to ${prefix}. Fee £${direct.toFixed(2)}.` };
  }

  const broad = Object.entries(allowedDeliveryZones).find(([zone]) => prefix.startsWith(zone));
  if (broad) {
    return { allowed: true, fee: broad[1], message: `Delivery available to ${prefix}. Fee £${broad[1].toFixed(2)}.` };
  }

  return { allowed: false, fee: 0, message: "Sorry, delivery is not currently available to this postcode. Please choose collection." };
}

function ProductForm({ value, setValue, onSubmit, submitText, files, setFiles, categories }) {
  return (
    <form onSubmit={onSubmit} className="admin-grid">
      <input className="input" placeholder="Name" value={value.name || ""} onChange={(e) => setValue({ ...value, name: e.target.value })} />

      <select className="select" value={value.category || categories[1]} onChange={(e) => setValue({ ...value, category: e.target.value })}>
        {categories.filter((c) => c !== "All").map((c) => <option key={c}>{c}</option>)}
      </select>

      <input className="input" type="number" step="0.01" placeholder="Price" value={value.price || ""} onChange={(e) => setValue({ ...value, price: e.target.value })} />
      <input className="input" type="number" placeholder="Stock quantity" value={value.stock || ""} onChange={(e) => setValue({ ...value, stock: e.target.value })} />
      <input className="input wide" placeholder="Optional image URL" value={value.image_url || ""} onChange={(e) => setValue({ ...value, image_url: e.target.value })} />
      <textarea className="input wide" placeholder="Description" value={value.description || ""} onChange={(e) => setValue({ ...value, description: e.target.value })} />

      <label>
        <input type="checkbox" checked={Boolean(value.available)} onChange={(e) => setValue({ ...value, available: e.target.checked })} /> Available
      </label>

      <div className="upload-box wide">
        <b><Upload size={16} /> Upload images</b>
        <p className="muted small">Choose one or more images from your computer or phone.</p>
        <input className="input" type="file" accept="image/*" multiple onChange={(e) => setFiles(Array.from(e.target.files || []))} />
        <div className="preview-list">
          {files.map((file, idx) => <p key={idx} className="muted small">{file.name}</p>)}
        </div>
      </div>

      <button className="btn btn-dark" type="submit">{submitText}</button>
    </form>
  );
}

function QuantityControls({ item, onChange }) {
  return (
    <div className="qty">
      <button type="button" onClick={() => onChange(item.id, -1)}>-</button>
      <b>{item.quantity}</b>
      <button type="button" onClick={() => onChange(item.id, 1)}>+</button>
    </div>
  );
}

export default function App() {
  const audioRef = useRef(null);

  const [department, setDepartment] = useState(null);
  const [shopTab, setShopTab] = useState("shop");
  const [restaurantTab, setRestaurantTab] = useState("menu");

  const [products, setProducts] = useState([]);
  const [productImages, setProductImages] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState([]);

  const [foods, setFoods] = useState([]);
  const [foodImages, setFoodImages] = useState([]);
  const [restaurantOrders, setRestaurantOrders] = useState([]);
  const [restaurantCart, setRestaurantCart] = useState([]);

  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [adminUsers, setAdminUsers] = useState([]);

  const [category, setCategory] = useState("All");
  const [foodCategory, setFoodCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [foodSearch, setFoodSearch] = useState("");

  const [login, setLogin] = useState({ email: "", password: "" });
  const [signup, setSignup] = useState({ email: "", password: "" });

  const [newProduct, setNewProduct] = useState(blankProduct);
  const [editing, setEditing] = useState(null);
  const [editProduct, setEditProduct] = useState({});
  const [newFiles, setNewFiles] = useState([]);
  const [editFiles, setEditFiles] = useState([]);

  const [newFood, setNewFood] = useState(blankFood);
  const [editingFood, setEditingFood] = useState(null);
  const [editFood, setEditFood] = useState({});
  const [newFoodFiles, setNewFoodFiles] = useState([]);
  const [editFoodFiles, setEditFoodFiles] = useState([]);

  const [customer, setCustomer] = useState({ name: "", phone: "", email: "", address: "", postcode: "", fulfilment_method: "collection" });
  const [restaurantCustomer, setRestaurantCustomer] = useState({ name: "", phone: "", email: "", address: "", postcode: "", fulfilment_method: "collection" });

  const [message, setMessage] = useState("");
  const [contact, setContact] = useState({ name: "", email: "", phone: "", message: "" });
  const [contactMessages, setContactMessages] = useState([]);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentRestaurantSlide, setCurrentRestaurantSlide] = useState(0);

  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [musicOn, setMusicOn] = useState(false);
  const [favourites, setFavourites] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
  }, [darkMode]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideshowImages.length);
      setCurrentRestaurantSlide((prev) => (prev + 1) % restaurantSlides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    loadProducts();
    loadProductImages();
    loadFoods();
    loadFoodImages();

    supabase.auth.getSession().then(({ data }) => setSession(data.session));

    const { data: listener } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      loadOrders();
      loadRestaurantOrders();
      loadContactMessages();

      if (session.user?.email) {
        setCustomer((c) => ({ ...c, email: session.user.email }));
        setRestaurantCustomer((c) => ({ ...c, email: session.user.email }));
      }
    }
  }, [session]);

  useEffect(() => {
    async function checkAdmin() {
      if (!session?.user?.email) {
        setIsAdmin(false);
        setIsSuperAdmin(false);
        return;
      }

      const email = session.user.email.toLowerCase().trim();

      const { data, error } = await supabase
        .from("admin_users")
        .select("role")
        .eq("email", email)
        .maybeSingle();

      console.log("ADMIN CHECK:", data, error);

      if (data) {
        setIsAdmin(true);
        setIsSuperAdmin(data.role === "super_admin");
      } else {
        setIsAdmin(false);
        setIsSuperAdmin(false);
      }
    }

    checkAdmin();
  }, [session]);

  useEffect(() => {
    if (isSuperAdmin) {
      loadAdminUsers();
    }
  }, [isSuperAdmin]);

  async function loadProducts() {
    const { data, error } = await supabase.from("products").select("*").order("name");
    if (error) setMessage(error.message);
    else setProducts(data || []);
  }

  async function loadProductImages() {
    const { data, error } = await supabase.from("product_images").select("*").order("created_at");
    if (error) setMessage(error.message);
    else setProductImages(data || []);
  }

  async function loadOrders() {
    const { data, error } = await supabase.from("orders").select("*, order_items(*, products(name))").order("created_at", { ascending: false });
    if (error) setMessage(error.message);
    else setOrders(data || []);
  }

  async function loadFoods() {
    const { data, error } = await supabase.from("restaurant_foods").select("*").order("name");
    if (error) {
      if (!String(error.message).includes("restaurant_foods")) setMessage(error.message);
    } else {
      setFoods(data || []);
    }
  }

  async function loadFoodImages() {
    const { data, error } = await supabase.from("restaurant_food_images").select("*").order("created_at");
    if (error) {
      if (!String(error.message).includes("restaurant_food_images")) setMessage(error.message);
    } else {
      setFoodImages(data || []);
    }
  }

  async function loadRestaurantOrders() {
    const { data, error } = await supabase.from("restaurant_orders").select("*, restaurant_order_items(*, restaurant_foods(name))").order("created_at", { ascending: false });
    if (error) {
      if (!String(error.message).includes("restaurant_orders")) setMessage(error.message);
    } else {
      setRestaurantOrders(data || []);
    }
  }

  async function loadContactMessages() {
    const { data, error } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false });
    if (error) setMessage(error.message);
    else setContactMessages(data || []);
  }

  async function loadAdminUsers() {
    const { data, error } = await supabase
      .from("admin_users")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(error.message);
    } else {
      setAdminUsers(data || []);
    }
  }

  async function sendContactMessage(e) {
    e.preventDefault();

    if (!contact.name || !contact.message) {
      return setMessage("Please enter your name and message.");
    }

    const { error } = await supabase.from("contact_messages").insert(contact);
    if (error) return setMessage(error.message);

    setContact({ name: "", email: "", phone: "", message: "" });
    setMessage("Thank you. Your message has been sent.");

    if (session) loadContactMessages();
  }

  async function signIn(e) {
    e.preventDefault();

    const { error } = await supabase.auth.signInWithPassword({
      email: login.email.trim().toLowerCase(),
      password: login.password
    });

    if (error) setMessage(error.message);
    else setLogin({ email: "", password: "" });
  }

  async function signUp(e) {
    e.preventDefault();

    const { error } = await supabase.auth.signUp({
      email: signup.email.trim().toLowerCase(),
      password: signup.password
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Customer account created. You can now log in.");
      setSignup({ email: "", password: "" });
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    setShopTab("shop");
    setRestaurantTab("menu");
    setIsAdmin(false);
    setIsSuperAdmin(false);
  }

  async function addAdminUser(e) {
    e.preventDefault();

    if (!newAdminEmail) {
      return setMessage("Please enter an admin email.");
    }

    const { error } = await supabase
      .from("admin_users")
      .insert({
        email: newAdminEmail.toLowerCase().trim(),
        role: "admin"
      });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Admin added successfully.");
      setNewAdminEmail("");
      loadAdminUsers();
    }
  }

  async function deleteAdminUser(id, email) {
    if (!confirm(`Remove admin access for ${email}?`)) return;

    const { error } = await supabase
      .from("admin_users")
      .delete()
      .eq("id", id);

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Admin removed successfully.");
      loadAdminUsers();
    }
  }

  function imagesFor(productId) {
    return productImages.filter((img) => img.product_id === productId);
  }

  function foodImagesFor(foodId) {
    return foodImages.filter((img) => img.food_id === foodId);
  }

  function mainImage(product) {
    const extra = imagesFor(product.id)[0];
    return extra?.image_url || product.image_url || "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=900&auto=format&fit=crop";
  }

  function mainFoodImage(food) {
    const extra = foodImagesFor(food.id)[0];
    return extra?.image_url || food.image_url || "/NunguaMarketRestaurantLogo.jpeg";
  }

  const visibleProducts = useMemo(() => products.filter((p) => {
    const cat = category === "All" || p.category === category;
    const text = (p.name + " " + (p.description || "")).toLowerCase().includes(search.toLowerCase());
    return cat && text;
  }), [products, category, search]);

  const visibleFoods = useMemo(() => foods.filter((f) => {
    const cat = foodCategory === "All" || f.category === foodCategory;
    const text = (f.name + " " + (f.description || "")).toLowerCase().includes(foodSearch.toLowerCase());
    return cat && text;
  }), [foods, foodCategory, foodSearch]);

  const total = cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);

  const restaurantSubtotal = restaurantCart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  const restaurantCount = restaurantCart.reduce((sum, item) => sum + item.quantity, 0);
  const deliveryInfo = getDeliveryInfo(restaurantCustomer.postcode);
  const restaurantDeliveryFee = restaurantCustomer.fulfilment_method === "delivery" && deliveryInfo.allowed ? deliveryInfo.fee : 0;
  const restaurantTotal = restaurantSubtotal + restaurantDeliveryFee;

  const totalRevenue =
    orders.reduce((s, o) => s + Number(o.total_price || 0), 0) +
    restaurantOrders.reduce((s, o) => s + Number(o.total_price || 0), 0);

  const lowStock =
    products.filter((p) => Number(p.stock) <= 5).length +
    foods.filter((f) => Number(f.stock) <= 5).length;

  function isFavourite(id) {
    return favourites.some((item) => item.id === id);
  }

  function toggleFavourite(item, imageUrl, type = "shop") {
    const favouriteItem = {
      id: item.id,
      name: item.name,
      price: item.price,
      image_url: imageUrl,
      type
    };

    setFavourites((items) => {
      const exists = items.find((x) => x.id === item.id && x.type === type);
      if (exists) return items.filter((x) => !(x.id === item.id && x.type === type));
      return [...items, favouriteItem];
    });
  }

  function toggleMusic() {
    if (!audioRef.current) {
      setMessage("Music player was not found.");
      return;
    }

    audioRef.current.volume = 1;

    if (musicOn) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setMusicOn(false);
      setMessage("Music stopped.");
      return;
    }

    audioRef.current.play()
      .then(() => {
        setMusicOn(true);
        setMessage("Music is playing.");
      })
      .catch((error) => {
        console.log(error);
        setMessage("Music failed to play.");
      });
  }

  function addToCart(product) {
    if (!product.available || product.stock < 1) return;

    setCart((items) => {
      const found = items.find((i) => i.id === product.id);
      if (found) return items.map((i) => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...items, { ...product, quantity: 1, image_url: mainImage(product) }];
    });
  }

  function addFoodToCart(food) {
    if (!food.available || food.stock < 1) return;

    setRestaurantCart((items) => {
      const found = items.find((i) => i.id === food.id);
      if (found) return items.map((i) => i.id === food.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...items, { ...food, quantity: 1, image_url: mainFoodImage(food) }];
    });
  }

  function changeQty(id, amount) {
    setCart((items) =>
      items
        .map((i) => i.id === id ? { ...i, quantity: Math.max(0, i.quantity + amount) } : i)
        .filter((i) => i.quantity > 0)
    );
  }

  function changeFoodQty(id, amount) {
    setRestaurantCart((items) =>
      items
        .map((i) => i.id === id ? { ...i, quantity: Math.max(0, i.quantity + amount) } : i)
        .filter((i) => i.quantity > 0)
    );
  }

  async function uploadFiles(files, itemId, bucket = "product-images", table = "product_images", key = "product_id") {
    const uploadedUrls = [];

    for (const file of files) {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      const filePath = `${itemId}/${Date.now()}-${safeName}`;

      const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file, { upsert: false });

      if (uploadError) {
        setMessage(uploadError.message);
        continue;
      }

      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
      uploadedUrls.push(data.publicUrl);

      await supabase.from(table).insert({
        [key]: itemId,
        image_url: data.publicUrl
      });
    }

    return uploadedUrls;
  }

  async function uploadProductFiles(files, productId) {
    const uploadedUrls = await uploadFiles(files, productId, "product-images", "product_images", "product_id");
    if (uploadedUrls.length > 0) await supabase.from("products").update({ image_url: uploadedUrls[0] }).eq("id", productId);
    await loadProducts();
    await loadProductImages();
  }

  async function uploadFoodFiles(files, foodId) {
    const uploadedUrls = await uploadFiles(files, foodId, "food-images", "restaurant_food_images", "food_id");
    if (uploadedUrls.length > 0) await supabase.from("restaurant_foods").update({ image_url: uploadedUrls[0] }).eq("id", foodId);
    await loadFoods();
    await loadFoodImages();
  }

  function sendOrderToWhatsApp() {
    if (!customer.name || !customer.phone || cart.length === 0) {
      return setMessage("Please enter customer name, phone number, and add products.");
    }

    const shopWhatsAppNumber = "447920794448";

    const itemsText = cart
      .map((item) => `${item.name} x ${item.quantity} = £${(Number(item.price) * item.quantity).toFixed(2)}`)
      .join("\n");

    const text = `New grocery order from Nungua Market website

Customer: ${customer.name}
Phone: ${customer.phone}
Email: ${customer.email || "None"}
Address/Note: ${customer.address || "None"}

Items:
${itemsText}

Total: £${total.toFixed(2)}`;

    window.open(`https://wa.me/${shopWhatsAppNumber}?text=${encodeURIComponent(text)}`, "_blank");
  }

  async function placeOrder() {
    if (!customer.name || !customer.phone || cart.length === 0) {
      return setMessage("Please enter customer name, phone number, and add products.");
    }

    const { data: order, error } = await supabase.from("orders").insert({
      user_id: session?.user?.id || null,
      customer_name: customer.name,
      customer_phone: customer.phone,
      customer_email: customer.email || session?.user?.email || "",
      customer_address: customer.address,
      total_price: total,
      status: "new",
      payment_status: "pay_on_collection"
    }).select().single();

    if (error) return setMessage(error.message);

    const items = cart.map((item) => ({
      order_id: order.id,
      product_id: item.id,
      quantity: item.quantity,
      price: item.price
    }));

    const { error: itemError } = await supabase.from("order_items").insert(items);
    if (itemError) return setMessage(itemError.message);

    sendOrderToWhatsApp();

    setCart([]);
    setCustomer({ name: "", phone: "", email: session?.user?.email || "", address: "", postcode: "", fulfilment_method: "collection" });

    setMessage("Grocery order received and WhatsApp order message opened.");
    if (session) loadOrders();
  }

  async function payWithStripe() {
    if (cart.length === 0) return setMessage("Please add products to the basket first.");

    if (!customer.name || !customer.phone || !customer.email) {
      return setMessage("Please enter name, phone, and email before card payment.");
    }

    try {
      const response = await fetch("https://quvjpenvmdkgaesqzslv.supabase.co/functions/v1/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cart, customer })
      });

      const data = await response.json();

      if (!response.ok) return setMessage(data.error || "Stripe function failed.");

      if (data.url) window.location.href = data.url;
      else setMessage("Stripe did not return a checkout URL.");
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function placeRestaurantOrder() {
    if (!restaurantCustomer.name || !restaurantCustomer.phone || restaurantCart.length === 0) {
      return setMessage("Please enter customer name, phone number, and add food.");
    }

    if (restaurantCustomer.fulfilment_method === "delivery" && !deliveryInfo.allowed) {
      return setMessage(deliveryInfo.message);
    }

    const currentCustomer = { ...restaurantCustomer };
    const currentCart = [...restaurantCart];

    const { data: order, error } = await supabase.from("restaurant_orders").insert({
      user_id: session?.user?.id || null,
      customer_name: currentCustomer.name,
      customer_phone: currentCustomer.phone,
      customer_email: currentCustomer.email || session?.user?.email || "",
      customer_address: currentCustomer.address,
      customer_postcode: normalisePostcode(currentCustomer.postcode),
      fulfilment_method: currentCustomer.fulfilment_method,
      subtotal_price: restaurantSubtotal,
      delivery_fee: restaurantDeliveryFee,
      total_price: restaurantTotal,
      status: "new",
      payment_status: "awaiting_restaurant_payment_setup",
      admin_note: "Restaurant order submitted. Separate Stripe payment will be connected later if needed."
    }).select().single();

    if (error) return setMessage(error.message);

    const items = currentCart.map((item) => ({
      order_id: order.id,
      food_id: item.id,
      quantity: item.quantity,
      price: item.price
    }));

    const { error: itemError } = await supabase.from("restaurant_order_items").insert(items);
    if (itemError) return setMessage(itemError.message);

    const restaurantWhatsApp = "447920794448";

    const itemsText = currentCart
      .map((item) => `${item.name} x ${item.quantity} = £${(Number(item.price) * item.quantity).toFixed(2)}`)
      .join("\n");

    const orderMessage = `🍽️ NEW RESTAURANT ORDER

Customer: ${currentCustomer.name}
Phone: ${currentCustomer.phone}
Email: ${currentCustomer.email || "None"}

Method: ${currentCustomer.fulfilment_method}
Address/Note: ${currentCustomer.address || "None"}
Postcode: ${currentCustomer.postcode || "None"}

Items:
${itemsText}

Subtotal: £${restaurantSubtotal.toFixed(2)}
Delivery: £${restaurantDeliveryFee.toFixed(2)}
Total: £${restaurantTotal.toFixed(2)}
`;

    window.open(`https://wa.me/${restaurantWhatsApp}?text=${encodeURIComponent(orderMessage)}`, "_blank");

    await fetch("https://quvjpenvmdkgaesqzslv.supabase.co/functions/v1/send-order-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer_name: currentCustomer.name,
        customer_phone: currentCustomer.phone,
        customer_email: currentCustomer.email,
        total_price: restaurantTotal,
        items: currentCart
      })
    });

    setRestaurantCart([]);
    setRestaurantCustomer({ name: "", phone: "", email: session?.user?.email || "", address: "", postcode: "", fulfilment_method: "collection" });

    setMessage("Restaurant order received. Admin can confirm it in the Restaurant Orders tab.");
    if (session) loadRestaurantOrders();
  }

  async function payRestaurantByCard() {
    if (restaurantCart.length === 0) {
      return setMessage("Please add food to the basket first.");
    }

    if (!restaurantCustomer.name || !restaurantCustomer.phone || !restaurantCustomer.email) {
      return setMessage("Please enter name, phone number, and email before card payment.");
    }

    if (restaurantCustomer.fulfilment_method === "delivery" && !deliveryInfo.allowed) {
      return setMessage(deliveryInfo.message);
    }

    const stripeItems = [
      ...restaurantCart,
      ...(restaurantDeliveryFee > 0
        ? [{ id: "restaurant-delivery-fee", name: "Delivery Fee", price: restaurantDeliveryFee, quantity: 1, image_url: "/logo.png" }]
        : [])
    ];

    try {
      const response = await fetch("https://quvjpenvmdkgaesqzslv.supabase.co/functions/v1/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: stripeItems,
          customer: {
            ...restaurantCustomer,
            department: "restaurant",
            subtotal: restaurantSubtotal,
            delivery_fee: restaurantDeliveryFee,
            total: restaurantTotal
          }
        })
      });

      const data = await response.json();

      if (!response.ok) return setMessage(data.error || "Restaurant Stripe checkout failed.");

      if (data.url) window.location.href = data.url;
      else setMessage("Stripe did not return a checkout URL.");
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function addProduct(e) {
    e.preventDefault();

    if (!newProduct.name || !newProduct.price) {
      return setMessage("Product name and price are required.");
    }

    const payload = {
      ...newProduct,
      price: Number(newProduct.price),
      stock: Number(newProduct.stock || 0),
      available: Boolean(newProduct.available) && Number(newProduct.stock || 0) > 0
    };

    const { data, error } = await supabase.from("products").insert(payload).select().single();
    if (error) return setMessage(error.message);

    if (newFiles.length > 0) await uploadProductFiles(newFiles, data.id);

    setNewFiles([]);
    setNewProduct(blankProduct);
    setMessage("Product added successfully.");
    loadProducts();
  }

  async function addFood(e) {
    e.preventDefault();

    if (!newFood.name || !newFood.price) {
      return setMessage("Food name and price are required.");
    }

    const payload = {
      ...newFood,
      price: Number(newFood.price),
      stock: Number(newFood.stock || 0),
      available: Boolean(newFood.available) && Number(newFood.stock || 0) > 0
    };

    const { data, error } = await supabase.from("restaurant_foods").insert(payload).select().single();
    if (error) return setMessage(error.message);

    if (newFoodFiles.length > 0) await uploadFoodFiles(newFoodFiles, data.id);

    setNewFoodFiles([]);
    setNewFood(blankFood);
    setMessage("Food added successfully.");
    loadFoods();
  }

  function startEdit(product) {
    setEditing(product.id);
    setEditProduct({ ...product });
    setEditFiles([]);
  }

  function startFoodEdit(food) {
    setEditingFood(food.id);
    setEditFood({ ...food });
    setEditFoodFiles([]);
  }

  async function saveEdit(e) {
    e.preventDefault();

    const payload = {
      name: editProduct.name,
      category: editProduct.category,
      price: Number(editProduct.price),
      image_url: editProduct.image_url,
      stock: Number(editProduct.stock),
      description: editProduct.description,
      available: Boolean(editProduct.available) && Number(editProduct.stock) > 0
    };

    const { error } = await supabase.from("products").update(payload).eq("id", editProduct.id);
    if (error) return setMessage(error.message);

    if (editFiles.length > 0) await uploadProductFiles(editFiles, editProduct.id);

    setEditing(null);
    setEditFiles([]);
    setMessage("Product updated.");
    loadProducts();
  }

  async function saveFoodEdit(e) {
    e.preventDefault();

    const payload = {
      name: editFood.name,
      category: editFood.category,
      price: Number(editFood.price),
      image_url: editFood.image_url,
      stock: Number(editFood.stock),
      description: editFood.description,
      available: Boolean(editFood.available) && Number(editFood.stock) > 0
    };

    const { error } = await supabase.from("restaurant_foods").update(payload).eq("id", editFood.id);
    if (error) return setMessage(error.message);

    if (editFoodFiles.length > 0) await uploadFoodFiles(editFoodFiles, editFood.id);

    setEditingFood(null);
    setEditFoodFiles([]);
    setMessage("Food updated.");
    loadFoods();
  }

  async function deleteProduct(id) {
    if (!confirm("Delete this product?")) return;

    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) setMessage(error.message);
    else {
      setMessage("Product deleted.");
      loadProducts();
      loadProductImages();
    }
  }

  async function deleteFood(id) {
    if (!confirm("Delete this food item?")) return;

    const { error } = await supabase.from("restaurant_foods").delete().eq("id", id);

    if (error) setMessage(error.message);
    else {
      setMessage("Food deleted.");
      loadFoods();
      loadFoodImages();
    }
  }

  async function updateOrderStatus(id, status) {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) setMessage(error.message);
    else loadOrders();
  }

  async function updateRestaurantOrderStatus(id, status) {
    const { error } = await supabase.from("restaurant_orders").update({ status }).eq("id", id);
    if (error) setMessage(error.message);
    else loadRestaurantOrders();
  }

  function FloatingControls() {
    return (
      <>
        <a className="whatsapp-float glowing-action" href="https://wa.me/447920794448" target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp">
          <MessageCircle size={24} />
        </a>

        <button className="dark-toggle glowing-action" onClick={() => setDarkMode((value) => !value)} aria-label="Toggle dark mode">
          {darkMode ? <Sun size={22} /> : <Moon size={22} />}
        </button>
      </>
    );
  }

  function LandingPage() {
    return (
      <div>
        
        <header className="department-hero video-hero">
          <video autoPlay muted loop playsInline className="background-video">
            <source src="/home-video.mp4" type="video/mp4" />
          </video>

          <div className="video-overlay"></div>

          <button type="button" className="music-btn glowing-action" onClick={toggleMusic}>
            {musicOn ? <VolumeX size={18} /> : <Music2 size={18} />}
            {musicOn ? "Music Off" : "Music On"}
          </button>

          <button type="button" className="dark-home-btn glowing-action" onClick={() => setDarkMode((value) => !value)}>
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            {darkMode ? "Light" : "Dark"}
          </button>

          <div className="department-overlay animated-hero-text">
            <div className="wrap">
              {/*<img src="/logo.png" alt="Nungua Market Logo" className="home-logo logo-pulse" />*/}

              <h1>Choose Your Department</h1>
              <p className="department-subtitle">
                African groceries and fresh restaurant meals from one trusted local business.
              </p>

              <div className="department-grid">
                <button type="button" className="department-card glowing-card" onClick={() => { setDepartment("shop"); setShopTab("shop"); }}>
                  <Store size={48} />
                  <h2>Grocery Shop</h2>
                  <p>Shop African groceries, fresh produce, pantry goods, and household essentials.</p>
                  <span>Enter Shop →</span>
                </button>

                <button type="button" className="department-card restaurant glowing-card" onClick={() => { setDepartment("restaurant"); setRestaurantTab("menu"); }}>
                  <Utensils size={48} />
                  <h2>Restaurant</h2>
                  <p>Order cooked meals for collection or delivery with postcode checking.</p>
                  <span>Authentic Ghanaian cuisine →</span>
                </button>
              </div>
            </div>
          </div>
        </header>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <img src="/logo.png" alt="Nungua Market Logo" />
        <h2>Loading Nungua Market...</h2>
      </div>
    );
  }

  if (!department) {
    return (
      <>
        <audio ref={audioRef} src="/background-music.mp3" loop preload="auto" />
        <LandingPage />
        <FloatingControls />
      </>
    );
  }

  function Header({ type }) {
    const isShop = type === "shop";
    const info = isShop ? businessInfo.shop : businessInfo.restaurant;

    return (
      <header className={isShop ? "header shop-header" : "header restaurant-header"}>
        <div className="wrap top animated-hero-text">
          <div>
            <button type="button" className="btn btn-light" onClick={() => setDepartment(null)}>
              <ArrowLeft size={15} /> Departments
            </button>

            {info.label && <div className="gold">{info.label}</div>}
            {info.name && <h1>{info.name}</h1>}

            <div className="meta">
              {isShop ? (
                <>
                  {info.branches.map((branch) => (
                    <span key={branch.name}>
                      <MapPin size={15} /> {branch.name}: {branch.address}
                    </span>
                  ))}
                </>
              ) : (
                <span><MapPin size={15} /> {info.address}</span>
              )}

              <span><Phone size={15} /> {info.phone}</span>
              <span><Clock size={15} /> {isShop ? "9am–9pm, Sunday 10am–9pm" : "10:30am–11pm, Friday/Saturday 10:30am–11pm"}</span>
            </div>

            {isShop ? (
              <div className="nav">
                <button type="button" className={"btn " + (shopTab === "shop" ? "btn-gold" : "btn-light")} onClick={() => setShopTab("shop")}>Shop</button>
                <button type="button" className={"btn " + (shopTab === "contact" ? "btn-gold" : "btn-light")} onClick={() => setShopTab("contact")}>Contact</button>
                <button type="button" className={"btn " + (shopTab === "favourites" ? "btn-gold" : "btn-light")} onClick={() => setShopTab("favourites")}>Wishlist</button>
                {isAdmin && <button type="button" className={"btn " + (shopTab === "admin" ? "btn-gold" : "btn-light")} onClick={() => setShopTab("admin")}>Admin Products</button>}
                {isAdmin && <button type="button" className={"btn " + (shopTab === "orders" ? "btn-gold" : "btn-light")} onClick={() => setShopTab("orders")}>Orders</button>}
                {isAdmin && <button type="button" className={"btn " + (shopTab === "messages" ? "btn-gold" : "btn-light")} onClick={() => setShopTab("messages")}>Messages</button>}
                {isAdmin && <button type="button" className={"btn " + (shopTab === "analytics" ? "btn-gold" : "btn-light")} onClick={() => setShopTab("analytics")}>Analytics</button>}
                {isSuperAdmin && (
                  <button
                    type="button"
                    className={"btn " + (shopTab === "admin-users" ? "btn-gold" : "btn-light")}
                    onClick={() => setShopTab("admin-users")}
                  >
                    Admin Users
                  </button>
                )}
              </div>
            ) : (
              <div className="nav">
                <button type="button" className={"btn " + (restaurantTab === "menu" ? "btn-gold" : "btn-light")} onClick={() => setRestaurantTab("menu")}>Menu</button>
                <button type="button" className={"btn " + (restaurantTab === "delivery" ? "btn-gold" : "btn-light")} onClick={() => setRestaurantTab("delivery")}>Delivery Info</button>
                <button type="button" className={"btn " + (restaurantTab === "contact" ? "btn-gold" : "btn-light")} onClick={() => setRestaurantTab("contact")}>Contact</button>
                <button type="button" className={"btn " + (restaurantTab === "favourites" ? "btn-gold" : "btn-light")} onClick={() => setRestaurantTab("favourites")}>Wishlist</button>
                {isAdmin && <button type="button" className={"btn " + (restaurantTab === "food-admin" ? "btn-gold" : "btn-light")} onClick={() => setRestaurantTab("food-admin")}>Food Admin</button>}
                {isAdmin && <button type="button" className={"btn " + (restaurantTab === "restaurant-orders" ? "btn-gold" : "btn-light")} onClick={() => setRestaurantTab("restaurant-orders")}>Restaurant Orders</button>}
                {isSuperAdmin && (
                  <button
                    type="button"
                    className={"btn " + (restaurantTab === "admin-users" ? "btn-gold" : "btn-light")}
                    onClick={() => setRestaurantTab("admin-users")}
                  >
                    Admin Users
                  </button>
                )}
              </div>
            )}
          </div>

          <div>
            <p><ShoppingCart size={18} /> {isShop ? count : restaurantCount} items</p>
            {session ? (
              <button type="button" className="btn btn-light" onClick={signOut}><LogOut size={15} /> Logout</button>
            ) : (
              <span className="muted">Customer/Admin login below</span>
            )}
          </div>
        </div>
      </header>
    );
  }

  function LoginPanels() {
    if (session) return null;

    return (
      <>
        <div className="panel" style={{ marginBottom: 18 }}>
          <h2>Login</h2>
          <form onSubmit={signIn}>
            <input className="input" placeholder="Email" value={login.email} onChange={(e) => setLogin({ ...login, email: e.target.value })} />
            <input className="input" type="password" placeholder="Password" value={login.password} onChange={(e) => setLogin({ ...login, password: e.target.value })} />
            <button className="btn btn-dark">Login</button>
          </form>
        </div>

        <div className="panel" style={{ marginBottom: 18 }}>
          <h2><UserPlus size={18} /> Customer Signup</h2>
          <form onSubmit={signUp}>
            <input className="input" placeholder="Email" value={signup.email} onChange={(e) => setSignup({ ...signup, email: e.target.value })} />
            <input className="input" type="password" placeholder="Password" value={signup.password} onChange={(e) => setSignup({ ...signup, password: e.target.value })} />
            <button className="btn btn-light">Create Account</button>
          </form>
        </div>
      </>
    );
  }

  function ShopBasket() {
    return (
      <div className="panel">
        <h2>Grocery Basket</h2>

        {cart.length === 0 ? (
          <p className="muted">Your basket is empty.</p>
        ) : (
          cart.map(item => (
            <div className="cart-item" key={item.id}>
              <img src={item.image_url} alt={item.name} />
              <div>
                <b>{item.name}</b>
                <p className="muted">£{Number(item.price).toFixed(2)}</p>
                <QuantityControls item={item} onChange={changeQty} />
              </div>
            </div>
          ))
        )}

        <h2>Total: £{total.toFixed(2)}</h2>

        <input className="input" placeholder="Customer name" value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} />
        <input className="input" placeholder="Phone number" value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} />
        <input className="input" placeholder="Email" value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} />
        <input className="input" placeholder="Delivery address / collection note" value={customer.address} onChange={(e) => setCustomer({ ...customer, address: e.target.value })} />

        <button className="btn btn-gold" onClick={placeOrder}>Place Order</button>{" "}
        <button className="btn btn-green" onClick={sendOrderToWhatsApp}>Send WhatsApp</button>{" "}
        <button className="btn btn-dark" onClick={payWithStripe}>Pay by Card</button>

        <p className="muted small">Grocery card payment uses the existing shop Stripe checkout.</p>
      </div>
    );
  }

  function RestaurantBasket() {
    return (
      <div className="panel">
        <h2>Restaurant Basket</h2>

        {restaurantCart.length === 0 ? (
          <p className="muted">Your food basket is empty.</p>
        ) : (
          restaurantCart.map(item => (
            <div className="cart-item" key={item.id}>
              <img src={item.image_url} alt={item.name} />
              <div>
                <b>{item.name}</b>
                <p className="muted">£{Number(item.price).toFixed(2)}</p>
                <QuantityControls item={item} onChange={changeFoodQty} />
              </div>
            </div>
          ))
        )}

        <h3>Food: £{restaurantSubtotal.toFixed(2)}</h3>

        <select className="input" value={restaurantCustomer.fulfilment_method} onChange={(e) => setRestaurantCustomer({ ...restaurantCustomer, fulfilment_method: e.target.value })}>
          <option value="collection">Collection from shop</option>
          <option value="delivery">Delivery</option>
        </select>

        {restaurantCustomer.fulfilment_method === "delivery" && (
          <>
            <input className="input" placeholder="Delivery postcode e.g. E17 7LD" value={restaurantCustomer.postcode} onChange={(e) => setRestaurantCustomer({ ...restaurantCustomer, postcode: e.target.value })} />
            <div className={"notice " + (deliveryInfo.allowed ? "delivery-ok" : "delivery-no")}>{deliveryInfo.message}</div>
            {deliveryInfo.allowed && <h3>Delivery: £{deliveryInfo.fee.toFixed(2)}</h3>}
          </>
        )}

        <h2>Total: £{restaurantTotal.toFixed(2)}</h2>

        <input className="input" placeholder="Customer name" value={restaurantCustomer.name} onChange={(e) => setRestaurantCustomer({ ...restaurantCustomer, name: e.target.value })} />
        <input className="input" placeholder="Phone number" value={restaurantCustomer.phone} onChange={(e) => setRestaurantCustomer({ ...restaurantCustomer, phone: e.target.value })} />
        <input className="input" placeholder="Email" value={restaurantCustomer.email} onChange={(e) => setRestaurantCustomer({ ...restaurantCustomer, email: e.target.value })} />
        <input className="input" placeholder="Address / collection note" value={restaurantCustomer.address} onChange={(e) => setRestaurantCustomer({ ...restaurantCustomer, address: e.target.value })} />

        <button className="btn btn-gold" onClick={placeRestaurantOrder}>Send Order to Restaurant Admin</button>{" "}
        <button className="btn btn-dark" onClick={payRestaurantByCard}>Pay by Card</button>

        <p className="muted small">Restaurant card payments are currently processed using the main shop payment system.</p>
      </div>
    );
  }

  function Hero({ restaurant = false }) {
    const slides = restaurant ? restaurantSlides : slideshowImages;
    const slide = restaurant ? currentRestaurantSlide : currentSlide;
    const videoSrc = restaurant ? "/restaurant-video.mp4" : "/shop-video.mp4";

    return (
      <div className="panel hero-video-panel">
        <video autoPlay muted loop playsInline className="hero-video">
          <source src={videoSrc} type="video/mp4" />
        </video>

        <div
          className="hero-video-fallback"
          style={{ backgroundImage: `linear-gradient(90deg, rgba(2,6,23,.78), rgba(2,6,23,.25)), url(${slides[slide]})` }}
        ></div>

        <div className="hero-video-content animated-hero-text">
          <div style={{ maxWidth: "640px" }}></div>
        </div>

        <div className="hero-dots">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => restaurant ? setCurrentRestaurantSlide(index) : setCurrentSlide(index)}
              aria-label={`Show slide ${index + 1}`}
              className={slide === index ? "dot active" : "dot"}
            />
          ))}
        </div>
      </div>
    );
  }

  function FavouritesPage() {
    return (
      <div className="panel">
        <h2><Heart size={20} /> Customer Wishlist</h2>
        {favourites.length === 0 ? (
          <p className="muted">No favourites yet. Tap the heart button on products or food to save them here.</p>
        ) : (
          <div className="grid">
            {favourites.map((item) => (
              <article className="card" key={`${item.type}-${item.id}`}>
                <img src={item.image_url} alt={item.name} />
                <div className="card-body">
                  <p className="muted small">{item.type === "restaurant" ? "Restaurant" : "Grocery Shop"}</p>
                  <h3>{item.name}</h3>
                  <div className="price">£{Number(item.price).toFixed(2)}</div>
                  <button className="btn btn-red" onClick={() => setFavourites((items) => items.filter((x) => !(x.id === item.id && x.type === item.type)))}>
                    Remove
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    );
  }

  function AdminUsersPage() {
    if (!isSuperAdmin) {
      return (
        <div className="panel">
          <h2>Admin Users</h2>
          <p className="muted">Only super admins can manage admins.</p>
        </div>
      );
    }

    return (
      <div className="panel">
        <h2>Admin Users</h2>

        <form onSubmit={addAdminUser} className="admin-grid">
          <input
            className="input"
            type="email"
            placeholder="New admin email"
            value={newAdminEmail}
            onChange={(e) => setNewAdminEmail(e.target.value)}
          />

          <button className="btn btn-dark" type="submit">
            Add Admin
          </button>
        </form>

        <button className="btn btn-light" type="button" onClick={loadAdminUsers}>
          Refresh Admin List
        </button>

        <h3>Current Admins</h3>

        {adminUsers.length === 0 ? (
          <p className="muted">No admins found.</p>
        ) : (
          adminUsers.map((admin) => (
            <div className="order-item" key={admin.id}>
              <div style={{ width: "100%" }}>
                <div className="row">
                  <div>
                    <b>{admin.email}</b>
                    <p className="muted small">{admin.role}</p>
                  </div>

                  {admin.email !== session?.user?.email && (
                    <button
                      type="button"
                      className="btn btn-red"
                      onClick={() => deleteAdminUser(admin.id, admin.email)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    );
  }

  function ShopPage() {
    return (
      <>
        {Header({ type: "shop" })}

        <main className="layout">
          <section>
            {message && <div className="notice">{message}</div>}

            {shopTab === "shop" && (
              <>
                {Hero({})}

                <div className="home-category-grid">
                  {homeCategories.map((item) => (
                    <button
                      key={item.title}
                      onClick={() => setCategory(item.title)}
                      className="panel category-shortcut"
                      style={{ border: category === item.title ? "2px solid #facc15" : "1px solid #e2e8f0" }}
                    >
                      <div style={{ fontSize: "32px" }}>{item.emoji}</div>
                      <h3 style={{ marginBottom: 4 }}>{item.title}</h3>
                      <p className="muted small">{item.note}</p>
                    </button>
                  ))}
                </div>

                <div className="panel" id="shop-products" style={{ marginTop: "18px" }}>
                  <h2>Shop African groceries online</h2>
                  <input className="search" placeholder="Search gari, plantain, fufu..." value={search} onChange={(e) => setSearch(e.target.value)} />

                  <div className="cats">
                    {shopCategories.map(c => (
                      <button key={c} className={"btn " + (category === c ? "btn-dark" : "btn-light")} onClick={() => setCategory(c)}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid">
                  {visibleProducts.map(product => (
                    <article className="card" key={product.id}>
                      <div className="image-wrap">
                        <img src={mainImage(product)} alt={product.name} />
                        <button className={isFavourite(product.id) ? "fav-btn saved" : "fav-btn"} onClick={() => toggleFavourite(product, mainImage(product), "shop")}>
                          <Heart size={18} fill={isFavourite(product.id) ? "currentColor" : "none"} />
                        </button>
                      </div>

                      <div className="thumbs">
                        {imagesFor(product.id).map(img => <img key={img.id} src={img.image_url} alt={product.name} />)}
                      </div>

                      <div className="card-body">
                        <div className="row">
                          <div>
                            <p className="muted small">{product.category}</p>
                            <h3>{product.name}</h3>
                          </div>
                          <span className={"badge " + (product.available ? "ok" : "no")}>
                            {product.available ? "Available" : "Out"}
                          </span>
                        </div>

                        <p className="muted">{product.description}</p>

                        <div className="row">
                          <div>
                            <div className="price">£{Number(product.price).toFixed(2)}</div>
                            <p className="muted small">Stock: {product.stock}</p>
                          </div>

                          <button className="btn btn-gold glowing-action" disabled={!product.available} onClick={() => addToCart(product)}>
                            Add
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}

            {shopTab === "contact" && ContactPage({ type: "shop" })}
            {shopTab === "favourites" && FavouritesPage()}
            {shopTab === "admin" && isAdmin && ShopAdmin()}
            {shopTab === "orders" && isAdmin && ShopOrders()}
            {shopTab === "messages" && isAdmin && Messages()}
            {shopTab === "analytics" && isAdmin && Analytics()}
            {shopTab === "admin-users" && isSuperAdmin && AdminUsersPage()}
          </section>

          <aside>
            {LoginPanels()}
            {ShopBasket()}
          </aside>
        </main>

        {Footer()}
        <FloatingControls />
      </>
    );
  }

  function RestaurantPage() {
    return (
      <>
        {Header({ type: "restaurant" })}

        <main className="layout">
          <section>
            {message && <div className="notice">{message}</div>}

            {restaurantTab === "menu" && (
              <>
                {Hero({ restaurant: true })}

                <div className="panel" style={{ marginTop: "18px" }}>
                  <h2>Restaurant Menu</h2>
                  <input className="search" placeholder="Search jollof, waakye, soup..." value={foodSearch} onChange={(e) => setFoodSearch(e.target.value)} />

                  <div className="cats">
                    {foodCategories.map(c => (
                      <button key={c} className={"btn " + (foodCategory === c ? "btn-dark" : "btn-light")} onClick={() => setFoodCategory(c)}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                {foods.length === 0 && (
                  <div className="notice">No restaurant food has been added yet. Login as admin and open Food Admin to add meals.</div>
                )}

                <div className="grid">
                  {visibleFoods.map(food => (
                    <article className="card" key={food.id}>
                      <div className="image-wrap">
                        <img src={mainFoodImage(food)} alt={food.name} />
                        <button className={isFavourite(food.id) ? "fav-btn saved" : "fav-btn"} onClick={() => toggleFavourite(food, mainFoodImage(food), "restaurant")}>
                          <Heart size={18} fill={isFavourite(food.id) ? "currentColor" : "none"} />
                        </button>
                      </div>

                      <div className="thumbs">
                        {foodImagesFor(food.id).map(img => <img key={img.id} src={img.image_url} alt={food.name} />)}
                      </div>

                      <div className="card-body">
                        <div className="row">
                          <div>
                            <p className="muted small">{food.category}</p>
                            <h3>{food.name}</h3>
                          </div>

                          <span className={"badge " + (food.available ? "ok" : "no")}>
                            {food.available ? "Available" : "Out"}
                          </span>
                        </div>

                        <p className="muted">{food.description}</p>

                        <div className="row">
                          <div>
                            <div className="price">£{Number(food.price).toFixed(2)}</div>
                            <p className="muted small">Stock: {food.stock}</p>
                          </div>

                          <button className="btn btn-gold glowing-action" disabled={!food.available} onClick={() => addFoodToCart(food)}>
                            Add
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}

            {restaurantTab === "delivery" && DeliveryInfo()}
            {restaurantTab === "contact" && ContactPage({ type: "restaurant" })}
            {restaurantTab === "favourites" && FavouritesPage()}

            {restaurantTab === "food-admin" && isAdmin && FoodAdmin()}

            {restaurantTab === "restaurant-orders" && isAdmin && RestaurantOrders()}

            {restaurantTab === "admin-users" && isSuperAdmin && AdminUsersPage()}
          </section>

          <aside>
            {LoginPanels()}
            {RestaurantBasket()}
          </aside>
        </main>

        {Footer()}
        <FloatingControls />
      </>
    );
  }

  function ContactPage({ type = "shop" } = {}) {
    const isRestaurant = type === "restaurant";
    const info = isRestaurant ? businessInfo.restaurant : businessInfo.shop;

    return (
      <>
        <div className="panel" style={{ overflow: "hidden", padding: 0 }}>
          <img
            src={info.image}
            alt={info.name || "Nungua Market"}
            style={{ width: "100%", height: "280px", objectFit: "cover", display: "block" }}
          />

          <div style={{ padding: "20px" }}>
            <h2>Contact {info.name || "Nungua Market"}</h2>
            <p className="muted">{info.description}</p>

            {isRestaurant ? (
              <div style={{ marginBottom: "20px" }}>
                <p><b>Address:</b> {info.address}</p>
                <p><b>Phone:</b> {info.phone}</p>
                <p><b>Email:</b> {info.email}</p>
              </div>
            ) : (
              <div style={{ marginBottom: "20px" }}>
                <h3>Shop Branches</h3>

                {info.branches.map((branch) => (
                  <div key={branch.name} style={{ padding: "10px 0", borderBottom: "1px solid #e2e8f0" }}>
                    <p><b>{branch.name}</b></p>
                    <p><b>Address:</b> {branch.address}</p>
                  </div>
                ))}

                <p><b>Phone:</b> {info.phone}</p>
                <p><b>Email:</b> {info.email}</p>
              </div>
            )}

            <form onSubmit={sendContactMessage}>
              <input className="input" placeholder="Your name" value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} />
              <input className="input" placeholder="Email address" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} />
              <input className="input" placeholder="Phone number" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} />

              <textarea
                className="input"
                rows="6"
                placeholder={isRestaurant ? "Ask about food orders, reservations, or delivery..." : "Ask about groceries, stock, branch availability, or collection..."}
                value={contact.message}
                onChange={(e) => setContact({ ...contact, message: e.target.value })}
              />

              <button className="btn btn-gold">Send Message</button>
            </form>
          </div>
        </div>

        <div className="contact-grid">
          <div className="panel">
            <h2>Opening Hours</h2>

            {info.openingHours.map(([day, hours]) => (
              <div key={day} className="row" style={{ borderBottom: "1px solid #e2e8f0", padding: "10px 0" }}>
                <strong>{day}</strong>
                <span>{hours}</span>
              </div>
            ))}
          </div>

          {isRestaurant ? (
            <div className="panel">
              <h2>Restaurant Location</h2>
              <iframe
                title={`${info.name || "Restaurant"} Location`}
                src={`https://www.google.com/maps?q=${encodeURIComponent(info.mapQuery)}&output=embed`}
                width="100%"
                height="330"
                style={{ border: 0, borderRadius: "16px" }}
                loading="lazy"
              />
            </div>
          ) : (
            info.branches.map((branch) => (
              <div className="panel" key={branch.name}>
                <h2>{branch.name}</h2>
                <p className="muted">{branch.address}</p>
                <iframe
                  title={`${branch.name} Location`}
                  src={`https://www.google.com/maps?q=${encodeURIComponent(branch.mapQuery)}&output=embed`}
                  width="100%"
                  height="330"
                  style={{ border: 0, borderRadius: "16px" }}
                  loading="lazy"
                />
              </div>
            ))
          )}
        </div>
      </>
    );
  }

  function DeliveryInfo() {
    return (
      <div className="panel">
        <h2><Bike size={20} /> Delivery Area</h2>
        <p>Restaurant delivery is currently available to these postcode zones:</p>

        <div className="cats">
          {Object.entries(allowedDeliveryZones).map(([zone, fee]) => (
            <span className="badge ok" key={zone}>{zone}: £{fee.toFixed(2)}</span>
          ))}
        </div>

        <p className="muted">Customers outside these zones should choose collection from the shop.</p>
      </div>
    );
  }

  function ShopAdmin() {
    return (
      <>
        <div className="panel">
          <h2><Plus size={20} /> Add New Product</h2>
          <ProductForm value={newProduct} setValue={setNewProduct} onSubmit={addProduct} submitText="Add Product" files={newFiles} setFiles={setNewFiles} categories={shopCategories} />
        </div>

        <div className="grid">
          {products.map(product => (
            <article className="card" key={product.id}>
              <img src={mainImage(product)} alt={product.name} />

              <div className="card-body">
                {editing === product.id ? (
                  <ProductForm value={editProduct} setValue={setEditProduct} onSubmit={saveEdit} submitText="Save Changes" files={editFiles} setFiles={setEditFiles} categories={shopCategories} />
                ) : (
                  <>
                    <div className="row">
                      <h3>{product.name}</h3>
                      <span className={"badge " + (product.available ? "ok" : "no")}>
                        {product.available ? "Available" : "Out"}
                      </span>
                    </div>

                    <p className="muted">{product.category}</p>
                    <div className="price">£{Number(product.price).toFixed(2)}</div>
                    <p>Stock: {product.stock}</p>

                    <div className="row">
                      <button className="btn btn-dark" onClick={() => startEdit(product)}><Pencil size={15} /> Edit</button>
                      <button className="btn btn-red" onClick={() => deleteProduct(product.id)}><Trash2 size={15} /> Delete</button>
                    </div>
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
      </>
    );
  }

  function FoodAdmin() {
    return (
      <>
        <div className="panel">
          <h2><Plus size={20} /> Add New Food</h2>
          <ProductForm value={newFood} setValue={setNewFood} onSubmit={addFood} submitText="Add Food" files={newFoodFiles} setFiles={setNewFoodFiles} categories={foodCategories} />
        </div>

        <div className="grid">
          {foods.map(food => (
            <article className="card" key={food.id}>
              <img src={mainFoodImage(food)} alt={food.name} />

              <div className="card-body">
                {editingFood === food.id ? (
                  <ProductForm value={editFood} setValue={setEditFood} onSubmit={saveFoodEdit} submitText="Save Changes" files={editFoodFiles} setFiles={setEditFoodFiles} categories={foodCategories} />
                ) : (
                  <>
                    <div className="row">
                      <h3>{food.name}</h3>
                      <span className={"badge " + (food.available ? "ok" : "no")}>
                        {food.available ? "Available" : "Out"}
                      </span>
                    </div>

                    <p className="muted">{food.category}</p>
                    <div className="price">£{Number(food.price).toFixed(2)}</div>
                    <p>Stock: {food.stock}</p>

                    <div className="row">
                      <button className="btn btn-dark" onClick={() => startFoodEdit(food)}><Pencil size={15} /> Edit</button>
                      <button className="btn btn-red" onClick={() => deleteFood(food.id)}><Trash2 size={15} /> Delete</button>
                    </div>
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
      </>
    );
  }

  function ShopOrders() {
    return (
      <div className="panel">
        <h2><PackageCheck size={20} /> Grocery Orders</h2>
        <button className="btn btn-light" onClick={loadOrders}>Refresh Orders</button>

        {orders.length === 0 && <p className="muted">No orders yet.</p>}

        {orders.map(order => (
          <div className="order-item" key={order.id}>
            <div style={{ width: "100%" }}>
              <div className="row">
                <h3>{order.customer_name}</h3>
                <span className={"badge " + (order.status === "completed" ? "done" : "new")}>{order.status}</span>
              </div>

              <p><b>Phone:</b> {order.customer_phone}</p>
              <p><b>Email:</b> {order.customer_email || "None"}</p>
              <p><b>Address/note:</b> {order.customer_address || "None"}</p>
              <p><b>Total:</b> £{Number(order.total_price).toFixed(2)}</p>
              <p className="muted small">{new Date(order.created_at).toLocaleString()}</p>

              <ul>
                {(order.order_items || []).map(item => (
                  <li key={item.id}>{item.products?.name || "Product"} × {item.quantity} — £{Number(item.price).toFixed(2)}</li>
                ))}
              </ul>

              <div className="cats">
                {["new", "preparing", "ready", "completed", "cancelled"].map(s => (
                  <button key={s} className="btn btn-light" onClick={() => updateOrderStatus(order.id, s)}>{s}</button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  function RestaurantOrders() {
    return (
      <div className="panel">
        <h2><PackageCheck size={20} /> Restaurant Orders</h2>
        <button className="btn btn-light" onClick={loadRestaurantOrders}>Refresh Orders</button>

        {restaurantOrders.length === 0 && <p className="muted">No restaurant orders yet.</p>}

        {restaurantOrders.map(order => (
          <div className="order-item" key={order.id}>
            <div style={{ width: "100%" }}>
              <div className="row">
                <h3>{order.customer_name}</h3>
                <span className={"badge " + (order.status === "completed" ? "done" : "new")}>{order.status}</span>
              </div>

              <p><b>Phone:</b> {order.customer_phone}</p>
              <p><b>Email:</b> {order.customer_email || "None"}</p>
              <p><b>Method:</b> {order.fulfilment_method}</p>
              <p><b>Address:</b> {order.customer_address || "None"} {order.customer_postcode || ""}</p>
              <p><b>Subtotal:</b> £{Number(order.subtotal_price || 0).toFixed(2)} | <b>Delivery:</b> £{Number(order.delivery_fee || 0).toFixed(2)} | <b>Total:</b> £{Number(order.total_price).toFixed(2)}</p>
              <p className="muted small">{new Date(order.created_at).toLocaleString()}</p>
              <p className="muted small">{order.admin_note}</p>

              <ul>
                {(order.restaurant_order_items || []).map(item => (
                  <li key={item.id}>{item.restaurant_foods?.name || "Food"} × {item.quantity} — £{Number(item.price).toFixed(2)}</li>
                ))}
              </ul>

              <div className="cats">
                {["new", "accepted", "preparing", "ready", "completed", "cancelled"].map(s => (
                  <button key={s} className="btn btn-light" onClick={() => updateRestaurantOrderStatus(order.id, s)}>{s}</button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  function Messages() {
    return (
      <div className="panel">
        <h2>Customer Messages</h2>
        <button className="btn btn-light" onClick={loadContactMessages}>Refresh Messages</button>

        {contactMessages.length === 0 && <p className="muted">No messages yet.</p>}

        {contactMessages.map(msg => (
          <div className="order-item" key={msg.id}>
            <div>
              <h3>{msg.name}</h3>
              <p><b>Email:</b> {msg.email || "None"}</p>
              <p><b>Phone:</b> {msg.phone || "None"}</p>
              <p>{msg.message}</p>
              <p className="muted small">{new Date(msg.created_at).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  function Analytics() {
    return (
      <div className="panel">
        <h2><BarChart3 size={20} /> Admin Analytics</h2>

        <div className="stats">
          <div className="stat"><p className="muted">Grocery Products</p><h2>{products.length}</h2></div>
          <div className="stat"><p className="muted">Restaurant Foods</p><h2>{foods.length}</h2></div>
          <div className="stat"><p className="muted">All Orders</p><h2>{orders.length + restaurantOrders.length}</h2></div>
          <div className="stat"><p className="muted">Revenue recorded</p><h2>£{totalRevenue.toFixed(2)}</h2></div>
          <div className="stat"><p className="muted">Low stock items</p><h2>{lowStock}</h2></div>
          <div className="stat"><p className="muted">Wishlist Items</p><h2>{favourites.length}</h2></div>
        </div>
      </div>
    );
  }

  function Footer() {
    return <footer className="footer">Nungua Market Platform · Grocery Shop & Restaurant</footer>;
  }


  return (
    <>
      <audio ref={audioRef} src="/background-music.mp3" loop preload="auto" />
      {department === "shop" ? ShopPage() : RestaurantPage()}
    </>
  );
}

