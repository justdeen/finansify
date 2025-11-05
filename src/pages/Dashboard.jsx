import { useEffect, useState, useRef } from "react";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

export default function Dashboard({ user }) {
  const [expenses, setExpenses] = useState([]);
  const [display, setDisplay] = useState({exp: 0})
  const [formFilter, setFormFilter] = useState({category: "", start: getFirstDayOfMonth(), end: getLastDayOfMonth()})
  const [firstName, setFirstName] = useState("")
  const [applyButton, setApplyButton] = useState(true);
  const [rstToDefaultButton, setRstToDefaultButton] = useState(true)
  const [showForm, setShowForm] = useState(false);
  const filterButton = useRef(null);
  const formRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      const docRef = doc(db, "users", user.uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        setFirstName(data.firstName)
        setExpenses(data.expenses)
        let updatedExpenses = data.expenses

        const filterStart = new Date(getFirstDayOfMonth()).getTime();
        const filterEnd = new Date(getLastDayOfMonth()).getTime();

        setFormFilter({...formFilter, start: getFirstDayOfMonth(), end: getLastDayOfMonth()});

        updatedExpenses = updatedExpenses.filter((e) => {
          const dbDate = new Date(e.date).getTime();
          return (filterStart && dbDate >= filterStart) || (filterEnd && dbDate <= filterEnd);
        });
  
        const exp = updatedExpenses?.reduce((a, e) => a + e.amount, 0) || 0;
        setDisplay({...display, exp: exp})
      }
    };
    fetchData();
  }, []);

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

  const handleSubmit = (e) => {
    e.preventDefault();
  }

  const applyFilter = () => {
    let updatedExpenses = expenses;

    if (formFilter.category) {
      updatedExpenses = updatedExpenses.filter((e) => e.category === formFilter.category);
    }

    const filterStart = formFilter.start ? new Date(formFilter.start).getTime() : ""
    const filterEnd = formFilter.end ? new Date(formFilter.end).getTime() : ""

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

  const defaultFilter = (e) => {
    e.preventDefault();
    let updatedExpenses = expenses;
    setFormFilter({ ...formFilter, category: "", start: getFirstDayOfMonth(), end: getLastDayOfMonth() })
    
    const filterStart = new Date(getFirstDayOfMonth()).getTime()
    const filterEnd = new Date(getLastDayOfMonth()).getTime()

    updatedExpenses = updatedExpenses.filter(e => {
        const dbDate = new Date(e.date).getTime()
        return (!filterStart || dbDate >= filterStart) && (!filterEnd || dbDate <= filterEnd);
    })
  
    const exp = updatedExpenses.reduce((a, e) => parseInt(a) + parseInt(e.amount), 0) || 0;
    
    setDisplay({...display, exp: exp})    
    setApplyButton(true)
    setRstToDefaultButton(true)
  }

  return (
    <div>
      <h2>Dashboard</h2>
      <p>Hello, {firstName}</p>
      <button ref={filterButton} onClick={() => setShowForm((prev) => !prev)}>Filters</button>
      {showForm && <div ref={formRef}
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <form onSubmit={handleSubmit}>
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
          <input type="date" name="" id="start" value={formFilter.start} onChange={(e) => {
            setFormFilter({...formFilter, start: e.target.value})
            setApplyButton(false)
            setRstToDefaultButton(false)
          }} />

          <label htmlFor="end">End Date</label>
          <input type="date" name="" id="end" value={formFilter.end} onChange={(e) => {
            setFormFilter({...formFilter, end: e.target.value})
            setApplyButton(false)
            setRstToDefaultButton(false)
          }} />
          <button type="submit" disabled={applyButton === true} onClick={applyFilter}>Apply</button>
          <button type="button" disabled={rstToDefaultButton === true} onClick={defaultFilter}>Reset to Default</button>
        </form>
      </div>}
      <p>Total Expenses: ₦{display.exp}</p>
    </div>
  );
}
