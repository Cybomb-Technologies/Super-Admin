import React from 'react'
export default function OrderList(){
  return (
    <div>
      <h3>Orders / List</h3>
      <div className="card" style={{marginTop:12}}>
        <p className="small">Order entries</p>
        <ul>
          <li>Order #1001</li>
          <li>Order #1002</li>
        </ul>
      </div>
    </div>
  )
}
