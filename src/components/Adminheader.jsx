import { useNavigate } from "react-router-dom";

function Adminheader() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const userName = user?.name;
  const firstLetter = userName?.charAt(0)?.toUpperCase();

  // ✅ Logout function
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/admin/login");
  };

  return (
    <header className="admin-header">
      <div className="header-content">
        <div className="header-left">
          <h1 className="page-title">Dashboard Overview</h1>
        </div>

        <div className="header-right">
          <div className="header-actions">
            <button className="notification-btn">
  <i className="fa-solid fa-bell"></i>
  <span className="notification-badge">3</span>
</button>


            <div className="user-menu">
              <div className="user-avatar">{firstLetter}</div>

              <div className="user-info">
                <span className="user-name">{userName}</span>
                <span className="user-role">Administrator</span>
              </div>
            </div>

            {/* ✅ Logout Button */}
            <button className="logout-btn" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt"></i>
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Adminheader;
