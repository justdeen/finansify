import Expenses from "./Expenses";
import ExpensesNew from "./ExpensesNew";
import {useState, useEffect, useRef} from "react";
import {collection, addDoc, getDocs, getDoc, updateDoc, deleteDoc, doc, query, where} from "firebase/firestore";
import {db, auth} from "../firebase";
import {v4 as uuidv4} from "uuid";
import "./ExpensesFilters.css"
import {ConfigProvider, theme, Form, Input, Button, RadioChangeEvent, DatePicker, InputNumber, Select, Flex, Radio} from "antd";
import { useForm } from "react-hook-form";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

const { RangePicker } = DatePicker;

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

export default function ExpensesFilters({ user,}: ExpensesFiltersProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filtered, setFiltered] = useState<Expense[]>([]);
  const [formFilter, setFormFilter] = useState<FormFilter>({
    category: "",
    sortBy: "Newest",
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
  const [formFilterSubmit] = Form.useForm()
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      formFilterSubmit.setFieldsValue({
        category: "",
        sortBy: "Newest",
        start: dayjs(getFirstDayOfMonth(), "YYYY-MM-DD"),
        end: dayjs(getLastDayOfMonth(), "YYYY-MM-DD"),
      });
      // console.log(formFilter.date.start)
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

      if (formFilter.sortBy === "Newest") {
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
      const target = event.target as Node;
      const clickedInsideSelectDropdown = !!(target as HTMLElement).closest('.ant-select-dropdown');
      if (formRef.current && 
          !formRef.current.contains(event.target as Node) && 
          filterButton.current && 
          !filterButton.current.contains(event.target as Node) &&
          !clickedInsideSelectDropdown) {
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

  const handleRadioChange = (e: RadioChangeEvent) => {
    setApplyButton(false);
    setRstToDefaultButton(false);
    setFormFilter({...formFilter, sortBy: e.target.value});
  };

  // const handleOpenChange = (isOpen: boolean) => setOpen(isOpen);

  // const handleChange = (dates: any) => {
  //   // Only normalize when the picker is closed (i.e. selection completed)
  //   if (!dates) {
  //     formFilterSubmit.setFieldsValue({ date: undefined });
  //     return;
  //   }

  //   // If picker is still open, do nothing (prevents UI jumps)
  //   if (open) return;

  //   const [start, end] = dates.map((d: any) => dayjs(d).startOf("day"));
  //   formFilterSubmit.setFieldsValue({ date: [start, end] });
  // };
  
  const onFinish = (values: any) => {
    // console.log(values)
    const startDate = `${values.start.$y}-${values.start.$M + 1}-${values.start.$D}`
    const endDate = `${values.end.$y}-${values.end.$M + 1}-${values.end.$D}`
    // console.log(values.start)
    // console.log(new Date(values.start).getTime())
    // const [start, end] = values.date;
    // console.log({
    //   start: start.format("YYYY-MM-DD"), // ✅ "2025-12-02"
    //   end: end.format("YYYY-MM-DD"), // ✅ "2025-12-17"
    // });

    setShowForm(false)
    let updated = []
    setFormFilter({
      category: values.category,
      sortBy: values.sortBy,
      date: {start: values.start, end: values.end},
    });
    if (values.category) {
      updated = expenses.filter((e) => {
        return e.category === values.category;
      });
    } else updated = expenses;

    // date filter
    const filterStart = values.start ? new Date(values.start).getTime() : "";
    const filterEnd = values.end ? new Date(values.end).getTime() : "";

    if (filterStart || filterEnd) {
      updated = updated.filter((e) => {
        const dbDate = new Date(e.date).getTime();
        return (!filterStart || dbDate >= filterStart) && (!filterEnd || dbDate <= filterEnd);
      });
    }

    // sortBy filter
    if (values.sortBy === "Oldest") {
      updated.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else if (values.sortBy === "Newest") {
      updated.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else if (values.sortBy === "Largest amount") {
      updated.sort((a, b) => b.amount - a.amount);
    } else if (values.sortBy === "Smallest amount") {
      updated.sort((a, b) => a.amount - b.amount);
    }
    setFiltered(updated);
    setApplyButton(true);
    setRstToDefaultButton(false);

    const total = updated.reduce((sum, e) => sum + e.amount, 0);
    setTotalExpenses(total);
  }

  // const applyFilterChanges = (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();
  //   // if(e.target)
  //   saveFilters();
  // };

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

    console.log(formFilter.sortBy)
    // sortBy filter
    if (formFilter.sortBy === "Oldest") {
      updated.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else if (formFilter.sortBy === "Newest") {
      updated.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else if (formFilter.sortBy === "Largest amount") {
      updated.sort((a, b) => b.amount - a.amount);
    } else if (formFilter.sortBy === "Smallest amount") {
      updated.sort((a, b) => a.amount - b.amount);
    }
    setFiltered(updated);
    setApplyButton(true);
    setRstToDefaultButton(false);

    const total = updated.reduce((sum, e) => sum + e.amount, 0);
    setTotalExpenses(total);
  };

  const toDefaultFilters = () => {
    setShowForm(false);
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
      sortBy: "Newest",
      date: {start: getFirstDayOfMonth(), end: getLastDayOfMonth()},
    });

    formFilterSubmit.setFieldsValue({
      category: "",
      sortBy: "Newest",
      start: dayjs(getFirstDayOfMonth(), "YYYY-MM-DD"),
      end: dayjs(getLastDayOfMonth(), "YYYY-MM-DD"),
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
 
  const sortByList = ["Newest", "Oldest", "Largest amount", "Smallest amount"]

  return (
    <>
      {/* <button
        ref={filterButton}
        disabled={batchDelete}
        onClick={() => setShowForm((prev) => !prev)}>
        Filters
      </button> */}
      {/* <br /> */}
      {showForm && (
        <div
          className="popupBg"
          ref={formRef}
          style={{
            position: "fixed",
            top: "50%",
            left: "60%",
            transform: "translate(-50%, -50%)",
            zIndex: "10",
          }}>
          <ConfigProvider
            theme={{
              algorithm: theme.darkAlgorithm, // 👈 Enables dark mode
            }}>
            <Form
              form={formFilterSubmit}
              name="formFilterSubmit"
              // style={{maxWidth: 600}}
              layout="vertical"
              onFinish={onFinish}
              autoComplete="on">
              <Form.Item
                name="category"
                label="Category"
                rules={[{}]}
                initialValue={formFilter.category}>
                <Select
                  allowClear
                  placeholder="Select a category"
                  onChange={(e) => {
                    setApplyButton(false);
                    setRstToDefaultButton(false);
                  }}
                  options={[
                    {label: "All", value: ""},
                    {label: "Food", value: "Food"},
                    {label: "Rent", value: "Rent"},
                    {label: "Transport", value: "Transport"},
                    {label: "Utilities", value: "Utilities"},
                    {label: "Other", value: "Other"},
                  ]}
                />
              </Form.Item>

              <Form.Item name="sortBy" label="Sort By:" initialValue={"Newest"}>
                <Radio.Group>
                  {sortByList.map((opt) => (
                    <Radio
                      key={opt}
                      value={opt}
                      onChange={handleRadioChange}
                      checked={formFilter.sortBy === opt}
                      style={{display: "block", marginBottom: 8}}>
                      {opt}{" "}
                    </Radio>
                  ))}
                </Radio.Group>
              </Form.Item>

              {/* <Form.Item label="RangePicker" name="date">
                <RangePicker
                  getPopupContainer={(trigger) => trigger.parentElement ?? document.body}
                  // onChange={handleChange}
                  // onOpenChange={handleOpenChange}
                  showTime={false}
                />
              </Form.Item> */}

              <Form.Item
                label="Start date"
                name="start"
                // rules={[{message: "Please input!"}]}
                >
                <DatePicker  
                  getPopupContainer={(trigger) => trigger.parentElement ?? document.body} 
                  style={{width: "100%"}}
                  onChange={(e) => {
                    setApplyButton(false);
                    setRstToDefaultButton(false);
                  }}/>
              </Form.Item>
              
              <Form.Item
                label="End date"
                name="end"
                // rules={[{message: "Please input!"}]}
                >
                <DatePicker  
                  getPopupContainer={(trigger) => trigger.parentElement ?? document.body} 
                  style={{width: "100%"}}
                  onChange={(e) => {
                    setApplyButton(false);
                    setRstToDefaultButton(false);
                  }}/>
              </Form.Item>

              <Button
                className="newExpBtn"
                type="primary"
                htmlType="submit"
                disabled={applyButton}
                // onClick={() => handleSave(e.id)}
                style={{
                  fontWeight: "500",
                  fontSize: "13px",
                  border: "none",
                }}>
                Apply
              </Button>

              <Button
                className="newExpBtn"
                type="primary"
                htmlType="button"
                onClick={defaultFilter}
                disabled={rstToDefaultButton}
                // onClick={() => handleSave(e.id)}
                style={{
                  fontWeight: "500",
                  fontSize: "13px",
                  border: "none",
                  marginLeft: "10px"
                }}>
                Reset to Default
              </Button>
            </Form>
          </ConfigProvider>

          {/* <label htmlFor="start">Start Date</label>
          <input
            type="date"
            name=""
            id="start"
            // value={formFilter.date.start}
            onChange={(e) => {
              console.log(e.target.value);
            }}
          /> */}

          {/* <form className="formFilter">
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
          </form> */}
        </div>
      )}
      
      <h2 style={{display: "flex", justifyContent: "space-between", alignItems: 'center'}} className="heading">
        <span>Expenses</span>
        <img
          src="/src/assets/expenses.png"
          style={{
            width: "26px",
            height: "26px",
            display: "inline",
            marginLeft: "10px",
          }}
          alt=""
        />
      </h2>

      {/* <h2 className="heading">Expenses</h2> */}
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
        setBatchDelete={setBatchDelete}
        setShowForm={setShowForm}
        filterButton={filterButton}></Expenses>
    </>
  );
}
