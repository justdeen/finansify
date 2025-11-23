interface SettingsProps {
  user: any; // You can make this more strict if you have a User type
}

export default function Reports({user}: SettingsProps) {
  return (
    <div>
      <h2
        style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}
        className="heading">
        <span>Reports</span>
        <img
          onContextMenu={(e) => e.preventDefault()}
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
      {/* <h2>Reports (Charts will go here later)</h2> */}
      
      <div style={{marginTop: "100px"}} className="flex flex-col justify-center items-center">
        <h2 className="text-center font-semibold mb-2">I promise I'll be back with more features 😊</h2>
        <img
          onContextMenu={(e) => e.preventDefault()}
          src="/src/assets/blockchain.png"
          style={{
            width: "150px",
            marginRight: "5px",
            height: "150px",
          }}
          alt=""
        />
        {/* <div
              style={{
                fontSize: "17px",
                fontWeight: "500",
                color: "#1677FF",
                display: "inline",
              }}>
              Financify
            </div> */}
      </div>
    </div>
  );
}
