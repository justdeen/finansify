interface SettingsProps {
  user: any; // You can make this more strict if you have a User type
}

export default function Reports({user}: SettingsProps) {
  return <h2>Reports (Charts will go here later)</h2>;
}
