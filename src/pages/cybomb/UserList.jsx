import React from 'react'
export default function UserList(){
  return (
    <div>
      <h3>Users / List</h3>
      <div className="card" style={{marginTop:12}}>
        <p className="small">Example user table (static)</p>
        <table style={{width:'100%',marginTop:8}}>
          <thead>
            <tr><th>Name</th><th>Email</th><th>Role</th></tr>
          </thead>
          <tbody>
            <tr><td>John Doe</td><td>john@example.com</td><td>Admin</td></tr>
            <tr><td>Jane Smith</td><td>jane@example.com</td><td>Staff</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
