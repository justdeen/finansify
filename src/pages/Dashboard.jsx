import { useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

export default function Dashboard({ user }) {
  const [income, setIncome] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [display, setDisplay] = useState({exp: 0, inc: 0})
  const [formFilter, setFormFilter] = useState({start: getFirstDayOfMonth(), end: getLastDayOfMonth()})
  const [firstName, setFirstName] = useState("")
  const [applyButton, setApplyButton] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const docRef = doc(db, "users", user.uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        setFirstName(data.firstName)
        setIncome(data.income)
        setExpenses(data.expenses)
        let updatedExpenses = data.expenses
        let updatedIncome = data.income

        const filterStart = new Date(getFirstDayOfMonth()).getTime();
        const filterEnd = new Date(getLastDayOfMonth()).getTime();

        setFormFilter({...formFilter, start: getFirstDayOfMonth(), end: getLastDayOfMonth()});

        updatedExpenses = updatedExpenses.filter((e) => {
          const dbDate = new Date(e.date).getTime();
          return (filterStart && dbDate >= filterStart) || (filterEnd && dbDate <= filterEnd);
        });
        updatedIncome = updatedIncome.filter((e) => {
          const dbDate = new Date(e.date).getTime();
          return (filterStart && dbDate >= filterStart) || (filterEnd && dbDate <= filterEnd);
        });

        const inc = updatedIncome?.reduce((a, i) => a + i.amount, 0) || 0;
        const exp = updatedExpenses?.reduce((a, e) => a + e.amount, 0) || 0;
        setDisplay({...display, exp: exp, inc: inc})
      }
    };
    fetchData();
  }, []);

  function getFirstDayOfMonth() {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  }

  function getLastDayOfMonth() {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
  }

  const applyFilter = () => {
    let updatedExpenses = expenses;
    let updatedIncome = income;

    const filterStart = formFilter.start ? new Date(formFilter.start).getTime() : ""
    const filterEnd = formFilter.end ? new Date(formFilter.end).getTime() : ""

    if (filterStart || filterEnd) {
      updatedExpenses = updatedExpenses.filter(e => {
        const dbDate = new Date(e.date).getTime()
        return (filterStart && dbDate >= filterStart) || (filterEnd && dbDate <= filterEnd);
      })
      updatedIncome = updatedIncome.filter(e => {
        const dbDate = new Date(e.date).getTime()
        return (filterStart && dbDate >= filterStart || filterEnd && dbDate <= filterEnd)
      })
    }

    const exp = updatedExpenses.reduce((a, e) => a + e.amount, 0) || 0;
    const inc = updatedIncome.reduce((a, i) => a + i.amount, 0) || 0;

    setDisplay({...display, exp: exp, inc: inc})
  }

  const defaultFilter = () => {
    let updatedExpenses = expenses;
    let updatedIncome = income;
    setFormFilter({ ...formFilter, start: getFirstDayOfMonth(), end: getLastDayOfMonth() })
    
    const filterStart = new Date(getFirstDayOfMonth()).getTime()
    const filterEnd = new Date(getLastDayOfMonth()).getTime()

    updatedExpenses = updatedExpenses.filter(e => {
        const dbDate = new Date(e.date).getTime()
        return (filterStart && dbDate >= filterStart) || (filterEnd && dbDate <= filterEnd);
    })
    updatedIncome = updatedIncome.filter(e => {
        const dbDate = new Date(e.date).getTime()
        return (filterStart && dbDate >= filterStart || filterEnd && dbDate <= filterEnd)
    })

    const exp = updatedExpenses.reduce((a, e) => parseInt(a) + parseInt(e.amount), 0) || 0;
    const inc = updatedIncome.reduce((a, i) => a + i.amount, 0) || 0;

    setDisplay({...display, exp: exp, inc: inc})    
  }

  const balance = display.inc - display.exp;

  return (
    <div>
      <h2>Dashboard</h2>
      <p>Hello, {firstName}</p>
      <div>
        <form>
          <label htmlFor="start">Start Date</label>
          <input type="date" name="" id="start" value={formFilter.start} onChange={(e) => {
            setFormFilter({...formFilter, start: e.target.value})
            setApplyButton(false)
          }} />

          <label htmlFor="end">End Date</label>
          <input type="date" name="" id="end" value={formFilter.end} onChange={(e) => {
            setFormFilter({...formFilter, end: e.target.value})
            setApplyButton(false)
          }} />
          <button disabled={applyButton === true} onClick={applyFilter}>Apply</button>
          <button onClick={defaultFilter}>Reset to Default</button>
        </form>
        <button>Filter by date</button>
      </div>
      <p>Total Income: ₦{display.inc}</p>
      <p>Total Expenses: ₦{display.exp}</p>
      <p>Balance: ₦{balance}</p>
    </div>
  );
}
