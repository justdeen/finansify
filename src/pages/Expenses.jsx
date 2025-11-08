import { useState, useEffect, useRef } from "react";
import { collection, addDoc, getDocs, getDoc, updateDoc, deleteDoc, doc, query, where } from "firebase/firestore";
import { db, auth } from "../firebase";
import { v4 as uuidv4 } from 'uuid';
import "./Expenses.css"

export default function Expenses({ user, expenses, filtered, totalExpenses, setExpenses, setFiltered, saveFilters }) {
  const [form, setForm] = useState({ category: "", description: "", amount: "" });
  const [editForm, setEditForm] = useState({ category: "", description: "", amount: "" });
  const [editingId, setEditingId] = useState(false);
  const [batchDelete, setBatchDelete] = useState(false)
  const [expsToDelete, setExpsToDelete] = useState([])
  const [batchDeleteBtnText, setBatchDeleteBtnText] = useState(true)
  const [confirmDelete, setConfirmDelete] = useState(false)
  
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
    const updated = expenses.map(e => {
        if (e.id === id) {
            return {...e, ...editForm, amount: parseInt(editForm.amount)}
        }
        return e;
    })
    setEditingId(false)
    setExpenses(updated);
    saveFilters(updated);
    await updateDoc(doc(db, "users", user.uid), { expenses: updated });
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

  const showBatchDelete = () => {
    setBatchDelete(true)
    setBatchDeleteBtnText(false)
    if(!batchDeleteBtnText){
      setBatchDeleteBtnText(true)
      setBatchDelete(false)
      setExpsToDelete([])
    }
  }

  const selectItems = (id) => {
    const exp = expsToDelete.find(e => e === id)
    if(exp){
      setExpsToDelete((prev) => {
        return prev.filter(e => e !== id)
      })
    } else {
      setExpsToDelete([...expsToDelete, id])
    }    
  }

  const deleteRequest = () => {
    if(!expsToDelete[0]){
      alert("Select expenses to delete!")
      return;
    }
    setConfirmDelete(true)
  }

  const cancelDeleteRequest = () => {
    setConfirmDelete(false)
  }

  const handleDeleteExps = async () => {
    setConfirmDelete(false)
    setBatchDeleteBtnText(true);
    setBatchDelete(false);
    setExpsToDelete([]);
    const remainingExpenses = expenses.filter((expense) => !expsToDelete.includes(expense.id));
    setExpenses(remainingExpenses);
    setFiltered(remainingExpenses);
    await updateDoc(doc(db, "users", user.uid), {expenses: remainingExpenses});
    saveFilters(remainingExpenses);
  };

  return (
    <div>
      <br />
      {/* Total expenses; */}
      <div><b>Total expenses: ₦{totalExpenses}</b></div>
      <br />

      <button onClick={showBatchDelete}>{batchDeleteBtnText ? "Batch Delete" : "Cancel"}</button>
      {!batchDeleteBtnText && <button onClick={deleteRequest}>Delete</button>}
      {confirmDelete && <div className="confirmDelete">
        <div className="popup">
          <p>The selected expense(s) will be deleted permanently!</p>
          <div>
            <button onClick={cancelDeleteRequest}>Cancel</button>
            <button onClick={handleDeleteExps}>Delete</button>
          </div>
        </div>
      </div>}

      <br />
      <br />

      {/* expenses list */}
      {filtered.map((e, idx) => (
        <div className="expense" key={idx}>
          {editingId !== e.id && <div>
            {batchDelete && 
              <div>
                <label htmlFor={idx}>Delete</label>
                <input id={idx} type="checkbox" onChange={() => selectItems(e.id)} />
              </div>
            }
            <span>{e.category}</span> - <span>₦{e.amount}</span>
            <div>{e.description}</div>
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
            <button disabled={batchDelete === true} onClick={() => deleteExpense(e.id)}>Delete</button>
            <button disabled={batchDelete === true} onClick={() => editExpense(e.id)}>Edit</button>
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
