import Expenses from "./Expenses";
import ExpensesNew from "./ExpensesNew";
import {useState, useEffect, useRef} from "react";
import {collection, addDoc, getDocs, getDoc, updateDoc, deleteDoc, doc, query, where} from "firebase/firestore";
import {db, auth} from "../firebase";
import {v4 as uuidv4} from "uuid";
import "./ExpensesFilters.css"
import {ConfigProvider, theme, Form, Input, Button, InputNumber, Select, Flex} from "antd";
import { useForm } from "react-hook-form";

// ✅ Define the shape of an expense
interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  edited: boolean;
}

// ✅ Define structure of date range in filters
interface DateRange {
  start: string;
  end: string;
}

// ✅ Define filter form structure
interface FormFilter {
  category: string;
  sortBy: string;
  date: DateRange;
}

// ✅ Define props for the component
interface ExpensesFiltersProps {
  user: { uid: string };
}

export default function ExpensesFilters({ user }: ExpensesFiltersProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filtered, setFiltered] = useState<Expense[]>([]);
  const [formFilter, setFormFilter] = useState<FormFilter>({
    category: "",
    sortBy: "newest",
    date: { start: getFirstDayOfMonth(), end: getLastDayOfMonth() },
  });
  const [showForm, setShowForm] = useState(false);
  const [totalExpenses, setTotalExpenses] = useState<number>(0);
  const [applyButton, setApplyButton] = useState(true);
  const [rstToDefaultButton, setRstToDefaultButton] = useState(true);
  const [batchDelete, setBatchDelete] = useState(false);

  // ✅ Properly typed Refs
  const formRef = useRef<HTMLDivElement | null>(null);
  const filterButton = useRef<HTMLButtonElement | null>(null);
  const [formSubmit] = Form.useForm()

  useEffect(() => {
    const fetchData = async () => {
      let updatedExpenses = [];
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        updatedExpenses = snap.data().expenses;
        setExpenses(updatedExpenses);
      }

      const filterStart = new Date(getFirstDayOfMonth()).getTime();
      const filterEnd = new Date(getLastDayOfMonth()).getTime();

      updatedExpenses = updatedExpenses.filter((e: Expense) => {
        const dbDate = new Date(e.date).getTime();
        return dbDate >= filterStart && dbDate <= filterEnd;
      });

      if (formFilter.sortBy === "newest") {
        updatedExpenses.sort((a: Expense, b: Expense): number => new Date(b.date).getTime() - new Date(a.date).getTime());
      }

      const total = updatedExpenses.reduce((sum: number, e: Expense) => sum + e.amount, 0);
      setTotalExpenses(total);

      setFiltered(updatedExpenses);
    };
    if(typeof user !== 'string')fetchData();
  }, []);

  // Overlay for formFilter
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (formRef.current && !formRef.current.contains(event.target as Node) && filterButton.current && !filterButton.current.contains(event.target as Node)) {
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
    return new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split("T")[0];
  }

  function getLastDayOfMonth() {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split("T")[0];
  }

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApplyButton(false);
    setRstToDefaultButton(false);
    setFormFilter({...formFilter, sortBy: e.target.value});
  };

  const onFinish = () => {
    
  }

  const applyFilterChanges = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // if(e.target)
    saveFilters();
  };

  // save form filter changes
  const saveFilters = (expensesToUse = expenses) => {
    if (!Array.isArray(expensesToUse)) {
      expensesToUse = Array.isArray(expenses) ? expenses : [];
    }
    let updated = [...expensesToUse];

    // category filter
    if (formFilter.category) {
      updated = expensesToUse.filter((e) => {
        return e.category === formFilter.category;
      });
    } else updated = expensesToUse;

    // date filter
    const filterStart = formFilter.date.start ? new Date(formFilter.date.start).getTime() : "";
    const filterEnd = formFilter.date.end ? new Date(formFilter.date.end).getTime() : "";

    if (filterStart || filterEnd) {
      updated = updated.filter((e) => {
        const dbDate = new Date(e.date).getTime();
        return (!filterStart || dbDate >= filterStart) && (!filterEnd || dbDate <= filterEnd);
      });
    }

    // sortBy filter
    if (formFilter.sortBy === "oldest") {
      updated.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else if (formFilter.sortBy === "newest") {
      updated.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else if (formFilter.sortBy === "largest amount") {
      updated.sort((a, b) => b.amount - a.amount);
    } else if (formFilter.sortBy === "smallest amount") {
      updated.sort((a, b) => a.amount - b.amount);
    }
    setFiltered(updated);
    setApplyButton(true);
    setRstToDefaultButton(false);

    const total = updated.reduce((sum, e) => sum + e.amount, 0);
    setTotalExpenses(total);
  };

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
    setRstToDefaultButton(true);
  };

  // reset filters to default
  const defaultFilter = () => {
    toDefaultFilters();
    setApplyButton(true);
  };

  const sortByList = ["newest", "oldest", "largest amount", "smallest amount"]

  return (
    <>
      <button
        ref={filterButton}
        disabled={batchDelete}
        onClick={() => setShowForm((prev) => !prev)}>
        Filters
      </button>
      <br />
      {showForm && (
        <div
          className="popupBg"
          ref={formRef}
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: "10",
          }}>
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
                  onChange={(e) => {
                    setApplyButton(false);
                    setRstToDefaultButton(false);
                  }}
                  options={[
                    {label: "Food", value: "Food"},
                    {label: "Rent", value: "Rent"},
                    {label: "Transport", value: "Transport"},
                    {label: "Utilities", value: "Utilities"},
                    {label: "Other", value: "Other"},
                  ]}
                />
              </Form.Item>
            </Form>
          </ConfigProvider>

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
                <input
                  type="radio"
                  name="opt"
                  value={opt}
                  checked={formFilter.sortBy === opt}
                  onChange={handleRadioChange}
                />
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
            <button type="submit" onClick={() => saveFilters} disabled={applyButton === true}>
              Apply
            </button>
            <button type="button" onClick={defaultFilter} disabled={rstToDefaultButton === true}>
              Reset to Default
            </button>
          </form>
        </div>
      )}
      <h2>Expenses</h2>
      <ExpensesNew
        user={user}
        setExpenses={setExpenses}
        setFiltered={setFiltered}
        filtered={filtered}
        expenses={expenses}
        totalExpenses={totalExpenses}
        saveFilters={saveFilters}
        batchDelete={batchDelete}></ExpensesNew>

      <Expenses
        user={user}
        setExpenses={setExpenses}
        setFiltered={setFiltered}
        filtered={filtered}
        expenses={expenses}
        totalExpenses={totalExpenses}
        saveFilters={saveFilters}
        batchDelete={batchDelete}
        setBatchDelete={setBatchDelete}></Expenses>
    </>
  );
}
