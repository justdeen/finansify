import { useState, useEffect, useRef } from "react";
import { collection, addDoc, getDocs, getDoc, updateDoc, deleteDoc, doc, query, where } from "firebase/firestore";
import { db, auth } from "../firebase";
import { v4 as uuidv4 } from 'uuid';
import {
  ConfigProvider,
  theme,
  Form,
  Input,
  Button,
  InputNumber,
  Select,
  Flex,
  Tag,
  Pagination,
  Empty,
  message,
} from "antd";
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
  const [form, setForm] = useState({category: "", description: "", amount: ""});
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
  const [selectAll, setSelectAll] = useState(false);
  const [confirmSingleDelete, setConfirmSingleDelete] = useState<{show: boolean; id: string}>({
    show: false,
    id: "",
  });
  const [saveButton, setSaveButton] = useState(true);
  const [formSubmit] = Form.useForm();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6); // show 6 expenses per page

  useEffect(() => {
    setCurrentPage(1);
  }, [filtered]);

  const [messageApi, contextHolder] = message.useMessage();
  message.config({
    top: 100,
    duration: 2,
  });
  
   const editToast = () => {
    messageApi.open({
      type: 'success',
      content: 'Expense saved successfully!',
      // className: 'custom-class',
      style: {
        marginTop: '5vh',
        
      },
    });
  };

  const deleteToast = () => {
    messageApi.open({
      type: 'success',
      content: 'Expense(s) deleted successfully!',
      // className: 'custom-class',
      style: {
        marginTop: '5vh',
        
      },
    });
  };
  
  const deleteErrToast = () => {
    messageApi.open({
      type: 'error',
      content: 'Select expense(s)!',
      // className: 'custom-class',
      style: {
        marginTop: '5vh',
        
      },
    });
  };

  // edit expense
  const editExpense = (id: string) => {
    const expenseToEdit = filtered.find((e) => e.id === id);
    if (expenseToEdit) {
      // setEditForm({ ...expenseToEdit });
      formSubmit.setFieldsValue({...expenseToEdit});
      setEditingId(id);
    }
  };

  const onFinish = (values: any) => {
    if (editingId) handleSave(editingId, values);
  };

  // const applyEditChanges = (e: React.FormEvent<HTMLFormElement>) =>{
  //   e.preventDefault();
  //   if (editingId) handleSave(editingId);
  // }

  const cancelEdit = () => {
    setEditingId(false);
  };

  // save edited expense
  const handleSave = async (id: string, values: any) => {
    setSaveButton(true);
    const updated = expenses.map((e) => {
      if (e.id === id) {
        return {...e, ...values, edited: true};
      }
      return e;
    });
    setEditingId(false);
    setExpenses(updated);
    saveFilters(updated);
    editToast();
    await updateDoc(doc(db, "users", user.uid), {expenses: updated});
  };

  // delete an expense
  const deleteExpense = async (id: string) => {
    console.log(id);
    setConfirmSingleDelete({show: false, id: ""});
    try {
      const updated = expenses.filter((e) => e.id !== id);
      setExpenses(updated);
      setFiltered(updated);
      await updateDoc(doc(db, "users", user.uid), {expenses: updated});
      saveFilters(updated);
      deleteToast();
    } catch (err) {
      console.error("Error deleting expense:", err);
    }
  };

  const showBatchDelete = () => {
    setBatchDelete(true);
    setBatchDeleteBtnText(false);
    setEditingId("");
    if (!batchDeleteBtnText) {
      setBatchDeleteBtnText(true);
      setBatchDelete(false);
      setExpsToDelete([]);
      setSelectAll(false);
    }
  };

  const singleDelete = (id: string) => {
    setConfirmSingleDelete({show: true, id});
    console.log(id);
  };

  const cancelSingleDelete = () => {
    setConfirmSingleDelete({show: false, id: ""});
  };

  const selectItems = (id: string) => {
    const exp = expsToDelete.find((e) => e === id);
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
  };

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
    if (!expsToDelete[0]) {
      deleteErrToast();
      return;
    }
    setConfirmDelete(true);
  };

  const cancelDeleteRequest = () => {
    setConfirmDelete(false);
  };

  const handleDeleteExps = async () => {
    setConfirmDelete(false);
    setBatchDeleteBtnText(true);
    setBatchDelete(false);
    setExpsToDelete([]);
    setSelectAll(false);
    const remainingExpenses = expenses.filter((expense) => !expsToDelete.includes(expense.id));
    setExpenses(remainingExpenses);
    setFiltered(remainingExpenses);
    await updateDoc(doc(db, "users", user.uid), {expenses: remainingExpenses});
    saveFilters(remainingExpenses);
    deleteToast();
  };

  type CategoryKey = "Food" | "Rent" | "Transport" | "Utilities" | "Other";
  const cat: Record<CategoryKey, string> = {
    Food: "gold",
    Rent: "magenta",
    Transport: "cyan",
    Utilities: "purple",
    Other: "lime",
  };

  // const categories: Record<CategoryKey, string> = {
  //   Food: "Food",
  //   Rent: "Rent",
  //   Transport: "Transport",
  //   Utilities: "Utilities",
  //   Other: "Other",
  // };

  // Slice filtered expenses based on current page
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedExpenses = filtered.slice(startIndex, startIndex + pageSize);


  return (
    <div>
      <ConfigProvider theme={{
          algorithm: theme.darkAlgorithm, // 👈 Enables dark mode
        }}>
        <div style={{zIndex: "999999"}}>{contextHolder}</div>
      </ConfigProvider>
      <br />
      {/* Total expenses; */}
      <div style={{marginBottom: "13px"}}>
        <b>Total: ₦{totalExpenses.toLocaleString()}</b>
      </div>
      {/* <br /> */}

      <ConfigProvider
        theme={{
          algorithm: theme.darkAlgorithm, // 👈 Enables dark mode
        }}>
        <div style={{display: "flex", alignItems: "center"}}>
          <Button
            className="filter"
            ref={filterButton}
            disabled={batchDelete}
            onClick={() => setShowForm((prev) => !prev)}
            variant="outlined"
            color="primary"
            style={{}}>
            <img
              src="/src/assets/filter2.png"
              style={{
                width: "14px",
                height: "14px",
                // display: "inline",
              }}
              alt=""
            />
          </Button>
          {filtered[0] && (
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
          )}
          {!batchDeleteBtnText && (
            <Button
              style={{marginLeft: "10px", outline: "none", border: "none"}}
              variant="solid"
              color="danger"
              onClick={deleteRequest}>
              Delete
            </Button>
          )}
        </div>

        {/* <br /> */}

        {!batchDeleteBtnText && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginTop: "20px",
              padding: "6px 8px",
              borderRadius: "5px",
              width: "fit-content",
              backgroundColor: "#1677FF",
              fontSize: "14px",
              // fontWeight: "500"
            }}>
            <label htmlFor="all" style={{marginRight: "6px"}}>
              Select All
            </label>
            <input
              style={{marginTop: "2px"}}
              id="all"
              type="checkbox"
              checked={selectAll}
              onChange={(e) => handleSelectAll(e.target.checked)}
            />
          </div>
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
          <div className="popup2">
            <p>The selected expense(s) will be deleted permanently!</p>
            <div>
              <ConfigProvider
                theme={{
                  algorithm: theme.darkAlgorithm, // 👈 Enables dark mode
                }}>
                  <Button
                  variant="outlined" 
                  color="danger"
                  onClick={cancelDeleteRequest}
                  style={{outline: "none"}}>
                    Cancel
                  </Button>
                  <Button
                  variant="solid" 
                  color="danger"
                  onClick={handleDeleteExps}
                  style={{border: "none"}}>
                    Delete
                  </Button>
              </ConfigProvider>
              {/* <button onClick={cancelDeleteRequest}>Cancel</button>
              <button onClick={handleDeleteExps}>Delete</button> */}
            </div>
          </div>
        </div>
      )}

      <br />

      {/* {!filtered[0] && <p>No expenses yet!</p>} */}
      {!filtered[0] && (
        <ConfigProvider
          theme={{
            algorithm: theme.darkAlgorithm, // 👈 Enables dark mode
          }}>
          <Empty description="No expenses here!" />
        </ConfigProvider>
      )}

      {/* expenses list */}
      {paginatedExpenses.map((e, idx) => (
        <div className="expense" key={idx}>
          {editingId !== e.id && (
            <div>
              {/* {batchDelete && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "10px",
                    marginTop: "5px",
                    padding: "6px 8px",
                    borderRadius: "5px",
                    width: "fit-content",
                    border: "1px solid #1677FF",
                    fontSize: "14px",
                  }}>
                  <label style={{marginRight: "6px",}} htmlFor={idx.toString()}>Select</label>
                  <input
                    style={{marginTop: "2px"}}
                    id={idx.toString()}
                    type="checkbox"
                    checked={expsToDelete.includes(e.id)}
                    onChange={() => selectItems(e.id)}
                  />
                </div>
              )} */}

              <div style={{display: "flex", justifyContent: "space-between"}}>
                <div style={{fontWeight: "500", marginBottom: "8px"}}>
                  <ConfigProvider
                    theme={{
                      algorithm: theme.darkAlgorithm, // 👈 Enables dark mode
                    }}>
                    <Tag
                      style={{padding: "4px 7px", fontSize: "14px"}}
                      color={cat[e.category as CategoryKey]}>
                      {e.category} -<span> ₦{e.amount.toLocaleString()} </span>
                    </Tag>
                    {/* <span>{e.category}</span>  */}
                    {/* -<span> ₦{e.amount} </span> */}
                  </ConfigProvider>
                </div>
                {!batchDelete && (
                  <div>
                    <ConfigProvider
                      theme={{
                        algorithm: theme.darkAlgorithm, // 👈 Enables dark mode
                      }}>
                      <Button
                        className="newExpBtn"
                        variant="text"
                        color="primary"
                        disabled={batchDelete}
                        onClick={() => editExpense(e.id)}
                        style={{
                          padding: "5px 7px",
                          border: "none",
                          // marginRight: "10px",
                        }}>
                        <img
                          src="/src/assets/pencil.png"
                          style={{
                            width: "14px",
                            height: "14px",
                          }}
                          alt=""
                        />
                      </Button>
                      <Button
                        className="newExpBtn"
                        variant="text"
                        color="danger"
                        disabled={batchDelete}
                        onClick={() => singleDelete(e.id)}
                        style={{
                          border: "none",
                          padding: "5px 7px",
                        }}
                        danger>
                        <img
                          src="/src/assets/bin.png"
                          style={{
                            width: "14px",
                            height: "14px",
                          }}
                          alt=""
                        />
                      </Button>
                    </ConfigProvider>
                  </div>
                )}
                {batchDelete && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "10px",
                      marginTop: "0px",
                      padding: "6px 8px",
                      borderRadius: "5px",
                      width: "fit-content",
                      border: "1px solid #1677FF",
                      fontSize: "14px",
                    }}>
                    <label style={{marginRight: "6px"}} htmlFor={idx.toString()}>
                      Select
                    </label>
                    <input
                      style={{marginTop: "2px"}}
                      id={idx.toString()}
                      type="checkbox"
                      checked={expsToDelete.includes(e.id)}
                      onChange={() => selectItems(e.id)}
                    />
                  </div>
                )}
              </div>

              <div>{e.description}</div>
              <p
                style={{
                  fontSize: "13.5px",
                  marginTop: "20px",
                  // color: "#c4c4c4",
                  color: "#919191",
                }}>
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
              {/* <ConfigProvider
                theme={{
                  algorithm: theme.darkAlgorithm, // 👈 Enables dark mode
                }}>
                <Button
                  className="newExpBtn"
                  variant="outlined"
                  color="primary"
                  disabled={batchDelete}
                  onClick={() => editExpense(e.id)}
                  style={{
                    padding: "5px 14px",
                    border: "none",
                    marginRight: "10px",
                  }}>
                  <img
                    src="/src/assets/pencil.png"
                    style={{
                      width: "12px",
                      height: "12px",
                    }}
                    alt=""
                  />
                </Button>
                <Button
                  className="newExpBtn"
                  variant="outlined"
                  color="danger"
                  disabled={batchDelete}
                  onClick={() => singleDelete(e.id)}
                  style={{
                    border: "none",
                  }}
                  danger>
                  <img
                    src="/src/assets/bin.png"
                    style={{
                      width: "12px",
                      height: "12px",
                    }}
                    alt=""
                  />
                </Button>
              </ConfigProvider> */}
              {confirmSingleDelete.show && (
                <div className="singleDeletePopup">
                  <div className="popup2">
                    <p>The selected expense will be deleted permanently!</p>
                    <div>
                      <ConfigProvider
                        theme={{
                          algorithm: theme.darkAlgorithm, // 👈 Enables dark mode
                        }}>
                        <Button
                          style={{outline: "none"}}
                          onClick={cancelSingleDelete}
                          variant="outlined"
                          color="danger">
                          Cancel
                        </Button>
                        <Button
                          style={{outline: "none", border: "none"}}
                          onClick={() => deleteExpense(confirmSingleDelete.id)}
                          variant="solid"
                          color="danger">
                          Delete
                        </Button>
                      </ConfigProvider>
                      {/* <button onClick={cancelSingleDelete}>Cancel</button>
                      <button onClick={() => deleteExpense(confirmSingleDelete.id)}>Delete</button> */}
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
                // style={{maxWidth: 600}}
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
                    // onClick={success}
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
      {paginatedExpenses[0] && (
        <ConfigProvider theme={{algorithm: theme.darkAlgorithm}}>
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={filtered.length}
            onChange={(page) => {
              setCurrentPage(page);
              // setPageSize(size);
            }}
            style={{marginTop: "25px", marginBottom: "15px", textAlign: "center"}}
          />
        </ConfigProvider>
      )}
    </div>
  );
}
