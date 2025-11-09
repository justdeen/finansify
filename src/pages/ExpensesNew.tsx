import {useState, useEffect, useRef} from "react";
import {collection, addDoc, getDocs, getDoc, updateDoc, deleteDoc, doc, query, where} from "firebase/firestore";
import {db, auth} from "../firebase";
import {v4 as uuidv4} from "uuid";

interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  edited: boolean;
}

interface FormData {
  category: string;
  description: string;
  amount: string;
}

interface ExpensesNewProps {
  user: { uid: string };
  expenses: Expense[];
  filtered: Expense[];
  totalExpenses: number;
  batchDelete: boolean;
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  setFiltered: React.Dispatch<React.SetStateAction<Expense[]>>;
  saveFilters: (updated: Expense[]) => void;
}

export default function ExpensesNew({
  user,
  expenses,
  filtered,
  totalExpenses,
  batchDelete,
  setExpenses,
  setFiltered,
  saveFilters,
}: ExpensesNewProps) {
  const [form, setForm] = useState({ category: "", description: "", amount: "" });
  const [newExpForm, setNewExpForm] = useState(false)

  const showForm = () => {
    setNewExpForm(true)
  }

  const cancel = ()=> {
    setNewExpForm(false)
    setForm({category: "", description: "", amount: ""})
  }

  const handleNewExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.category || !form.description || !form.amount) return;
    addExpense();
  };

  async function addExpense() {
    const newExp = {...form, amount: parseInt(form.amount), id: uuidv4(), date: new Date().toISOString(), edited: false};
    const updated = [...expenses, newExp];
    await updateDoc(doc(db, "users", user.uid), {expenses: updated});
    setExpenses(updated);
    setFiltered(updated);
    saveFilters(updated);
    setForm({category: "", description: "", amount: ""});
    setNewExpForm(false)
  }

  return (
    <form onSubmit={handleNewExpense}>
      <button onClick={showForm}>Add Expense</button>
      
      {newExpForm && <div>
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
        <button type="submit" disabled={batchDelete}>Save</button>
        <button onClick={cancel} type="button">Cancel</button>
      </div>}
    </form>
  );
}
