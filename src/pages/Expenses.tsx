import { useState, useEffect, useRef } from "react";
import { collection, addDoc, getDocs, getDoc, updateDoc, deleteDoc, doc, query, where } from "firebase/firestore";
import { db, auth } from "../firebase";
import { v4 as uuidv4 } from 'uuid';
import {ConfigProvider, theme, Form, Input, Button, InputNumber, Select, Flex} from "antd";
import "./Expenses.css"

interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  edited: boolean;
}

interface ExpensesProps {
  user: { uid: string }; // only uid needed here
  expenses: Expense[];
  filtered: Expense[];
  totalExpenses: number;
  batchDelete: boolean;
  setBatchDelete: React.Dispatch<React.SetStateAction<boolean>>
  setShowForm: React.Dispatch<React.SetStateAction<boolean>>
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  setFiltered: React.Dispatch<React.SetStateAction<Expense[]>>;
  saveFilters: (updated: Expense[]) => void;
  filterButton: React.RefObject<HTMLButtonElement | null>;
}

export default function Expenses({
  user,
  expenses,
  filtered,
  totalExpenses,
  batchDelete,
  setBatchDelete,
  setShowForm,
  setExpenses,
  setFiltered,
  saveFilters,
  filterButton
}: ExpensesProps) {
  const [form, setForm] = useState({ category: "", description: "", amount: "" });
  const [editForm, setEditForm] = useState<Expense | Omit<Expense, "id" | "date" | "edited">>({
    category: "",
    description: "",
    amount: 0,
  });
  const [editingId, setEditingId] = useState<string | false>(false);
  // const [batchDelete, setBatchDelete] = useState(false);
  const [expsToDelete, setExpsToDelete] = useState<string[]>([]);
  const [batchDeleteBtnText, setBatchDeleteBtnText] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [selectAll, setSelectAll] = useState(false)
  const [confirmSingleDelete, setConfirmSingleDelete] = useState<{ show: boolean, id: string }>({ show: false, id: "" });
  const [saveButton, setSaveButton] = useState(true)
  const [formSubmit] = Form.useForm();
  
  // edit expense
  const editExpense = (id: string) => {
    const expenseToEdit = filtered.find((e) => e.id === id);
    if (expenseToEdit) {
      // setEditForm({ ...expenseToEdit });
      formSubmit.setFieldsValue({ ...expenseToEdit });
      setEditingId(id);
    }
  };

  const onFinish = (values: any) => {
    if (editingId) handleSave(editingId, values);
  }

  // const applyEditChanges = (e: React.FormEvent<HTMLFormElement>) =>{
  //   e.preventDefault();
  //   if (editingId) handleSave(editingId);
  // }

  const cancelEdit = () =>{
    setEditingId(false)
  }
  
  // save edited expense
  const handleSave = async (id: string, values: any) => {
    setSaveButton(true);
    const updated = expenses.map(e => {
        if (e.id === id) {
            return {...e, ...values, edited: true}
        }
        return e;
    })
    setEditingId(false)
    setExpenses(updated);
    saveFilters(updated);
    await updateDoc(doc(db, "users", user.uid), { expenses: updated });
  }
    
  // delete an expense
  const deleteExpense = async (id: string) => {
    console.log(id)
    setConfirmSingleDelete({show: false, id: ""})
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
    setEditingId("")
    if(!batchDeleteBtnText){
      setBatchDeleteBtnText(true)
      setBatchDelete(false)
      setExpsToDelete([])
      setSelectAll(false)
    }
  }

  const singleDelete = (id: string) =>{
    setConfirmSingleDelete({ show: true, id });
    console.log(id)
  }

  const cancelSingleDelete = () => {
    setConfirmSingleDelete({show: false, id: ""});
  }

  const selectItems = (id: string) => {
    const exp = expsToDelete.find(e => e === id)
    if (exp) {
      const updated = expsToDelete.filter((e) => e !== id);
      setExpsToDelete(updated);
      // If any item is unchecked, uncheck select all
      setSelectAll(false);
    } else {
      const updated = [...expsToDelete, id];
      setExpsToDelete(updated);
      if (updated.length === filtered.length && filtered.length > 0) {
        setSelectAll(true);
      }
    }    
  }

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      // Select all filtered expenses
      const allIds = filtered.map((e) => e.id);
      setExpsToDelete(allIds);
    } else {
      // Deselect all
      setExpsToDelete([]);
    }
  };

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
    setSelectAll(false);
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
      <div>
        <b>Total expenses: ₦{totalExpenses}</b>
      </div>
      <br />

      <ConfigProvider
        theme={{
          algorithm: theme.darkAlgorithm, // 👈 Enables dark mode
        }}>
        <div style={{display: 'flex', alignItems: 'center'}}>
          <Button
            className="filter"
            ref={filterButton}
            disabled={batchDelete}
            onClick={() => setShowForm((prev) => !prev)}
            variant="outlined"
            color="default"
            style={
              {
                // border: "1px solid white",
              }
            }>
            <img
              src="/src/assets/filter.png"
              style={{
                width: "14px",
                height: "14px",
                // display: "inline",
              }}
              alt=""
            />
          </Button>
          <Button
            className="bin"
            onClick={showBatchDelete}
            variant="outlined"
            color="danger"
            style={{
              marginLeft: "10px",
            }}>
            {batchDeleteBtnText ? (
              <img
                src="/src/assets/bin.png"
                style={{
                  width: "14px",
                  height: "14px",
                  // display: "inline",
                }}
                alt=""
              />
            ) : (
              "Cancel"
            )}
          </Button>
          {!batchDeleteBtnText && <Button
          style={{marginLeft: '10px', outline: 'none', border: 'none'}}
          variant="solid"
          color="danger"
          onClick={deleteRequest}>
            Delete
          </Button>}
        </div>

        {/* <br /> */}

        {!batchDeleteBtnText && (
          <>
            <label style={{display: 'block', marginTop: '10px'}}>
              <input
                type="checkbox"
                checked={selectAll}
                onChange={(e) => handleSelectAll(e.target.checked)}
              />
              Select All
            </label>
          </>
        )}
      </ConfigProvider>

      {/* <button
        // ref={filterButton}
        disabled={batchDelete}
        style={{marginRight: "15px"}}
        onClick={() => setShowForm((prev) => !prev)}>
        Filters
      </button>
      <button onClick={showBatchDelete}>{batchDeleteBtnText ? "Batch Delete" : "Cancel"}</button> */}

      {confirmDelete && (
        <div className="confirmDelete">
          <div className="popup">
            <p>The selected expense(s) will be deleted permanently!</p>
            <div>
              <button onClick={cancelDeleteRequest}>Cancel</button>
              <button onClick={handleDeleteExps}>Delete</button>
            </div>
          </div>
        </div>
      )}

      <br />

      {!filtered[0] && <p>No expenses yet!</p>}

      {/* expenses list */}
      {filtered.map((e, idx) => (
        <div className="expense" key={idx}>
          {editingId !== e.id && (
            <div>
              {batchDelete && (
                <div>
                  <label htmlFor={idx.toString()}>Delete</label>
                  <input
                    id={idx.toString()}
                    type="checkbox"
                    checked={expsToDelete.includes(e.id)}
                    onChange={() => selectItems(e.id)}
                  />
                </div>
              )}
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
                {e.edited && (
                  <span>
                    {" "}
                    - <i>edited</i>
                  </span>
                )}
              </p>
              <Button
                className="newExpBtn"
                type="primary"
                disabled={batchDelete}
                onClick={() => editExpense(e.id)}
                style={{
                  fontWeight: "500",
                  fontSize: "13px",
                  border: "none",
                  marginRight: "10px",
                }}>
                Edit
              </Button>
              <Button
                className="newExpBtn"
                type="primary"
                disabled={batchDelete}
                onClick={() => singleDelete(e.id)}
                style={{
                  fontWeight: "500",
                  fontSize: "13px",
                  border: "none",
                }}
                danger>
                Delete
              </Button>
              {confirmSingleDelete.show && (
                <div className="singleDeletePopup">
                  <div className="popup2">
                    <p>The selected expense will be deleted permanently!</p>
                    <div>
                      <button onClick={cancelSingleDelete}>Cancel</button>
                      <button onClick={() => deleteExpense(confirmSingleDelete.id)}>Delete</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* edit form */}
          {editingId === e.id && (
            <ConfigProvider
              theme={{
                algorithm: theme.darkAlgorithm, // 👈 Enables dark mode
              }}>
              <Form
                form={formSubmit}
                name="trigger"
                style={{maxWidth: 600}}
                layout="vertical"
                onFinish={onFinish}
                autoComplete="on">
                <Form.Item name="category" label="Category" rules={[{required: true}]}>
                  <Select
                    allowClear
                    placeholder="Select a category"
                    options={[
                      {label: "Food", value: "Food"},
                      {label: "Rent", value: "Rent"},
                      {label: "Transport", value: "Transport"},
                      {label: "Utilities", value: "Utilities"},
                      {label: "Other", value: "Other"},
                    ]}
                    onChange={() => setSaveButton(false)}
                  />
                </Form.Item>
                <Form.Item
                  hasFeedback
                  label="Description"
                  name="description"
                  validateFirst
                  rules={[{required: true, min: 3, max: 70}]}>
                  <Input placeholder="Enter description" onChange={() => setSaveButton(false)} />
                </Form.Item>

                <Form.Item
                  hasFeedback
                  label="Amount"
                  name="amount"
                  validateFirst
                  style={{width: "100%"}}
                  rules={[{required: true, type: "number", min: 1}]}>
                  <InputNumber
                    style={{width: "100%"}}
                    placeholder="Enter amount"
                    onChange={() => setSaveButton(false)}
                  />
                </Form.Item>

                <Flex gap="middle" style={{width: "100%"}}>
                  <Button
                    className="newExpBtn"
                    type="primary"
                    htmlType="submit"
                    disabled={saveButton}
                    // onClick={() => handleSave(e.id)}
                    style={{
                      fontWeight: "500",
                      fontSize: "13px",
                      border: "none",
                    }}>
                    Save
                  </Button>
                  <Button
                    className="newExpBtn"
                    type="primary"
                    color="danger"
                    onClick={() => {
                      cancelEdit();
                      setSaveButton(true);
                    }}
                    style={{
                      fontWeight: "500",
                      fontSize: "13px",
                      border: "none",
                    }}
                    danger>
                    Cancel
                  </Button>
                </Flex>
              </Form>
            </ConfigProvider>
          )}
        </div>
      ))}
    </div>
  );
}
