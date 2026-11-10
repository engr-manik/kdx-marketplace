"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Listing = {
  id: string; do_number: string; product: string; quantity: string;
  unit: string; asking_price: string; issuer: string; valid_until: string;
  seller_name: string; status: string;
};
type Profile = { id: string; business_name: string; role: string; verification_status: string; };

export default function Home() {
  const [tab,setTab] = useState("market");
  const [listings,setListings] = useState<Listing[]>([]);
  const [profile,setProfile] = useState<Profile|null>(null);
  const [user,setUser] = useState<any>(null);
  const [message,setMessage] = useState("");
  const [loading,setLoading] = useState(false);

  async function refresh() {
    const { data: auth } = await supabase.auth.getUser();
    setUser(auth.user ?? null);
    if (auth.user) {
      const {data:p} = await supabase.from("profiles").select("*").eq("id",auth.user.id).maybeSingle();
      setProfile(p);
    } else { setProfile(null); }
    const {data,error} = await supabase.from("do_listings").select("*").eq("status","available").order("created_at",{ascending:false});
    if (error) setMessage(error.message); else setListings(data ?? []);
  }
  useEffect(()=>{ refresh(); },[]);

  async function register(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setLoading(true); setMessage("");
    const f = new FormData(e.currentTarget);
    const email=String(f.get("email")), password=String(f.get("password"));
    const {data,error}=await supabase.auth.signUp({email,password});
    if(error){setMessage(error.message);setLoading(false);return;}
    if(data.user){
      const {error:pe}=await supabase.from("profiles").upsert({
        id:data.user.id, business_name:f.get("business_name"), role:f.get("role"),
        phone:f.get("phone"), trade_license:f.get("trade_license"),
        nid_reference:f.get("nid_reference"), business_address:f.get("business_address"),
        verification_status:"pending"
      });
      setMessage(pe ? pe.message : "Registration submitted. Check your email if confirmation is enabled. Admin verification is pending.");
    }
    await refresh();setLoading(false);e.currentTarget.reset();
  }
  async function login(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();setLoading(true);setMessage("");
    const f=new FormData(e.currentTarget);
    const {error}=await supabase.auth.signInWithPassword({email:String(f.get("email")),password:String(f.get("password"))});
    setMessage(error ? error.message : "Signed in successfully."); await refresh();setLoading(false);
  }
  async function logout(){await supabase.auth.signOut();setUser(null);setProfile(null);setMessage("Signed out.");}
  async function createListing(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();if(!user){setMessage("Please sign in first.");return;}
    if(profile?.verification_status!=="verified"){setMessage("Only admin-verified traders can publish DO listings.");return;}
    setLoading(true);const f=new FormData(e.currentTarget);
    const {error}=await supabase.from("do_listings").insert({
      seller_id:user.id,seller_name:profile.business_name,do_number:f.get("do_number"),
      product:f.get("product"),quantity:f.get("quantity"),unit:f.get("unit"),
      asking_price:f.get("asking_price"),issuer:f.get("issuer"),valid_until:f.get("valid_until"),
      status:"available"
    });
    setMessage(error?error.message:"DO listing submitted.");e.currentTarget.reset();await refresh();setLoading(false);setTab("market");
  }
  async function requestDeal(listing:Listing) {
    if(!user){setMessage("Sign in as a buyer to request a deal.");setTab("login");return;}
    if(profile?.verification_status!=="verified"){setMessage("Your trader account must be verified first.");return;}
    const {error}=await supabase.from("deals").insert({
      listing_id:listing.id,buyer_id:user.id,buyer_name:profile.business_name,
      seller_id:(listing as any).seller_id,seller_name:listing.seller_name,status:"requested"
    });
    setMessage(error ? error.message : "Deal request sent to seller."); 
  }
  const nav=[["market","DO Marketplace"],["register","Registration"],["login","Login"],["listing","List a DO"],["deals","My Deals"],["admin","Admin"]];
  return <main className="wrap">
    <header className="top">
      <div className="row"><div><div className="brand">KDX</div><div className="sub">KHĀTUNGANJ DIGITAL DO EXCHANGE</div></div><div style={{textAlign:"right",fontSize:13}}>Chattogram, Bangladesh<br/>Trade DO. Connect Digitally.</div></div>
      <h1 style={{fontSize:25,margin:"24px 0 5px"}}>A digital marketplace for trusted traders</h1>
      <div className="sub">Discover DO listings, connect with verified businesses and track deal requests.</div>
    </header>
    <section className="grid">
      <div className="card"><div className="muted">Available DO listings</div><div className="stats">{listings.length}</div></div>
      <div className="card"><div className="muted">Account</div><div style={{fontWeight:800,marginTop:10}}>{profile?.business_name ?? (user?.email ?? "Guest")}</div><span className="pill">{profile?.verification_status ?? "Not signed in"}</span></div>
    </section>
    <nav className="nav">{nav.map(([id,label])=><button key={id} className={tab===id?"active":""} onClick={()=>setTab(id)}>{label}</button>)}{user&&<button onClick={logout}>Logout</button>}</nav>
    {message&&<div className="notice" role="status" style={{marginBottom:14}}>{message}</div>}
    {tab==="market"&&<section><div className="row"><h2>Available DO Listings</h2><span className="muted">Demo marketplace connected to Supabase</span></div>{listings.length===0?<div className="card muted">No approved listings yet. Verified sellers can publish listings.</div>:<div className="grid">{listings.map(l=><article className="card" key={l.id}><div className="row"><h3>{l.product}</h3><span className="pill">{l.status}</span></div><p className="muted">DO Ref: {l.do_number}</p><div className="grid"><div><b>{l.quantity} {l.unit}</b><div className="muted">Quantity</div></div><div><b>৳{l.asking_price}</b><div className="muted">Asking price</div></div></div><p className="muted">Seller: {l.seller_name}<br/>Issuer: {l.issuer}<br/>Valid until: {l.valid_until}</p><button className="btn" onClick={()=>requestDeal(l)}>Request Deal</button></article>)}</div>}</section>}
    {tab==="register"&&<section className="card form"><h2>Trader Registration</h2><p className="muted">Register as a buyer, seller or both. Do not upload actual NID images in this starter version.</p><form onSubmit={register}>
      <label>Business name<input name="business_name" required /></label><label>Trader role<select name="role"><option value="buyer">Buyer</option><option value="seller">Seller</option><option value="both">Buyer & Seller</option></select></label>
      <label>Mobile number<input name="phone" required /></label><label>Trade licence reference<input name="trade_license" required /></label><label>NID reference (last 4 digits or internal reference only)<input name="nid_reference" required /></label><label>Business address<input name="business_address" required /></label>
      <label>Email<input name="email" type="email" required /></label><label>Password (minimum 8 characters)<input name="password" type="password" minLength={8} required /></label>
      <button className="btn" disabled={loading}>Submit registration</button></form></section>}
    {tab==="login"&&<section className="card form"><h2>Trader Login</h2><form onSubmit={login}><label>Email<input name="email" type="email" required /></label><label>Password<input name="password" type="password" required /></label><button className="btn" disabled={loading}>Login</button></form></section>}
    {tab==="listing"&&<section className="card form"><h2>Publish a DO Listing</h2><p className="muted">Only admin-verified sellers can publish listings.</p><form onSubmit={createListing}>
      <label>DO reference number<input name="do_number" required /></label><label>Product<input name="product" required /></label><label>Quantity<input name="quantity" required /></label><label>Unit<select name="unit"><option>MT</option><option>KG</option><option>Bag</option><option>Liter</option></select></label><label>Asking price (৳)<input name="asking_price" type="number" required /></label><label>Issuer / Supplier<input name="issuer" required /></label><label>Valid until<input name="valid_until" type="date" required /></label><button className="btn" disabled={loading}>Publish listing</button></form></section>}
    {tab==="deals"&&<section className="card"><h2>My Deals</h2><p className="muted">Deal status and transfer tracking are the next controlled workflow stage. Ask the admin to enable deal-management permissions before live trading.</p>{user?<p>Signed in as {user.email}. Deal workflow tables are ready for extension.</p>:<p>Please login to view your deals.</p>}</section>}
    {tab==="admin"&&<section className="card"><h2>Admin Verification</h2><p className="muted">Admin approval is managed securely in the Supabase dashboard in this starter package. Do not expose service-role keys in the browser.</p><ol><li>Open Supabase → Table Editor → profiles.</li><li>Review the business details and documents outside the public website.</li><li>Change verification_status from pending to verified only after independent checks.</li></ol><p className="notice">A dedicated admin panel, issuer portal, two-party deal acceptance and completion audit are not included in this initial free MVP.</p></section>}
    <footer>KDX · Khātunganj Digital DO Exchange · Starter MVP v1.0<br/>No payment handling. Verify every DO directly with its issuer before any transaction.</footer>
  </main>;
}
