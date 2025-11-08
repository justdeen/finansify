import { useEffect, useState, useRef } from "react";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

interface User {
  uid: string; // user object must have a uid
}

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

export default function Dashboard({ user }: { user: User }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [display, setDisplay] = useState<Display>({exp: 0})
  const [formFilter, setFormFilter] = useState({category: "", start: getFirstDayOfMonth(), end: getLastDayOfMonth()})
  const [firstName, setFirstName] = useState<string>(""); // explicitly a string
  const [applyButton, setApplyButton] = useState<boolean>(true);
  const [rstToDefaultButton, setRstToDefaultButton] = useState<boolean>(true);
  const [showForm, setShowForm] = useState<boolean>(false);

  // ✅ Explicitly typed refs to elements
  const filterButton = useRef<HTMLButtonElement | null>(null);
  const formRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const docRef = doc(db, "users", user.uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data() as { firstName: string; expenses: Expense[] };;
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
    function handleClickOutside(event: MouseEvent) {
      if (formRef.current && !formRef.current.contains(event.target as Node) && !filterButton.current?.contains(event.target as Node)) {
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

  const defaultFilter = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    let updatedExpenses = expenses;
    setFormFilter({ ...formFilter, category: "", start: getFirstDayOfMonth(), end: getLastDayOfMonth() })
    
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
