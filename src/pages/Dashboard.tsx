import { useEffect, useState, useRef } from "react";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import {
  ConfigProvider,
  theme,
  Form,
  Input,
  Button,
  RadioChangeEvent,
  DatePicker,
  InputNumber,
  Select,
  Flex,
  Radio,
  Empty,
  Spin
} from "antd";
import { Line, Pie } from "react-chartjs-2";
import "chartjs-adapter-date-fns";

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
// import ChartDataLabels from 'chartjs-plugin-datalabels';
// ChartJS.register(ChartDataLabels);

ChartJS.register(ArcElement, Tooltip, Legend,);
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

interface CategoryTotal {
  category: string;
  amount: number;
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
  const [filteredExp, setFilteredExp] = useState<Expense[]>([])

  // ✅ Explicitly typed refs to elements
  const filterButton = useRef<HTMLButtonElement | null>(null);
  const formRef = useRef<HTMLDivElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [loadState, setLoadState] = useState(true)
  const [sorted, setSorted] = useState<Expense[]>([])
  const [sorted2, setSorted2] = useState<CategoryTotal[]>([]);

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

        // Line chart----------
        const sorted = [...updatedExpenses].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        
        // Pie chart----------
        const categoryTotals = updatedExpenses.reduce<Record<string, number>>((acc, item) => {
          if (!acc[item.category]) acc[item.category] = 0;
          acc[item.category] += item.amount;
          return acc;
        }, {});

        const categoryTotalsArray: CategoryTotal[] = Object.entries(categoryTotals).map(
          ([category, amount]) => ({category, amount})
        );

        setSorted(sorted)
        setSorted2(categoryTotalsArray)

        setFilteredExp(updatedExpenses)
        setLoadState(false)
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
    setLoadState(true)
    setShowForm(false)
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

    const sorted = [...updatedExpenses].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    setSorted(sorted)

    setFilteredExp(updatedExpenses)
    setDisplay({...display, exp: exp})
    setApplyButton(true)
    setRstToDefaultButton(false)
    setLoadState(false)
  }

  const defaultFilter = (e: React.MouseEvent<HTMLButtonElement>) => {
    setShowForm(false)
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

    const sorted = [...updatedExpenses].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    setSorted(sorted)
    
    setFilteredExp(updatedExpenses)
    setDisplay({...display, exp: exp})    
    setApplyButton(true)
    setRstToDefaultButton(true)
    setLoadState(false)
  }

   const sortByList = ["Newest", "Oldest", "Largest amount", "Smallest amount"]
  //  const COLORS = ["#1677FF", "#00C49F", "#FFBB28", "#FF8042", "#845EF7"];

  // Line chart
   const chartData = {
     labels: sorted.map((d) => d.date),
     datasets: [
       {
         label: "Line chart",
         data: sorted.map((d) => Number(d.amount)),
         borderColor: "#1677FF",
         backgroundColor: "rgba(22,119,255,0.2)",
         tension: 0.2,
         fill: true,
       },
     ],
   };

  const isSmall = window.innerWidth < 640;
  const options = {
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const index = context.dataIndex;
            const category = sorted[index].category;
            const amount = sorted[index].amount.toLocaleString();

            return `${category}: ₦${amount}`;
          },
        },
      },
      title: {
        display: true,
        text: "Line Chart",
      },
    },
    scales: {
      x: {
        type: "time" as any, // ✅ MUST BE EXACT LITERAL
        time: {
          unit: "day",
        },
        ticks: {
          font: {
            size: isSmall ? 11 : 15,
          },
        },
      },
      y: {
        beginAtZero: false,
        ticks: {
          font: {
            size: isSmall ? 11 : 15,
          },
        },
      },
    },
  };

  // Pie chart
  const total = sorted2.reduce((sum, item) => sum + item.amount, 0);
  const chartData2 = {
    labels: sorted2.map((item) => {
      const percent = ((item.amount / total) * 100).toFixed(2);
      return `${item.category} (${percent}%)`; // include percentage in the label
    }),
    datasets: [
      {
        data: sorted2.map((item) => item.amount),
        backgroundColor: [
          "#1677FF", // blue
          "#00C49F", // green
          "#FFBB28", // yellow-orange
          "#FF8042", // orange
          "#845EF7", // purple
          "#E03E36", // red
          "#FF69B4", // hot pink
        ],
        borderWidth: 1,
      },
    ],
  };

  const isSmallScreen = window.innerWidth < 400;
  const options2 = {
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = Number(context.raw ?? 0);
            const dataset = context.chart.data.datasets[0];
            const total = dataset.data.reduce((sum: number, val: number) => sum + val, 0);
            const percent = ((value / total) * 100).toFixed(1);
            return ` ₦${value.toLocaleString()} (${percent}%)`;
          },
        },
      },
      legend: {
        position: "bottom" as const,
        labels: {
        boxWidth: 10,   // default is 40
        boxHeight: 10,  // reduces height (Chart.js v4+)
        padding: 10,
        font: {
          size: isSmallScreen ? 10 : 15,
        }
      }
      },
    },
  };

  return (
    <div>
      <h2
        style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}
        className="heading">
        <span>Dashboard</span>
        <img
          onContextMenu={(e) => e.preventDefault()}
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
        <span className="font-medium">Total: ₦{display.exp.toLocaleString()}</span>
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
            className="filter"
            ref={filterButton}
            onClick={() => setShowForm((prev) => !prev)}
            variant="outlined"
            color="primary"
            style={{
              fontWeight: "500",
              fontSize: "17px",
            }}>
            <img
              src="/src/assets/filter2.png"
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
      
      
      {filteredExp[0] && !loadState && <div>
        {/* <p className="chart text-xl font-semibold mb-7">Line Chart</p> */}
        <Line data={chartData} options={options} style={{marginTop: "25px"}}/>
      </div>}
      
      {filteredExp[0] && !loadState && sorted2.length > 0 && <div>
        {/* <p className="chart text-xl font-semibold mb-7">Pie Chart</p> */}
        <div className="pie" style={{ width: "350px", height: "350px", margin: "0 auto" }}>
          <Pie data={chartData2} options={options2} style={{marginTop: "55px", width: "100%"}}/>
        </div>
      </div>}

      {loadState && (
        <div className="flex justify-center mt-4">
          <Spin size="large" />
        </div>
      )}

      {!filteredExp[0] && !loadState && (
        <ConfigProvider
          theme={{
            algorithm: theme.darkAlgorithm, // 👈 Enables dark mode
          }}>
          <Empty
            style={{marginTop: "25px"}}
            description="No expenses here yet! Add expenses on the 'Expenses' page."
          />
        </ConfigProvider>
      )}

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
                    {label: "Shopping", value: "Shopping"},
                    {label: "Entertainment", value: "Entertainment"},
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
