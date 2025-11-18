import { useEffect, useState, useRef } from "react";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import {ConfigProvider, theme, Form, Input, Button, RadioChangeEvent, DatePicker, InputNumber, Select, Flex, Radio} from "antd";
import dayjs from "dayjs";
import "./Dashboard.css"

interface User {
  uid: string; // user object must have a uid
}

type DashboardProps = {
  user: User;
};

interface Expense {
  amount: number;
  category: string;
  date: string;
}

interface FormFilter {
  category: string;
  start: string;
  end: string;
}

interface Display {
  exp: number;
}

export default function Dashboard({ user,}: DashboardProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [display, setDisplay] = useState<Display>({exp: 0})
  const [formFilter, setFormFilter] = useState({category: "", start: getFirstDayOfMonth(), end: getLastDayOfMonth()})
  const [firstName, setFirstName] = useState<string>(""); // explicitly a string
  const [applyButton, setApplyButton] = useState<boolean>(true);
  const [rstToDefaultButton, setRstToDefaultButton] = useState<boolean>(true);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [dashboardFormFilter] = Form.useForm()

  // ✅ Explicitly typed refs to elements
  const filterButton = useRef<HTMLButtonElement | null>(null);
  const formRef = useRef<HTMLDivElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      dashboardFormFilter.setFieldsValue({
        category: "",
        start: dayjs(getFirstDayOfMonth(), "YYYY-MM-DD"),
        end: dayjs(getLastDayOfMonth(), "YYYY-MM-DD"),
      });

      const docRef = doc(db, "users", user.uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data() as { firstName: string; expenses: Expense[] };;
        setFirstName(data.firstName)
        setExpenses(data.expenses)
        let updatedExpenses = data.expenses

        const filterStart = new Date(getFirstDayOfMonth()).getTime();
        const filterEnd = new Date(getLastDayOfMonth()).getTime();

        setFormFilter((prev) => ({
          ...prev,
          start: getFirstDayOfMonth(),
          end: getLastDayOfMonth(),
        }));

        updatedExpenses = updatedExpenses.filter((e) => {
          const dbDate = new Date(e.date).getTime();
          return (filterStart && dbDate >= filterStart) || (filterEnd && dbDate <= filterEnd);
        });
  
        const exp = updatedExpenses?.reduce((a, e) => a + e.amount, 0) || 0;
        setDisplay((prev) => ({
          ...prev,
          exp,
        }));
      }
    };
    if(typeof user !== 'string')fetchData();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      const clickedInsideSelectDropdown = !!(target as HTMLElement).closest('.ant-select-dropdown');
      if (formRef.current && 
          !formRef.current.contains(event.target as Node) && 
          !filterButton.current?.contains(event.target as Node) &&
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

  function getFirstDayOfMonth(): string{
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  }

  function getLastDayOfMonth(): string{
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  }

  const onFinish = (values: any) => {
    let updatedExpenses = expenses;

    if (values.category) {
      updatedExpenses = updatedExpenses.filter((e) => e.category === values.category);
    }

    const filterStart = values.start ? new Date(values.start).getTime() : ""
    const filterEnd = values.end ? new Date(values.end).getTime() : ""

    if (filterStart || filterEnd) {
      updatedExpenses = updatedExpenses.filter(e => {
        const dbDate = new Date(e.date).getTime()
        return (!filterStart || dbDate >= filterStart) && (!filterEnd || dbDate <= filterEnd);
      })
    }

    const exp = updatedExpenses.reduce((a, e) => a + e.amount, 0) || 0;

    setDisplay({...display, exp: exp})
    setApplyButton(true)
    setRstToDefaultButton(false)
  }

  const defaultFilter = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    let updatedExpenses = expenses;
    dashboardFormFilter.setFieldsValue({
      category: "",
      start: dayjs(getFirstDayOfMonth(), "YYYY-MM-DD"),
      end: dayjs(getLastDayOfMonth(), "YYYY-MM-DD"),
    });
    
    const filterStart = new Date(getFirstDayOfMonth()).getTime()
    const filterEnd = new Date(getLastDayOfMonth()).getTime()

    updatedExpenses = updatedExpenses.filter(e => {
        const dbDate = new Date(e.date).getTime()
        return (!filterStart || dbDate >= filterStart) && (!filterEnd || dbDate <= filterEnd);
    })
  
    const exp = updatedExpenses.reduce((a, e) => a + e.amount, 0) || 0;
    
    setDisplay({...display, exp: exp})    
    setApplyButton(true)
    setRstToDefaultButton(true)
  }

   const sortByList = ["Newest", "Oldest", "Largest amount", "Smallest amount"]

  return (
    <div>
      <h2 style={{display: "flex", justifyContent: "space-between"}} className="heading">
        <span>Dashboard</span>
        <img
          src="/src/assets/dashboard.png"
          style={{
            width: "26px",
            height: "26px",
            display: "inline",
            marginLeft: "10px",
          }}
          alt=""
        />
      </h2>
      <p className="greeting px-2">Hello, {firstName}👋🏼</p>
      <div
        className="px-2"
        style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
        <span className="font-medium">Total: ₦{display.exp}</span>
        {/* <button
          className="filterbtn"
          ref={filterButton}
          onClick={() => setShowForm((prev) => !prev)}>
          <img
            src="/src/assets/filter.png"
            style={{
              width: "14px",
              height: "14px",
              display: "inline",
              // marginLeft: "10px",
            }}
            alt=""
          />
        </button> */}
        <ConfigProvider
          theme={{
            algorithm: theme.darkAlgorithm, // 👈 Enables dark mode
          }}>
          <Button
            ref={filterButton}
            onClick={() => setShowForm((prev) => !prev)}
            variant="outlined"
            color="default"
            style={{
              fontWeight: "500",
              fontSize: "17px",
              // border: "1px solid white",
            }}>
            <img
              src="/src/assets/filter.png"
              style={{
                width: "14px",
                height: "14px",
                display: "inline",
              }}
              alt=""
            />
          </Button>
        </ConfigProvider>
      </div>
      {showForm && (
        <div
          ref={formRef}
          className="popupBg"
          style={{
            position: "fixed",
            top: "45%",
            left: "60%",
            transform: "translate(-50%, -50%)",
          }}>
          <ConfigProvider
            theme={{
              algorithm: theme.darkAlgorithm, // 👈 Enables dark mode
            }}>
            <Form
              form={dashboardFormFilter}
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

              {/* <Form.Item name="sortBy" label="Sort By:" initialValue={"Newest"}>
                <Radio.Group>
                  {sortByList.map((opt) => (
                    <Radio
                      key={opt}
                      value={opt}
                      // onChange={handleRadioChange}
                      // checked={formFilter.sortBy === opt}
                      style={{display: "block", marginBottom: 8}}>
                      {opt}{" "}
                    </Radio>
                  ))}
                </Radio.Group>
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
                  }}
                />
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
                  }}
                />
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
                  marginLeft: "10px",
                }}>
                Reset to Default
              </Button>
            </Form>
          </ConfigProvider>
          {/* <form onSubmit={handleSubmit}>
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
            <label htmlFor="start">Start Date</label>
            <input
              type="date"
              name=""
              id="start"
              value={formFilter.start}
              onChange={(e) => {
                setFormFilter({...formFilter, start: e.target.value});
                setApplyButton(false);
                setRstToDefaultButton(false);
              }}
            />

            <label htmlFor="end">End Date</label>
            <input
              type="date"
              name=""
              id="end"
              value={formFilter.end}
              onChange={(e) => {
                setFormFilter({...formFilter, end: e.target.value});
                setApplyButton(false);
                setRstToDefaultButton(false);
              }}
            />
            <button type="submit" disabled={applyButton === true} onClick={applyFilter}>
              Apply
            </button>
            <button type="button" disabled={rstToDefaultButton === true} onClick={defaultFilter}>
              Reset to Default
            </button>
          </form> */}
        </div>
      )}
    </div>
  );
}
