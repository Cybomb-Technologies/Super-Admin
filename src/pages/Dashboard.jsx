import React from 'react'
export default function Dashboard(){
  return (
    <div>
      <h3>Dashboard</h3>
      <div className="grid" style={{marginTop:12}}>
        <div className="card">Total Users<br/><strong>128</strong></div>
        <div className="card">Total Orders<br/><strong>54</strong></div>
        <div className="card">Products<br/><strong>230</strong></div>
      </div>
    </div>
  )
}
