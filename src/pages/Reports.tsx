interface SettingsProps {
  user: any; // You can make this more strict if you have a User type
}

export default function Reports({user}: SettingsProps) {
  return (
    <div className="px-2">
      <h2
        style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}
        className="heading">
        <span>Reports</span>
        <img
          onContextMenu={(e) => e.preventDefault()}
          src="report.png"
          style={{
            width: "26px",
            height: "26px",
            display: "inline",
            marginLeft: "10px",
          }}
          alt=""
        />
      </h2>
      
      <div style={{marginTop: "100px"}} className="flex flex-col justify-center items-center">
        <h2 className="text-center font-semibold mb-2">I promise I'll be back with more features 😊</h2>
        <img
          onContextMenu={(e) => e.preventDefault()}
          src="blockchain.png"
          style={{
            width: "150px",
            marginRight: "5px",
            height: "150px",
          }}
          alt=""
        />
      </div>
    </div>
  );
}
