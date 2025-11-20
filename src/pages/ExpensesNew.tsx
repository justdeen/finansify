import {useState, useEffect, useRef} from "react";
import {collection, addDoc, getDocs, getDoc, updateDoc, deleteDoc, doc, query, where} from "firebase/firestore";
import {db, auth} from "../firebase";
import {v4 as uuidv4} from "uuid";
import {ConfigProvider, theme, Form, Input, Button, InputNumber, Select, Flex, message, Spin} from "antd";
import "./ExpensesNew.css"

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
  const [formSubmit] = Form.useForm();
  const [loadState, setLoadState] = useState(false)

  const showForm = () => {
    setNewExpForm(true)
  }

  const cancel = ()=> {
    setNewExpForm(false)
    formSubmit.resetFields();
  }

  // const handleNewExpense = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (!form.category || !form.description || !form.amount) return;
  //   addExpense();
  // };

  const [messageApi, contextHolder] = message.useMessage();
  message.config({
    top: 100,
    duration: 2,
  });
  
   const success = () => {
    messageApi.open({
      type: 'success',
      content: 'Expense added!',
      // className: 'custom-class',
      style: {
        marginTop: '5vh',
        
      },
    });
  };

  const onFinish = async (values: any) => {
    setLoadState(true);
    formSubmit.resetFields();
    const newExp = {...values, id: uuidv4(), date: new Date().toISOString(), edited: false};
    console.log(newExp.id)
    const updated = [...expenses, newExp];
    await updateDoc(doc(db, "users", user.uid), {expenses: updated});
    setExpenses(updated);
    setFiltered(updated);
    saveFilters(updated);
    setNewExpForm(false);
    setLoadState(false)
    success();
  };

  // async function addExpense() {
  //   const newExp = {...form, amount: parseInt(form.amount), id: uuidv4(), date: new Date().toISOString(), edited: false};
  //   const updated = [...expenses, newExp];
  //   await updateDoc(doc(db, "users", user.uid), {expenses: updated});
  //   setExpenses(updated);
  //   setFiltered(updated);
  //   saveFilters(updated);
  //   setForm({category: "", description: "", amount: ""});
  //   setNewExpForm(false)
  // }

  return (
    <div>
      {loadState && (<div className="flex justify-center spin">
        <div className="spinCont">
          <Spin size="large" />
        </div>
      </div>)}
      {/* <form onSubmit={handleNewExpense}>
        <button onClick={showForm} disabled={batchDelete}>
          Add Expense
        </button>

        {newExpForm && (
          <div>
            <select
              value={form.category}
              onChange={(e) => setForm({...form, category: e.target.value})}
              required>
              <option value="">Select Category</option>
              <option value="Food">Food</option>
              <option value="Rent">Rent</option>
              <option value="Transport">Transport</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Utilities">Utilities</option>
            </select>
            <input
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({...form, description: e.target.value})}
              required
            />
            <input
              placeholder="Amount"
              type="number"
              value={form.amount}
              onChange={(e) => setForm({...form, amount: e.target.value})}
              required
            />
            <button type="submit" disabled={batchDelete}>
              Save
            </button>
            <button onClick={cancel} type="button">
              Cancel
            </button>
          </div>
        )}
      </form> */}
      <ConfigProvider theme={{
          algorithm: theme.darkAlgorithm, // 👈 Enables dark mode
        }}>
        <div style={{zIndex: "999999"}}>{contextHolder}</div>
      </ConfigProvider>

      <ConfigProvider
        theme={{
          algorithm: theme.darkAlgorithm, // 👈 Enables dark mode
        }}>
        <Form
          form={formSubmit}
          name="trigger"
          className="newExpForm"
          // style={{maxWidth: 600}}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="on">
          <Button
            className="newExpBtn"
            block
            variant="outlined"
            color="primary"
            disabled={batchDelete}
            onClick={showForm}
            style={{
              fontWeight: "500", 
              fontSize: "13px", 
              marginTop: "-10px",
              marginBottom: "10px", 
              height: "37px"
            }}>
            Add Expense
          </Button>

          {newExpForm && (
            <div>
              <Form.Item name="category" label={<span style={{fontSize: "14px"}}>Category</span>} rules={[{required: true}]}>
                <Select
                  style={{height: "37px", fontSize: "14px"}}
                  allowClear
                  placeholder="Select a category"
                  options={[
                    {label: "Food", value: "Food"},
                    {label: "Rent", value: "Rent"},
                    {label: "Transport", value: "Transport"},
                    {label: "Utilities", value: "Utilities"},
                    {label: "Other", value: "Other"},
                  ]}
                />
              </Form.Item>
              <Form.Item
                hasFeedback
                label={<span style={{fontSize: "14px"}}>Description</span>}
                name="description"
                validateFirst
                rules={[{required: true, min: 3, max: 70}]}>
                <Input
                style={{height: "37px", fontSize: "14px"}} 
                placeholder="Enter description" />
              </Form.Item>

              <Form.Item
                hasFeedback
                label={<span style={{fontSize: "14px"}}>Amount</span>}
                name="amount"
                validateFirst
                style={{width: "100%"}}
                rules={[{required: true, type: "number", min: 1}]}>
                <InputNumber 
                style={{width: "100%", height: "37px", fontSize: "14px"}} 
                placeholder="Enter amount" />
              </Form.Item>

                <Flex gap="middle" style={{width: "100%"}} >
                  <Button
                    className="newExpBtn"
                    type="primary"
                    htmlType="submit"
                    disabled={batchDelete}
                    style={{
                      fontWeight: "500",
                      fontSize: "14px",
                      height: "37px",
                      flex: 1,
                      border: "none",
                    }}>
                    Submit
                  </Button>
                  <Button
                    className="newExpBtn"
                    type="primary"
                    color="danger"
                    onClick={cancel}
                    style={{
                      fontWeight: "500", 
                      fontSize: "14px", 
                      height: "37px",
                      border: "none",
                      flex: 1,
                    }} danger>
                    Cancel
                  </Button>
                </Flex>
            </div>
          )}
        </Form>
      </ConfigProvider>
    </div>
  );
}
