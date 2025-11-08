import {useState, useEffect, useRef} from "react";
import {collection, addDoc, getDocs, getDoc, updateDoc, deleteDoc, doc, query, where} from "firebase/firestore";
import {db, auth} from "../firebase";
import {v4 as uuidv4} from "uuid";

export default function ExpensesNew({user, expenses, filtered, totalExpenses, setExpenses, setFiltered, saveFilters}) {
  const [form, setForm] = useState({ category: "", description: "", amount: "" });

  const handleNewExpense = (e) => {
    e.preventDefault();
    if (!form.category || !form.description || !form.amount) return;
    addExpense();
  };

  // add new expense
  async function addExpense() {
    const newExp = {...form, amount: parseInt(form.amount), id: uuidv4(), date: new Date().toISOString()};
    const updated = [...expenses, newExp];
    await updateDoc(doc(db, "users", user.uid), {expenses: updated});
    setExpenses(updated);
    setFiltered(updated);
    saveFilters(updated);
    setForm({category: "", description: "", amount: ""});
  }

  return (
    <form onSubmit={handleNewExpense}>
      {/* Add new expense button */}
      <button type="submit">Add Expense</button>
      {/* New expense form */}
      <select value={form.category} onChange={(e) => setForm({...form, category: e.target.value})} required>
        <option value="">Select Category</option>
        <option value="Food">Food</option>
        <option value="Rent">Rent</option>
        <option value="Transport">Transport</option>
        <option value="Entertainment">Entertainment</option>
        <option value="Utilities">Utilities</option>
      </select>
      <input placeholder="Description" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} required />
      <input placeholder="Amount" type="number" value={form.amount} onChange={(e) => setForm({...form, amount: e.target.value})} required />
    </form>
  );
}
