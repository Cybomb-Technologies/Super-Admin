import React from 'react'
export default function ProductAdd(){
  return (
    <div>
      <h3>Products / Add</h3>
      <div className="card" style={{marginTop:12}}>
        <p className="small">Add product form</p>
        <input style={{width:'100%',padding:8,marginTop:6,borderRadius:6}} placeholder="Product name"/>
        <br/><br/>
        <button style={{padding:'8px 12px',borderRadius:6}}>Add</button>
      </div>
    </div>
  )
}
