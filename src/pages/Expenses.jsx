import { useState, useEffect } from "react";
import { collection, addDoc, getDocs, getDoc, updateDoc, deleteDoc, doc, query, where } from "firebase/firestore";
import { db, auth } from "../firebase";
import { v4 as uuidv4 } from 'uuid';


export default function Expenses({ user }) {
  const [expenses, setExpenses] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [form, setForm] = useState({ category: "", description: "", amount: 0 });
  const [editForm, setEditForm] = useState({ category: "", description: "", amount: 0 });
  const [formFilter, setFormFilter] = useState({
    category: "", sortBy: "newest", date: { start: getFirstDayOfMonth(), end: getLastDayOfMonth() }
  });
  const [applyButton, setApplyButton] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      let updatedExpenses = [];
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        updatedExpenses = snap.data().expenses;
        setExpenses(snap.data().expenses)
      }
      
      // console.log(updatedExpenses);

      const filterStart = new Date(getFirstDayOfMonth()).getTime();
      const filterEnd = new Date(getLastDayOfMonth()).getTime();

      setFormFilter({...formFilter, date: {...formFilter.date, start: getFirstDayOfMonth(), end: getLastDayOfMonth()}});

      updatedExpenses = updatedExpenses.filter((e) => {
        const dbDate = new Date(e.date).getTime();
        return (filterStart && dbDate >= filterStart) || (filterEnd && dbDate <= filterEnd);
      });

      setFiltered(updatedExpenses);
    };
    fetchData();
  }, [expenses, filtered]);

  async function loadExpenses() {
    
  }

  function getFirstDayOfMonth() {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  }

  function getLastDayOfMonth() {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
  }

  // add new expense
  async function addExpense() {
    const newExp = { ...form, amount: +form.amount, id: uuidv4(), date: new Date().toISOString() };
    const updated = [...expenses, newExp];
    await updateDoc(doc(db, "users", user.uid), { expenses: updated });
    setExpenses(updated);
  }
  
  // edit expense
  const editExpense = async (e) =>{
    setEditForm({...e})
    // set display of edit form
  }
  
  // save edited expense
  const handleSave = async (id) => {
    const updated = expenses.map(e => {
        if (e.id === id) {
            return {...e, ...editForm}
        }
        return e;
    })
    await updateDoc(doc(db, "users", user.uid), { expenses: updated });
    setExpenses(updated);
  }

  // display form filter
  const showFormFilter = () => {

  }

  // update sortBy in formFilter
  const handleRadioChange = (e) => {
    setApplyButton(false)
    setFormFilter({...formFilter, sortBy: e.target.value})
  }

  // save form filter changes
  const saveFilters = () => {
    let updated = expenses

    // category filter
    if (formFilter.category) {
      updated = expenses.filter(e => {
        return (e.category === formFilter.category)
      })
    } else updated = expenses

    // date filter
    const filterStart = formFilter.date.start ? new Date(formFilter.date.start).getTime() : ""
    const filterEnd = formFilter.date.end ? new Date(formFilter.date.end).getTime() : ""

    if (filterStart || filterEnd) {
      updated = updated.filter(e => {
        const dbDate = new Date(e.date).getTime()
        return (filterStart && dbDate >= filterStart || filterEnd && dbDate <= filterEnd)
      })
    }

    // sortBy filter
    if (formFilter.sortBy === "oldest") {
      updated.sort((a, b) => new Date(a.date).getTime - new Date(b.date).getTime)
    } else if (formFilter.sortBy === "newest") {
      updated.sort((a, b) => new Date(b.date).getTime - new Date(a.date).getTime)
    } else if (formFilter.sortBy === "largest amount") {
      updated.sort((a, b) => b.amount - a.amount);
    } else if (formFilter.sortBy === "smallest amount") {
      updated.sort((a, b) => a.amount - b.amount)
    }

    setFiltered(updated);
    setApplyButton(false);
  }

  // reset filters to default
  const defaultFilter = () => {
    setFiltered(expenses)
    setFormFilter({...formFilter, category: "", sortBy: "newest", date: {...formFilter.date, start: "", end: ""}})
  }
    
  // delete an expense
  const deleteExpense = async (id) => {
    try {
      const updated = expenses.filter((e) => e.id !== id);
      setExpenses(updated);
      await updateDoc(doc(db, "users", user.uid), {expenses: updated});
    } catch (err) {
      console.error("Error deleting expense:", err);
    }
  };

  const sortByList = ["newest", "oldest", "largest amount", "smallest amount"]

  return (
    <div>
      <h2>Expenses</h2>
      <button onClick={addExpense}>Add Expense</button>

      {/* filter */}
      <button onClick={showFormFilter}>Filters</button>
      <form>
        <label htmlFor="category">Category: </label>
        <select
          id="category"
          value={formFilter.category}
          onChange={(e) => {
            setApplyButton(false);
            setFormFilter({...formFilter, category: e.target.value});
          }}>
          <option value="">Select Category</option>
          <option value="Food">Food</option>
          <option value="Rent">Rent</option>
          <option value="Transport">Transport</option>
          <option value="Entertainment">Entertainment</option>
          <option value="Utilities">Utilities</option>
        </select>

        {sortByList.map((opt) => (
          <label key={opt}>
            <input type="radio" name="opt" value={opt} checked={formFilter.sortBy === opt} onChange={handleRadioChange} />
            {opt}
          </label>
        ))}

        <label htmlFor="start">Start Date</label>
        <input
          type="date"
          name=""
          id="start"
          value={formFilter.date.start}
          onChange={(e) => {
            setApplyButton(false);
            setFormFilter({...formFilter, date: {...formFilter.date, start: e.target.value}});
          }}
        />

        <label htmlFor="end">End Date</label>
        <input
          type="date"
          name=""
          id="end"
          value={formFilter.date.end}
          onChange={(e) => {
            setApplyButton(false);
            setFormFilter({...formFilter, date: {...formFilter.date, end: e.target.value}});
          }}
        />
        <button onClick={saveFilters} disabled={applyButton === true}>
          Apply
        </button>
        <button onClick={defaultFilter}>Reset to Default</button>
      </form>

      {/* New expense form */}
      <select value={form.category} onChange={(e) => setForm({...form, category: e.target.value})}>
        <option value="None">Select Category</option>
        <option value="Food">Food</option>
        <option value="Rent">Rent</option>
        <option value="Transport">Transport</option>
        <option value="Entertainment">Entertainment</option>
        <option value="Utilities">Utilities</option>
      </select>
      <input placeholder="Description" onChange={(e) => setForm({...form, description: e.target.value})} />
      <input placeholder="Amount" type="number" onChange={(e) => setForm({...form, amount: e.target.value})} />

      {/* expenses list */}
      {filtered.map((e, idx) => (
        <div key={idx}>
          <span>{e.category}</span> - <span>₦{e.amount}</span>
          <div>{e.description}</div>
          {/* <p>{new Date (e.date).toISOString().slice(0, 16).replace("T", " ")}</p> */}
          <p>
            {new Date(e.date).toLocaleString("en-US", {
              timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              year: "numeric",
              month: "short",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          <button onClick={() => deleteExpense(e.id)}>Delete</button>
          <button onClick={() => editExpense(e)}>Edit</button>
          {/* edit form */}
          <form>
            <input placeholder="Category" value={editForm.category} onChange={(e) => setEditForm({...editForm, category: e.target.value})} />
            <input placeholder="Description" value={editForm.description} onChange={(e) => setEditForm({...editForm, description: e.target.value})} />
            <input placeholder="Amount" type="number" value={editForm.amount} onChange={(e) => setEditForm({...editForm, amount: e.target.value})} />
            <button onClick={() => handleSave(e.id)}>Save</button>
          </form>
        </div>
      ))}
    </div>
  );
}
