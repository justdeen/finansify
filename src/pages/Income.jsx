import { useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function Income({ user }) {
  const [incomes, setIncomes] = useState([]);
  const [form, setForm] = useState({ category: "", description: "", amount: 0 });

  useEffect(() => {
    loadIncomes();
  }, []);

  async function loadIncomes() {
    const snap = await getDoc(doc(db, "users", user.uid));
    if (snap.exists()) setIncomes(snap.data().income || []);
  }

  async function addIncome() {
    const newIncome = { ...form, amount: +form.amount, date: new Date().toISOString() };
    const updated = [...incomes, newIncome];
    await updateDoc(doc(db, "users", user.uid), { income: updated });
    setIncomes(updated);
  }

  return (
    <div>
      <h2>Income</h2>
      <input placeholder="Category" onChange={e => setForm({...form, category: e.target.value})} />
      <input placeholder="Description" onChange={e => setForm({...form, description: e.target.value})} />
      <input placeholder="Amount" type="number" onChange={e => setForm({...form, amount: e.target.value})} />
      <button onClick={addIncome}>Add Income</button>

      {incomes.map((i, idx) => (
        <div key={idx}>{i.category} - ₦{i.amount} ({i.description})</div>
      ))}
    </div>
  );
}
