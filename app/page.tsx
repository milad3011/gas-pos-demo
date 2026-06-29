"use client";

import { useMemo, useState } from "react";
import "./globals.css";

type Product = {
  id: number;
  name: string;
  category: string;
  cost: number;
  price: number;
  wholesalePrice: number;
  minPrice: number;
  stock: number;
  image: string;
};

type Customer = {
  id: number;
  name: string;
  type: "regular" | "wholesale";
  balance: number;
};

type CartItem = {
  productId: number;
  qty: number;
  price: number;
};

const products: Product[] = [
  {
    id: 1,
    name: "جرة غاز 12 كغم",
    category: "اسطوانات",
    cost: 52,
    price: 70,
    wholesalePrice: 65,
    minPrice: 52,
    stock: 28,
    image: "🛢️",
  },
  {
    id: 2,
    name: "جرة غاز 48 كغم",
    category: "اسطوانات",
    cost: 210,
    price: 260,
    wholesalePrice: 245,
    minPrice: 210,
    stock: 8,
    image: "🔥",
  },
  {
    id: 3,
    name: "منظم غاز",
    category: "أكسسوارات",
    cost: 22,
    price: 35,
    wholesalePrice: 30,
    minPrice: 22,
    stock: 15,
    image: "⚙️",
  },
  {
    id: 4,
    name: "خرطوم غاز",
    category: "أكسسوارات",
    cost: 8,
    price: 15,
    wholesalePrice: 12,
    minPrice: 8,
    stock: 35,
    image: "〰️",
  },
  {
    id: 5,
    name: "رأس غاز",
    category: "أكسسوارات",
    cost: 13,
    price: 25,
    wholesalePrice: 20,
    minPrice: 13,
    stock: 19,
    image: "🔩",
  },
  {
    id: 6,
    name: "ولاعة",
    category: "أكسسوارات",
    cost: 2,
    price: 5,
    wholesalePrice: 4,
    minPrice: 2,
    stock: 50,
    image: "🔥",
  },
];

const customers: Customer[] = [
  { id: 1, name: "بيع نقدي", type: "regular", balance: 0 },
  { id: 2, name: "سوبرماركت المجد", type: "wholesale", balance: 320 },
  { id: 3, name: "أبو أحمد", type: "regular", balance: 75 },
];

export default function Page() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerId, setCustomerId] = useState(1);
  const [saleType, setSaleType] = useState<"cash" | "debt">("cash");
  const [discount, setDiscount] = useState(0);
  const [notice, setNotice] = useState("");

  const selectedCustomer = customers.find((c) => c.id === customerId)!;

  const cartRows = cart.map((item) => {
    const product = products.find((p) => p.id === item.productId)!;
    return {
      ...item,
      product,
      lineTotal: item.qty * item.price,
      lineCost: item.qty * product.cost,
    };
  });

  const subtotal = useMemo(
    () => cartRows.reduce((sum, row) => sum + row.lineTotal, 0),
    [cartRows]
  );

  const totalCost = useMemo(
    () => cartRows.reduce((sum, row) => sum + row.lineCost, 0),
    [cartRows]
  );

  const total = Math.max(subtotal - discount, 0);
  const profit = total - totalCost;

  function showNotice(message: string) {
    setNotice(message);
    setTimeout(() => setNotice(""), 3000);
  }

  function addToCart(product: Product) {
    const existing = cart.find((i) => i.productId === product.id);
    const currentQty = existing?.qty || 0;

    if (currentQty + 1 > product.stock) {
      showNotice("لا يمكن بيع كمية أكبر من المخزون المتوفر");
      return;
    }

    const defaultPrice =
      selectedCustomer.type === "wholesale"
        ? product.wholesalePrice
        : product.price;

    if (existing) {
      setCart((items) =>
        items.map((i) =>
          i.productId === product.id ? { ...i, qty: i.qty + 1 } : i
        )
      );
    } else {
      setCart((items) => [
        ...items,
        {
          productId: product.id,
          qty: 1,
          price: defaultPrice,
        },
      ]);
    }
  }

  function updateQty(productId: number, qty: number) {
    const product = products.find((p) => p.id === productId)!;

    if (qty <= 0) {
      setCart((items) => items.filter((i) => i.productId !== productId));
      return;
    }

    if (qty > product.stock) {
      showNotice("الكمية المطلوبة أكبر من المخزون");
      return;
    }

    setCart((items) =>
      items.map((i) => (i.productId === productId ? { ...i, qty } : i))
    );
  }

  function updatePrice(productId: number, price: number) {
    const product = products.find((p) => p.id === productId)!;

    if (price < product.minPrice) {
      showNotice(`لا يمكن بيع ${product.name} بأقل من ${product.minPrice} ₪`);
      return;
    }

    setCart((items) =>
      items.map((i) => (i.productId === productId ? { ...i, price } : i))
    );
  }

  function validateInvoice() {
    if (cart.length === 0) {
      return "لا يمكن ترحيل فاتورة بدون أصناف";
    }

    if (saleType === "debt" && customerId === 1) {
      return "لا يمكن تسجيل دين بدون اختيار زبون";
    }

    for (const row of cartRows) {
      if (row.qty > row.product.stock) {
        return `الكمية أكبر من المخزون للصنف: ${row.product.name}`;
      }

      if (row.price < row.product.minPrice) {
        return `سعر ${row.product.name} أقل من الحد المسموح`;
      }
    }

    if (total < totalCost) {
      return "لا يمكن ترحيل الفاتورة لأن الخصم جعل الإجمالي أقل من التكلفة";
    }

    return "";
  }

  function postInvoice(printAfter: boolean) {
    const error = validateInvoice();

    if (error) {
      showNotice(error);
      return;
    }

    showNotice(printAfter ? "تم ترحيل الفاتورة وجاري الطباعة" : "تم ترحيل الفاتورة");

    if (printAfter) {
      setTimeout(() => window.print(), 300);
    }

    setCart([]);
    setDiscount(0);
    setSaleType("cash");
    setCustomerId(1);
  }

  return (
    <main className="posPage" dir="rtl">
      {notice && <div className="toast">{notice}</div>}

      <header className="posHeader no-print">
        <div>
         <h1>Gas POS</h1>
        <p>نقطة بيع غازات المجيد</p>
        </div>
        <div className="headerStats">
          <span>آخر مزامنة: الآن</span>
        </div>
      </header>

      <section className="posLayout">
        <aside className="productsPanel no-print">
          <div className="panelTitle">
            <h2>الأصناف</h2>
            <span>{products.length} صنف</span>
          </div>

          <div className="productsGrid">
            {products.map((product) => (
              <button
                key={product.id}
                className="productCard"
                onClick={() => addToCart(product)}
              >
                <div className="productImage">{product.image}</div>
                <h3>{product.name}</h3>
                <p>{product.category}</p>
                <div className="productMeta">
                  <b>{product.price} ₪</b>
                  <span>مخزون: {product.stock}</span>
                </div>
              </button>
            ))}
          </div>
        </aside>

        <section className="invoicePanel">
          <div className="invoiceTop">
            <div>
              <h2>فاتورة بيع</h2>
              <p>رقم مؤقت: INV-DEMO</p>
            </div>
          </div>

          <div className="saleOptions no-print">
            <label>
              الزبون
              <select
                value={customerId}
                onChange={(e) => setCustomerId(Number(e.target.value))}
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.type === "wholesale" ? "- جملة" : ""}
                  </option>
                ))}
              </select>
            </label>

            <label>
              نوع البيع
              <select
                value={saleType}
                onChange={(e) => setSaleType(e.target.value as "cash" | "debt")}
              >
                <option value="cash">نقدي</option>
                <option value="debt">دين</option>
              </select>
            </label>
          </div>

          <div className="invoiceTableWrap">
            <table className="invoiceTable">
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
                {cartRows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="emptyCart">
                      اضغط على صنف لإضافته للفاتورة
                    </td>
                  </tr>
                ) : (
                  cartRows.map((row) => (
                    <tr key={row.productId}>
                      <td>
                        <div className="itemName">
                          <span>{row.product.image}</span>
                          <b>{row.product.name}</b>
                        </div>
                      </td>

                      <td>
                        <input
                          className="smallInput"
                          type="number"
                          value={row.qty}
                          onChange={(e) =>
                            updateQty(row.productId, Number(e.target.value))
                          }
                        />
                      </td>

                      <td>
                        <input
                          className="priceInput"
                          type="number"
                          value={row.price}
                          onChange={(e) =>
                            updatePrice(row.productId, Number(e.target.value))
                          }
                        />
                      </td>

                      <td>{row.lineTotal} ₪</td>

                      <td className="no-print">
                        <button
                          className="removeBtn"
                          onClick={() => updateQty(row.productId, 0)}
                        >
                          حذف
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="totalsBox">
            <div>
              <span>المجموع</span>
              <b>{subtotal} ₪</b>
            </div>

            <label className="discountRow no-print">
              <span>خصم</span>
              <input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
              />
            </label>

            <div>
              <span>التكلفة</span>
              <b>{totalCost} ₪</b>
            </div>

            <div>
              <span>الربح</span>
              <b>{profit} ₪</b>
            </div>

            <div className="grandTotal">
              <span>الصافي</span>
              <b>{total} ₪</b>
            </div>
          </div>

          <div className="actionButtons no-print">
            <button className="secondaryBtn" onClick={() => postInvoice(false)}>
              ترحيل فقط
            </button>

            <button className="primaryBtn" onClick={() => postInvoice(true)}>
              طباعة وترحيل
            </button>
          </div>
        </section>
      </section>
    </main>
  );
}