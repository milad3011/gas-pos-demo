"use client";

import { useEffect, useMemo, useState } from "react";
import "./globals.css";

type Product = {
  id: number;
  name: string;
  price: number;
};

const products: Product[] = [
  { id: 1, name: "جرة غاز 12 كغم", price: 70 },
  { id: 2, name: "جرة فارغة", price: 180 },
  { id: 3, name: "منظم غاز", price: 35 },
  { id: 4, name: "خرطوم غاز", price: 15 },
  { id: 5, name: "رأس غاز", price: 25 },
  { id: 6, name: "ولاعة", price: 5 },
];

export default function Page() {
  const [invoiceNo, setInvoiceNo] = useState("000001");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [cart, setCart] = useState<Record<number, number>>({});
  const [discount, setDiscount] = useState(0);
  const [customer, setCustomer] = useState("");

  function newInvoiceInfo() {
    setInvoiceNo(Date.now().toString().slice(-6));
    setInvoiceDate(new Date().toLocaleString("ar"));
  }

  useEffect(() => {
    newInvoiceInfo();
  }, []);

  const subtotal = useMemo(() => {
    return products.reduce((sum, p) => sum + (cart[p.id] || 0) * p.price, 0);
  }, [cart]);

  const total = Math.max(subtotal - discount, 0);

  function add(id: number) {
    setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));
  }

  function minus(id: number) {
    setCart((c) => {
      const qty = (c[id] || 0) - 1;

      if (qty <= 0) {
        const copy = { ...c };
        delete copy[id];
        return copy;
      }

      return { ...c, [id]: qty };
    });
  }

  function clear() {
    setCart({});
    setDiscount(0);
    setCustomer("");
    newInvoiceInfo();
  }

  const cartItems = products.filter((p) => cart[p.id]);

  return (
    <main className="page" dir="rtl">
      <section className="top no-print">
        <div>
          <h1>نظام بيع الغاز</h1>
          <p>ديمو POS للتابلت / الآيفون</p>
        </div>

        <button onClick={clear} className="danger">
          فاتورة جديدة
        </button>
      </section>

      <section className="grid">
        <div className="products no-print">
          <h2>الأصناف</h2>

          <div className="productGrid">
            {products.map((p) => (
              <button key={p.id} className="product" onClick={() => add(p.id)}>
                <span>{p.name}</span>
                <b>{p.price} ₪</b>
              </button>
            ))}
          </div>
        </div>

        <div className="invoice">
          <div className="invoiceHeader">
            <h2>فاتورة بيع</h2>
            <p>رقم: GAS-{invoiceNo}</p>
            <p>{invoiceDate}</p>
          </div>

          <label className="no-print label">
            اسم العميل
            <input
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              placeholder="مثلاً: بيع نقدي"
            />
          </label>

          <p className="print-only">العميل: {customer || "بيع نقدي"}</p>

          <table>
            <thead>
              <tr>
                <th>الصنف</th>
                <th>كمية</th>
                <th>السعر</th>
                <th>الإجمالي</th>
                <th className="no-print"></th>
              </tr>
            </thead>

            <tbody>
              {cartItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty">
                    لا يوجد أصناف
                  </td>
                </tr>
              ) : (
                cartItems.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{cart[p.id]}</td>
                    <td>{p.price} ₪</td>
                    <td>{cart[p.id] * p.price} ₪</td>
                    <td className="no-print actions">
                      <button onClick={() => add(p.id)}>+</button>
                      <button onClick={() => minus(p.id)}>-</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="totals">
            <div>
              <span>المجموع</span>
              <b>{subtotal} ₪</b>
            </div>

            <label className="no-print discount">
              خصم
              <input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
              />
            </label>

            <div>
              <span>الخصم</span>
              <b>{discount} ₪</b>
            </div>

            <div className="grand">
              <span>الصافي</span>
              <b>{total} ₪</b>
            </div>
          </div>

          <div className="footer">
            <p>شكراً لزيارتكم</p>
          </div>

          <button className="print no-print" onClick={() => window.print()}>
            طباعة الفاتورة
          </button>
        </div>
      </section>
    </main>
  );
}