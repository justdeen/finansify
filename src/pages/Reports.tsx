interface SettingsProps {
  user: any; // You can make this more strict if you have a User type
}

export default function Reports({user}: SettingsProps) {
  return (
    <div>
      <h2 style={{display: "flex", justifyContent: "space-between", alignItems: 'center'}} className="heading">
          <span>Reports</span>
          <img
            src="/src/assets/report.png"
            style={{
              width: "26px",
              height: "26px",
              display: "inline",
              marginLeft: "10px",
            }}
            alt=""
          />
        </h2>
      <h2>Reports (Charts will go here later)</h2>
    </div>
  )
}
