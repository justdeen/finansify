import { useState, useEffect, useRef } from "react";
import { collection, addDoc, getDocs, getDoc, updateDoc, deleteDoc, doc, query, where } from "firebase/firestore";
import { db, auth } from "../firebase";
import { v4 as uuidv4 } from 'uuid';


export default function Expenses({ user }) {
  const [expenses, setExpenses] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [form, setForm] = useState({ category: "", description: "", amount: "" });
  const [editForm, setEditForm] = useState({ category: "", description: "", amount: "" });
  const [formFilter, setFormFilter] = useState({
    category: "", sortBy: "newest", date: { start: getFirstDayOfMonth(), end: getLastDayOfMonth() }
  });
  const [totalExpenses, setTotalExpenses] = useState("");
  const [applyButton, setApplyButton] = useState(true);
  const [editingId, setEditingId] = useState(false);
  const [rstToDefaultButton, setRstToDefaultButton] = useState(true)
  const [showForm, setShowForm] = useState(false);
  const formRef = useRef(null);
  const filterButton = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      let updatedExpenses = [];
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        updatedExpenses = snap.data().expenses;
        setExpenses(updatedExpenses)
      }

      const filterStart = new Date(getFirstDayOfMonth()).getTime();
      const filterEnd = new Date(getLastDayOfMonth()).getTime();

      updatedExpenses = updatedExpenses.filter((e) => {
        const dbDate = new Date(e.date).getTime();
        return (filterStart && dbDate >= filterStart) || (filterEnd && dbDate <= filterEnd);
      });

      if (formFilter.sortBy === "newest") {
        updatedExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      }

      const total = updatedExpenses.reduce((sum, e) => sum + e.amount, 0);
      setTotalExpenses(total);

      setFiltered(updatedExpenses);
    };
    fetchData();
  }, []);

  // Overlay for formFilter
  useEffect(() => {
    function handleClickOutside(event) {
      if (formRef.current && !formRef.current.contains(event.target) && !filterButton.current.contains(event.target)) {
        setShowForm(false);
        return;
      }
   }
   if (showForm) {
       document.addEventListener("mousedown", handleClickOutside);
   } else {
     document.removeEventListener("mousedown", handleClickOutside);
   }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showForm]);

  function getFirstDayOfMonth() {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  }

  function getLastDayOfMonth() {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
  }

  const handleNewExpense = (e) => {
    e.preventDefault();
    if(!form.category || !form.description || !form.amount) return;
    addExpense();
  }

  // add new expense
  async function addExpense() {
    const newExp = { ...form, amount: parseInt(form.amount), id: uuidv4(), date: new Date().toISOString() };
    const updated = [...expenses, newExp];
    await updateDoc(doc(db, "users", user.uid), { expenses: updated });
    setExpenses(updated);
    setFiltered(updated);
    // toDefaultFilters();
    saveFilters(updated)
    setForm({ category: "", description: "", amount: "" })
  }
  
  // edit expense
  const editExpense = async (id) =>{
    const expenseToEdit = filtered.find(e => e.id === id);
    setEditForm({ ...expenseToEdit });
    setEditingId(id)
  }

  const applyEditChanges = (e) =>{
    e.preventDefault();
    handleSave(editingId);
  }

  const cancelEdit = () =>{
    setEditingId(false)
  }
  
  // save edited expense
  const handleSave = async (id) => {
    // console.log(filtered)
    const updated = expenses.map(e => {
        if (e.id === id) {
            return {...e, ...editForm, amount: parseInt(editForm.amount)}
        }
        return e;
    })
    setEditingId(false)
    setExpenses(updated);
    // setFiltered(updated);
    
    saveFilters(updated);
    // console.log(updated)
    await updateDoc(doc(db, "users", user.uid), { expenses: updated });
  }

  // update sortBy in formFilter
  const handleRadioChange = (e) => {
    setApplyButton(false)
    setRstToDefaultButton(false);
    setFormFilter({...formFilter, sortBy: e.target.value})
  }

  const applyFilterChanges = (e) => {
    e.preventDefault();
    // if(e.target)
    saveFilters()
  }

  // save form filter changes
  const saveFilters = (expensesToUse = expenses) => {
    if (!Array.isArray(expensesToUse)) {
      expensesToUse = Array.isArray(expenses) ? expenses : [];
    }
    let updated = [...expensesToUse]

    // category filter
    if (formFilter.category) {
      updated = expensesToUse.filter(e => {
        return (e.category === formFilter.category)
      })
    } else updated = expensesToUse

    // date filter
    const filterStart = formFilter.date.start ? new Date(formFilter.date.start).getTime() : ""
    const filterEnd = formFilter.date.end ? new Date(formFilter.date.end).getTime() : ""

    if (filterStart || filterEnd) {
      updated = updated.filter(e => {
        const dbDate = new Date(e.date).getTime()
        return (!filterStart || dbDate >= filterStart) && (!filterEnd || dbDate <= filterEnd);
      })
    }

    // sortBy filter
    if (formFilter.sortBy === "oldest") {
      updated.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    } else if (formFilter.sortBy === "newest") {
      updated.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    } else if (formFilter.sortBy === "largest amount") {
      updated.sort((a, b) => b.amount - a.amount);
    } else if (formFilter.sortBy === "smallest amount") {
      updated.sort((a, b) => a.amount - b.amount)
    }
    setFiltered(updated);
    setApplyButton(true);
    setRstToDefaultButton(false);

    const total = updated.reduce((sum, e) => sum + e.amount, 0);
    setTotalExpenses(total);
  }

  const toDefaultFilters = () => {
    const filterStart = new Date(getFirstDayOfMonth()).getTime();
    const filterEnd = new Date(getLastDayOfMonth()).getTime();

    let updatedExpenses = expenses;
    updatedExpenses = updatedExpenses.filter((e) => {
      const dbDate = new Date(e.date).getTime();
      return (!filterStart || dbDate >= filterStart) && (!filterEnd || dbDate <= filterEnd);
    });

    updatedExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    setFormFilter({
      category: "",
      sortBy: "newest",
      date: {start: getFirstDayOfMonth(), end: getLastDayOfMonth()},
    });

    const total = updatedExpenses.reduce((sum, e) => sum + e.amount, 0);
    setTotalExpenses(total);
    
    setFiltered(updatedExpenses);
    setRstToDefaultButton(true)
  };

  // reset filters to default
  const defaultFilter = () => {
    toDefaultFilters();
    setApplyButton(true)
  }
    
  // delete an expense
  const deleteExpense = async (id) => {
    try {
      const updated = expenses.filter((e) => e.id !== id);
      setExpenses(updated);
      setFiltered(updated)
      await updateDoc(doc(db, "users", user.uid), {expenses: updated});
      saveFilters(updated)
    } catch (err) {
      console.error("Error deleting expense:", err);
    }
  };

  const sortByList = ["newest", "oldest", "largest amount", "smallest amount"]

  return (
    <div>
      <h2>Expenses</h2>

      {/* filter */}
    <button ref={filterButton} onClick={() => setShowForm((prev) => !prev)}>Filters</button>

      <br />
      <br />

      {showForm && <div ref={formRef}
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}>
        <form className="formFilter" onSubmit={applyFilterChanges}>
          <label htmlFor="category">Category: </label>
          <select
            id="category"
            value={formFilter.category}
            onChange={(e) => {
              setApplyButton(false);
              setRstToDefaultButton(false);
              setFormFilter({...formFilter, category: e.target.value});
            }}>
            <option value="">All</option>
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
              setRstToDefaultButton(false);
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
              setRstToDefaultButton(false);
              setFormFilter({...formFilter, date: {...formFilter.date, end: e.target.value}});
            }}
          />
          <button type="submit" onClick={saveFilters} disabled={applyButton === true}>
            Apply
          </button>
          <button type="button" onClick={defaultFilter} disabled={rstToDefaultButton === true}>
            Reset to Default
          </button>
        </form>
      </div>}

      <br />
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

      <br />
      {/* Total expenses; */}
      <div><b>Total expenses: ₦{totalExpenses}</b></div>
      <br />

      {/* expenses list */}
      {filtered.map((e, idx) => (
        <div key={idx}>
          {editingId !== e.id && <div>
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
            <button onClick={() => editExpense(e.id)}>Edit</button>
          </div>}
          {/* edit form */}
          {editingId === e.id && (
            <form onSubmit={applyEditChanges}>
              <select value={editForm.category} onChange={(e) => setEditForm({...editForm, category: e.target.value})}>
                <option value="None">Select Category</option>
                <option value="Food">Food</option>
                <option value="Rent">Rent</option>
                <option value="Transport">Transport</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Utilities">Utilities</option>
              </select>
              <input placeholder="Description" value={editForm.description} onChange={(e) => setEditForm({...editForm, description: e.target.value})} />
              <input placeholder="Amount" type="number" value={editForm.amount} onChange={(e) => setEditForm({...editForm, amount: e.target.value})} />
              <button type="submit">Save</button>
              {/* <button type="submit" onClick={() => handleSave(e.id)}>Save</button> */}
              <button type="button" onClick={() => cancelEdit(e.id)}>Cancel</button>
            </form>
          )}
        </div>
      ))}
    </div>
  );
}
