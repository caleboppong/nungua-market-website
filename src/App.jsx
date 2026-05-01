
import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabaseClient";
import { ShoppingCart, MapPin, Phone, Clock, Plus, Trash2, Pencil, LogOut, PackageCheck, UserPlus, BarChart3, Upload } from "lucide-react";

const categories = ["All", "Fresh Produce", "Grains & Flour", "Cooking Ingredients", "Oils & Sauces", "Drinks", "Frozen Food", "Spices"];
const blankProduct = { name: "", category: "Fresh Produce", price: "", image_url: "", stock: "", description: "", available: true };

const slideshowImages = [
  "/Shop1.jpeg",
  "/Shop2.jpeg",
  "/Shop3.jpeg",
  "/Shop4.jpeg",
  "/Shop5.jpeg",
  "/Shop6.jpeg"
];

const openingHours = [
  ["Monday", "9am–9pm"],
  ["Tuesday", "9am–9pm"],
  ["Wednesday", "9am–9pm"],
  ["Thursday", "9am–9pm"],
  ["Friday", "9am–9pm"],
  ["Saturday", "9am–9pm"],
  ["Sunday", "10am–9pm"]
];

const homeCategories = [
  { title: "Fresh Produce", note: "Plantain, yam, peppers", emoji: "🍌" },
  { title: "Grains & Flour", note: "Gari, fufu flour, rice", emoji: "🌾" },
  { title: "Cooking Ingredients", note: "Jollof mix, spices, tins", emoji: "🥘" },
  { title: "Oils & Sauces", note: "Palm oil, sauces, seasoning", emoji: "🛢️" }
];


export default function App() {
  const [products, setProducts] = useState([]);
  const [productImages, setProductImages] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState([]);
  const [session, setSession] = useState(null);
  const [tab, setTab] = useState("shop");
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [login, setLogin] = useState({ email: "", password: "" });
  const [signup, setSignup] = useState({ email: "", password: "" });
  const [newProduct, setNewProduct] = useState(blankProduct);
  const [editing, setEditing] = useState(null);
  const [editProduct, setEditProduct] = useState({});
  const [newFiles, setNewFiles] = useState([]);
  const [editFiles, setEditFiles] = useState([]);
  const [customer, setCustomer] = useState({ name: "", phone: "", email: "", address: "" });
  const [message, setMessage] = useState("");
  const [contact, setContact] = useState({ name: "", email: "", phone: "", message: "" });
  const [contactMessages, setContactMessages] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);


  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideshowImages.length);
    }, 4500);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    loadProducts();
    loadProductImages();
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, currentSession) => setSession(currentSession));
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      loadOrders();
      loadContactMessages();
      if (session.user?.email) setCustomer((c) => ({ ...c, email: session.user.email }));
    }
  }, [session]);

  async function loadProducts() {
    const { data, error } = await supabase.from("products").select("*").order("name");
    if (error) setMessage(error.message); else setProducts(data || []);
  }

  async function loadProductImages() {
    const { data, error } = await supabase.from("product_images").select("*").order("created_at");
    if (error) setMessage(error.message); else setProductImages(data || []);
  }

  async function loadOrders() {
    const { data, error } = await supabase.from("orders").select("*, order_items(*, products(name))").order("created_at", { ascending: false });
    if (error) setMessage(error.message); else setOrders(data || []);
  }

  async function loadContactMessages() {
    const { data, error } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false });
    if (error) setMessage(error.message); else setContactMessages(data || []);
  }

  async function sendContactMessage(e) {
    e.preventDefault();
    if (!contact.name || !contact.message) return setMessage("Please enter your name and message.");
    const { error } = await supabase.from("contact_messages").insert(contact);
    if (error) return setMessage(error.message);
    setContact({ name: "", email: "", phone: "", message: "" });
    setMessage("Thank you. Your message has been sent.");
    if (session) loadContactMessages();
  }

  async function signIn(e) {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email: login.email, password: login.password });
    if (error) setMessage(error.message); else setLogin({ email: "", password: "" });
  }

  async function signUp(e) {
    e.preventDefault();
    const { error } = await supabase.auth.signUp({ email: signup.email, password: signup.password });
    if (error) setMessage(error.message); else {
      setMessage("Customer account created. Check email if confirmation is enabled.");
      setSignup({ email: "", password: "" });
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    setTab("shop");
  }

  function imagesFor(productId) {
    return productImages.filter((img) => img.product_id === productId);
  }

  function mainImage(product) {
    const extra = imagesFor(product.id)[0];
    return extra?.image_url || product.image_url || "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=900&auto=format&fit=crop";
  }

  const visibleProducts = useMemo(() => products.filter((p) => {
    const cat = category === "All" || p.category === category;
    const text = (p.name + " " + (p.description || "")).toLowerCase().includes(search.toLowerCase());
    return cat && text;
  }), [products, category, search]);

  const total = cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalRevenue = orders.reduce((s, o) => s + Number(o.total_price || 0), 0);
  const lowStock = products.filter((p) => Number(p.stock) <= 5).length;

  function addToCart(product) {
    if (!product.available || product.stock < 1) return;
    setCart((items) => {
      const found = items.find((i) => i.id === product.id);
      if (found) return items.map((i) => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...items, { ...product, quantity: 1, image_url: mainImage(product) }];
    });
  }

  function changeQty(id, amount) {
    setCart((items) => items.map((i) => i.id === id ? { ...i, quantity: Math.max(0, i.quantity + amount) } : i).filter((i) => i.quantity > 0));
  }

  async function uploadFiles(files, productId) {
    const uploadedUrls = [];
    for (const file of files) {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      const filePath = `${productId}/${Date.now()}-${safeName}`;
      const { error: uploadError } = await supabase.storage.from("product-images").upload(filePath, file, { upsert: false });
      if (uploadError) {
        setMessage(uploadError.message);
        continue;
      }
      const { data } = supabase.storage.from("product-images").getPublicUrl(filePath);
      uploadedUrls.push(data.publicUrl);
      await supabase.from("product_images").insert({ product_id: productId, image_url: data.publicUrl });
    }
    if (uploadedUrls.length > 0) {
      await supabase.from("products").update({ image_url: uploadedUrls[0] }).eq("id", productId);
    }
    await loadProducts();
    await loadProductImages();
    return uploadedUrls;
  }

  async function placeOrder() {
    if (!customer.name || !customer.phone || cart.length === 0) return setMessage("Please enter customer name, phone number, and add products.");
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
    const items = cart.map((item) => ({ order_id: order.id, product_id: item.id, quantity: item.quantity, price: item.price }));
    const { error: itemError } = await supabase.from("order_items").insert(items);
    if (itemError) return setMessage(itemError.message);
    setCart([]);
    setCustomer({ name: "", phone: "", email: session?.user?.email || "", address: "" });
    setMessage("Order received. The shop will contact the customer to confirm.");
    if (session) loadOrders();
  }

  async function payWithStripe() {
    if (cart.length === 0) {
      return setMessage("Please add products to the basket first.");
    }

    if (!customer.name || !customer.phone || !customer.email) {
      return setMessage("Please enter name, phone, and email before card payment.");
    }

    try {
      const response = await fetch(
        "https://quvjpenvmdkgaesqzslv.supabase.co/functions/v1/create-checkout-session",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            items: cart,
            customer
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Stripe function failed.");
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        setMessage("Stripe did not return a checkout URL.");
      }
    } catch (error) {
      setMessage(error.message);
    }
  }
  async function addProduct(e) {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) return setMessage("Product name and price are required.");
    const payload = {
      name: newProduct.name,
      category: newProduct.category,
      price: Number(newProduct.price),
      image_url: newProduct.image_url,
      stock: Number(newProduct.stock || 0),
      description: newProduct.description,
      available: Boolean(newProduct.available) && Number(newProduct.stock || 0) > 0
    };
    const { data, error } = await supabase.from("products").insert(payload).select().single();
    if (error) return setMessage(error.message);
    if (newFiles.length > 0) await uploadFiles(newFiles, data.id);
    setNewFiles([]);
    setNewProduct(blankProduct);
    setMessage("Product added successfully.");
    loadProducts();
  }

  function startEdit(product) {
    setEditing(product.id);
    setEditProduct({ ...product });
    setEditFiles([]);
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
    if (editFiles.length > 0) await uploadFiles(editFiles, editProduct.id);
    setEditing(null);
    setEditFiles([]);
    setMessage("Product updated.");
    loadProducts();
  }

  async function deleteProduct(id) {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) setMessage(error.message); else {
      setMessage("Product deleted.");
      loadProducts();
      loadProductImages();
    }
  }

  async function updateOrderStatus(id, status) {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) setMessage(error.message); else loadOrders();
  }

  function ProductForm({ value, setValue, onSubmit, submitText, files, setFiles }) {
    return (
      <form onSubmit={onSubmit} className="admin-grid">
        <input className="input" placeholder="Product name" value={value.name || ""} onChange={(e) => setValue({ ...value, name: e.target.value })} />
        <select className="select" value={value.category || "Fresh Produce"} onChange={(e) => setValue({ ...value, category: e.target.value })}>
          {categories.filter(c => c !== "All").map(c => <option key={c}>{c}</option>)}
        </select>
        <input className="input" type="number" step="0.01" placeholder="Price" value={value.price || ""} onChange={(e) => setValue({ ...value, price: e.target.value })} />
        <input className="input" type="number" placeholder="Stock quantity" value={value.stock || ""} onChange={(e) => setValue({ ...value, stock: e.target.value })} />
        <input className="input wide" placeholder="Optional image URL" value={value.image_url || ""} onChange={(e) => setValue({ ...value, image_url: e.target.value })} />
        <textarea className="input wide" placeholder="Description" value={value.description || ""} onChange={(e) => setValue({ ...value, description: e.target.value })} />
        <label><input type="checkbox" checked={Boolean(value.available)} onChange={(e) => setValue({ ...value, available: e.target.checked })} /> Available</label>
        <div className="upload-box wide">
          <b><Upload size={16}/> Upload product images</b>
          <p className="muted small">Choose one or more images from your computer.</p>
          <input type="file" accept="image/*" multiple onChange={(e) => setFiles(Array.from(e.target.files || []))} />
          <div className="preview-list">
            {files.map((file, idx) => <img key={idx} src={URL.createObjectURL(file)} alt="Preview" />)}
          </div>
        </div>
        <button className="btn btn-dark" type="submit">{submitText}</button>
      </form>
    );
  }

  return (
    <div>
      <header className="header">
        <div className="wrap top">
          <div>
            <div className="gold">African goods shop</div>
            <h1>Nungua Market African Food</h1>
            <div className="meta">
              <span><MapPin size={15}/> 32 High St, London E17 7LD</span>
              <span><Phone size={15}/> 020 7000 4115</span>
              <span><Clock size={15}/> 9am–9pm, Sunday 10am–9pm</span>
            </div>
            <div className="nav">
              <button className={"btn " + (tab === "shop" ? "btn-gold" : "btn-light")} onClick={() => setTab("shop")}>Shop</button>
              <button className={"btn " + (tab === "contact" ? "btn-gold" : "btn-light")} onClick={() => setTab("contact")}>Contact</button>
              {session && <button className={"btn " + (tab === "admin" ? "btn-gold" : "btn-light")} onClick={() => setTab("admin")}>Admin Products</button>}
              {session && <button className={"btn " + (tab === "orders" ? "btn-gold" : "btn-light")} onClick={() => setTab("orders")}>Orders</button>}
              {session && <button className={"btn " + (tab === "messages" ? "btn-gold" : "btn-light")} onClick={() => setTab("messages")}>Messages</button>}
              {session && <button className={"btn " + (tab === "analytics" ? "btn-gold" : "btn-light")} onClick={() => setTab("analytics")}>Analytics</button>}
            </div>
          </div>
          <div>
            <p><ShoppingCart size={18}/> {count} items</p>
            {session ? <button className="btn btn-light" onClick={signOut}><LogOut size={15}/> Logout</button> : <span className="muted">Customer/Admin login below</span>}
          </div>
        </div>
      </header>

      <main className="layout">
        <section>
          {message && <div className="notice">{message}</div>}

          {tab === "shop" && (
            <>
              <div
                className="panel"
                style={{
                  padding: 0,
                  overflow: "hidden",
                  background: "#020617",
                  color: "white"
                }}
              >
                <div
                  style={{
                    minHeight: "330px",
                    backgroundImage: `linear-gradient(90deg, rgba(2,6,23,.92), rgba(2,6,23,.55), rgba(2,6,23,.2)), url(${slideshowImages[currentSlide]})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    display: "flex",
                    alignItems: "center",
                    padding: "36px"
                  }}
                >
                  <div style={{ maxWidth: "620px" }}>
                    <p className="gold" style={{ fontWeight: 800 }}>Authentic African groceries in Walthamstow</p>
                    <h2 style={{ fontSize: "42px", margin: "10px 0" }}>Shop Ghanaian & African food online</h2>
                    <p style={{ fontSize: "18px", lineHeight: 1.5 }}>
                      Order fresh produce, gari, fufu flour, jollof ingredients, spices, drinks, and household essentials.
                    </p>

                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "20px" }}>
                      <button className="btn btn-gold" onClick={() => document.getElementById("shop-products")?.scrollIntoView({ behavior: "smooth" })}>
                        Start Shopping
                      </button>
                      <button className="btn btn-light" onClick={() => setTab("contact")}>
                        Visit Store
                      </button>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "8px", justifyContent: "center", padding: "12px" }}>
                  {slideshowImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      aria-label={`Show slide ${index + 1}`}
                      style={{
                        width: currentSlide === index ? "28px" : "10px",
                        height: "10px",
                        borderRadius: "20px",
                        border: 0,
                        background: currentSlide === index ? "#facc15" : "#cbd5e1",
                        cursor: "pointer"
                      }}
                    />
                  ))}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px", marginTop: "18px" }}>
                {homeCategories.map((item) => (
                  <button
                    key={item.title}
                    onClick={() => setCategory(item.title)}
                    className="panel"
                    style={{
                      textAlign: "left",
                      cursor: "pointer",
                      border: category === item.title ? "2px solid #facc15" : "1px solid #e2e8f0"
                    }}
                  >
                    <div style={{ fontSize: "32px" }}>{item.emoji}</div>
                    <h3 style={{ marginBottom: 4 }}>{item.title}</h3>
                    <p className="muted small">{item.note}</p>
                  </button>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "14px", marginTop: "18px" }}>
                <div className="panel" style={{ background: "#fef3c7" }}>
                  <h3>📦 Collection available</h3>
                  <p className="muted">Order online and collect from 32 High St, London E17 7LD.</p>
                </div>
                <div className="panel" style={{ background: "#dcfce7" }}>
                  <h3>💳 Secure card payment</h3>
                  <p className="muted">Pay safely online using Stripe checkout.</p>
                </div>
                <div className="panel" style={{ background: "#dbeafe" }}>
                  <h3>🛒 African essentials</h3>
                  <p className="muted">Fresh produce, grains, flours, oils, spices, and more.</p>
                </div>
              </div>

              <div className="panel" id="shop-products" style={{ marginTop: "18px" }}>
                <h2>Shop African groceries online</h2>
                <input className="search" placeholder="Search gari, plantain, fufu..." value={search} onChange={(e) => setSearch(e.target.value)} />
                <div className="cats">
                  {categories.map(c => (
                    <button
                      key={c}
                      className={"btn " + (category === c ? "btn-dark" : "btn-light")}
                      onClick={() => setCategory(c)}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid">
                {visibleProducts.map(product => (
                  <article className="card" key={product.id}>
                    <img src={mainImage(product)} alt={product.name} />
                    <div className="thumbs">
                      {imagesFor(product.id).map(img => <img key={img.id} src={img.image_url} alt={product.name} />)}
                    </div>
                    <div className="card-body">
                      <div className="row">
                        <div><p className="muted small">{product.category}</p><h3>{product.name}</h3></div>
                        <span className={"badge " + (product.available ? "ok" : "no")}>{product.available ? "Available" : "Out"}</span>
                      </div>
                      <p className="muted">{product.description}</p>
                      <div className="row">
                        <div><div className="price">£{Number(product.price).toFixed(2)}</div><p className="muted small">Stock: {product.stock}</p></div>
                        <button className="btn btn-gold" disabled={!product.available} onClick={() => addToCart(product)}>Add</button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}

          {tab === "admin" && session && (
            <>
              <div className="panel">
                <h2><Plus size={20}/> Add New Product</h2>
                <ProductForm value={newProduct} setValue={setNewProduct} onSubmit={addProduct} submitText="Add Product" files={newFiles} setFiles={setNewFiles} />
              </div>

              <div className="grid">
                {products.map(product => (
                  <article className="card" key={product.id}>
                    <img src={mainImage(product)} alt={product.name} />
                    <div className="thumbs">
                      {imagesFor(product.id).map(img => <img key={img.id} src={img.image_url} alt={product.name} />)}
                    </div>
                    <div className="card-body">
                      {editing === product.id ? (
                        <ProductForm value={editProduct} setValue={setEditProduct} onSubmit={saveEdit} submitText="Save Changes" files={editFiles} setFiles={setEditFiles} />
                      ) : (
                        <>
                          <div className="row"><h3>{product.name}</h3><span className={"badge " + (product.available ? "ok" : "no")}>{product.available ? "Available" : "Out"}</span></div>
                          <p className="muted">{product.category}</p>
                          <div className="price">£{Number(product.price).toFixed(2)}</div>
                          <p>Stock: {product.stock}</p>
                          <div className="row">
                            <button className="btn btn-dark" onClick={() => startEdit(product)}><Pencil size={15}/> Edit</button>
                            <button className="btn btn-red" onClick={() => deleteProduct(product.id)}><Trash2 size={15}/> Delete</button>
                          </div>
                        </>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}

          {tab === "orders" && session && (
            <div className="panel">
              <h2><PackageCheck size={20}/> Customer Orders</h2>
              <button className="btn btn-light" onClick={loadOrders}>Refresh Orders</button>
              {orders.length === 0 && <p className="muted">No orders yet.</p>}
              {orders.map(order => (
                <div className="order-item" key={order.id}>
                  <div style={{width:"100%"}}>
                    <div className="row"><h3>{order.customer_name}</h3><span className={"badge " + (order.status === "completed" ? "done" : "new")}>{order.status}</span></div>
                    <p><b>Phone:</b> {order.customer_phone}</p>
                    <p><b>Email:</b> {order.customer_email || "None"}</p>
                    <p><b>Address/note:</b> {order.customer_address || "None"}</p>
                    <p><b>Total:</b> £{Number(order.total_price).toFixed(2)}</p>
                    <p className="muted small">{new Date(order.created_at).toLocaleString()}</p>
                    <ul>{(order.order_items || []).map(item => <li key={item.id}>{item.products?.name || "Product"} × {item.quantity} — £{Number(item.price).toFixed(2)}</li>)}</ul>
                    <div className="cats">{["new","preparing","ready","completed","cancelled"].map(s => <button key={s} className="btn btn-light" onClick={() => updateOrderStatus(order.id, s)}>{s}</button>)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}


          {tab === "contact" && (
            <>
              <div className="panel" style={{ overflow: "hidden", padding: 0 }}>
                <img
                  src="/shop1.jpg"
                  alt="Nungua Market shop front"
                  style={{ width: "100%", height: "280px", objectFit: "cover", display: "block" }}
                />
                <div style={{ padding: "20px" }}>
                  <h2>Contact Nungua Market</h2>
                  <p className="muted">Send us a message about products, bulk orders, delivery, or collection.</p>

                  <p><b>Address:</b> 32 High St, London E17 7LD</p>
                  <p><b>Phone:</b> 020 7000 4115</p>

                  <form onSubmit={sendContactMessage}>
                    <input className="input" placeholder="Your name" value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} />
                    <input className="input" placeholder="Email address" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} />
                    <input className="input" placeholder="Phone number" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} />
                    <textarea className="input" rows="6" placeholder="Your message" value={contact.message} onChange={(e) => setContact({ ...contact, message: e.target.value })} />
                    <button className="btn btn-gold">Send Message</button>
                  </form>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "18px", marginTop: "18px" }}>
                <div className="panel">
                  <h2>Opening Hours</h2>
                  {openingHours.map(([day, hours]) => (
                    <div key={day} className="row" style={{ borderBottom: "1px solid #e2e8f0", padding: "10px 0" }}>
                      <strong>{day}</strong>
                      <span>{hours}</span>
                    </div>
                  ))}
                </div>

                <div className="panel">
                  <h2>Find Us</h2>
                  <iframe
                    title="Nungua Market Location"
                    src="https://www.google.com/maps?q=32%20High%20St,%20London%20E17%207LD&output=embed"
                    width="100%"
                    height="330"
                    style={{ border: 0, borderRadius: "16px" }}
                    loading="lazy"
                  ></iframe>
                </div>
              </div>
            </>
          )}

          {tab === "messages" && session && (
            <div className="panel">
              <h2>Customer Messages</h2>
              <button className="btn btn-light" onClick={loadContactMessages}>Refresh Messages</button>
              {contactMessages.length === 0 && <p className="muted">No messages yet.</p>}
              {contactMessages.map((msg) => (
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
          )}

          {tab === "analytics" && session && (
            <div className="panel">
              <h2><BarChart3 size={20}/> Admin Analytics</h2>
              <div className="stats">
                <div className="stat"><p className="muted">Products</p><h2>{products.length}</h2></div>
                <div className="stat"><p className="muted">Orders</p><h2>{orders.length}</h2></div>
                <div className="stat"><p className="muted">Revenue recorded</p><h2>£{totalRevenue.toFixed(2)}</h2></div>
                <div className="stat"><p className="muted">Low stock items</p><h2>{lowStock}</h2></div>
              </div>
            </div>
          )}
        </section>

        <aside>
          {!session && (
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
                <h2><UserPlus size={18}/> Customer Signup</h2>
                <form onSubmit={signUp}>
                  <input className="input" placeholder="Email" value={signup.email} onChange={(e) => setSignup({ ...signup, email: e.target.value })} />
                  <input className="input" type="password" placeholder="Password" value={signup.password} onChange={(e) => setSignup({ ...signup, password: e.target.value })} />
                  <button className="btn btn-light">Create Account</button>
                </form>
              </div>
            </>
          )}

          <div className="panel">
            <h2>Basket</h2>
            {cart.length === 0 ? <p className="muted">Your basket is empty.</p> : cart.map(item => (
              <div className="cart-item" key={item.id}>
                <img src={item.image_url} alt={item.name} />
                <div>
                  <b>{item.name}</b>
                  <p className="muted">£{Number(item.price).toFixed(2)}</p>
                  <div className="qty"><button onClick={() => changeQty(item.id, -1)}>-</button><b>{item.quantity}</b><button onClick={() => changeQty(item.id, 1)}>+</button></div>
                </div>
              </div>
            ))}
            <h2>Total: £{total.toFixed(2)}</h2>
            <input className="input" placeholder="Customer name" value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} />
            <input className="input" placeholder="Phone number" value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} />
            <input className="input" placeholder="Email" value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} />
            <input className="input" placeholder="Delivery address / collection note" value={customer.address} onChange={(e) => setCustomer({ ...customer, address: e.target.value })} />
            <button className="btn btn-gold" onClick={placeOrder}>Place Order</button>{" "}
            <button className="btn btn-dark" onClick={payWithStripe}>Pay by Card</button>
            <p className="muted small">Card payment uses a Stripe Payment Link when configured.</p>
          </div>
        </aside>
      </main>

      <footer className="footer">Nungua Market African Food · 32 High St, London E17 7LD · 020 7000 4115</footer>
    </div>
  );
}
