import React from 'react'
export default function ProductList(){
  return (
    <div>
      <h3>Products / List</h3>
      <div className="card" style={{marginTop:12}}>
        <p className="small">Static product list</p>
        <ul>
          <li>Product A</li>
          <li>Product B</li>
        </ul>
      </div>
    </div>
  )
}
